import json
import os
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import anthropic
from .. import models, schemas
from ..auth import get_current_user
from ..database import get_db

router = APIRouter(tags=["meal_plan"])

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


@router.post("/api/meal-plan/generate", response_model=schemas.WeeklyMealPlan)
def generate_meal_plan(
    body: schemas.GenerateMealPlanRequest,
    current_user: models.User = Depends(get_current_user),
):
    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    dietary_context = (
        f"Dietary restrictions/allergies: {', '.join(body.dietaryRestrictions)}."
        if body.dietaryRestrictions
        else "No dietary restrictions."
    )
    pantry_context = (
        f"Available pantry items to incorporate: {', '.join(body.pantryItems)}."
        if body.pantryItems
        else "No specific pantry items to incorporate."
    )

    prompt = f"""Generate a personalized 7-day meal plan for a household of {body.householdSize} people.

Context:
- {dietary_context}
- Weekly budget: ${body.weeklyBudget}
- Maximum cooking time per meal: {body.maxCookingTime} minutes
- {pantry_context}

Return a JSON object with this exact structure:
{{
  "days": [
    {{
      "day": "Monday",
      "breakfast": {{
        "name": "meal name",
        "description": "brief description (1-2 sentences)",
        "estimatedCost": 5.50,
        "prepTime": 10
      }},
      "lunch": {{ ... }},
      "dinner": {{ ... }}
    }},
    ... (7 days total: Monday through Sunday)
  ],
  "totalEstimatedCost": 120.00
}}

Requirements:
- estimatedCost is per household (not per person) in USD
- prepTime is in minutes
- Keep meals varied and practical
- Use pantry items where sensible
- Stay within the budget (totalEstimatedCost should be <= {body.weeklyBudget})
- Respect all dietary restrictions strictly
- Keep prep times within the {body.maxCookingTime}-minute limit

Return ONLY the JSON object, no other text."""

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        system="You are a professional meal planner and nutritionist. You create practical, balanced meal plans that fit household budgets and dietary needs. Always respond with valid JSON only.",
        messages=[{"role": "user", "content": prompt}],
    )

    text = message.content[0].text.strip()
    import re
    json_match = re.search(r"\{[\s\S]*\}", text)
    if not json_match:
        raise HTTPException(status_code=500, detail="Could not parse meal plan from AI response")

    data = json.loads(json_match.group())
    if not data.get("days") or len(data["days"]) != 7:
        raise HTTPException(status_code=500, detail="Invalid meal plan structure from AI")

    days = []
    for i, day_name in enumerate(DAYS):
        d = data["days"][i] if i < len(data["days"]) else {}
        empty = schemas.MealSchema(name="TBD", description="", estimatedCost=0, prepTime=0)
        days.append(schemas.MealPlanDay(
            day=day_name,
            breakfast=schemas.MealSchema(**d["breakfast"]) if d.get("breakfast") else empty,
            lunch=schemas.MealSchema(**d["lunch"]) if d.get("lunch") else empty,
            dinner=schemas.MealSchema(**d["dinner"]) if d.get("dinner") else empty,
        ))

    return schemas.WeeklyMealPlan(
        days=days,
        totalEstimatedCost=data.get("totalEstimatedCost", 0),
        generatedAt=datetime.utcnow().isoformat(),
    )


@router.post("/api/meals/swap", response_model=schemas.MealSchema)
def swap_meal(
    body: schemas.SwapMealRequest,
    current_user: models.User = Depends(get_current_user),
):
    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    dietary_context = (
        f"Dietary restrictions/allergies: {', '.join(body.dietaryRestrictions)}."
        if body.dietaryRestrictions
        else "No dietary restrictions."
    )

    prompt = f"""Suggest a replacement {body.mealType} meal for {body.day}.

Context:
- Household size: {body.householdSize}
- {dietary_context}
- Current meal to replace: "{body.currentMeal.name}" (user disliked: {body.dislikedMeal})
- Target cost: ~${body.currentMeal.estimatedCost} (similar budget)
- Target prep time: ~{body.currentMeal.prepTime} minutes

Return a JSON object:
{{
  "name": "meal name",
  "description": "brief description (1-2 sentences)",
  "estimatedCost": 8.00,
  "prepTime": 20
}}

The replacement must:
- Be different from "{body.dislikedMeal}"
- Respect all dietary restrictions
- Be a {body.mealType} appropriate for the time of day
- Have similar cost and prep time as the original

Return ONLY the JSON object, no other text."""

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=512,
        system="You are a professional meal planner. Suggest practical alternative meals. Always respond with valid JSON only.",
        messages=[{"role": "user", "content": prompt}],
    )

    text = message.content[0].text.strip()
    import re
    json_match = re.search(r"\{[\s\S]*\}", text)
    if not json_match:
        raise HTTPException(status_code=500, detail="Could not parse meal from AI response")

    return schemas.MealSchema(**json.loads(json_match.group()))
