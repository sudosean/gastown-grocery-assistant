import json
import os
import re
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
import anthropic
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter(prefix="/api/grocery-list", tags=["grocery"])


@router.post("", response_model=schemas.GroceryListResponse)
def generate_grocery_list(
    body: schemas.GenerateGroceryListRequest,
    current_user: models.User = Depends(get_current_user),
):
    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    meal_summary = "\n".join(
        f"{d.day}: {d.breakfast.name}, {d.lunch.name}, {d.dinner.name}"
        for d in body.mealPlan.days
    )
    pantry_context = (
        f"Pantry items already on hand (subtract these from the list): {', '.join(body.pantryItems)}"
        if body.pantryItems
        else "No pantry items to subtract."
    )

    prompt = f"""You are a grocery list assistant. Given a 7-day meal plan, produce a consolidated shopping list.

Meal plan:
{meal_summary}

{pantry_context}

Instructions:
- Identify all ingredients needed for every meal
- Aggregate duplicates (e.g. 3 meals needing onions → "4 medium onions")
- Subtract pantry items the household already has
- Group remaining items by store section: Produce, Dairy & Eggs, Meat & Seafood, Grains & Pasta, Canned & Jarred, Frozen, Spices & Condiments, Other
- Only include sections that have items
- Quantities should be practical (cups, oz, lbs, units, etc.)

Return ONLY a JSON object with this structure:
{{
  "sections": [
    {{
      "name": "Produce",
      "items": [
        {{ "name": "yellow onions", "quantity": "4 medium", "section": "Produce" }},
        {{ "name": "garlic", "quantity": "1 head", "section": "Produce" }}
      ]
    }}
  ]
}}"""

    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=2048,
        system="You are a grocery list assistant. Respond with valid JSON only.",
        messages=[{"role": "user", "content": prompt}],
    )

    text = message.content[0].text
    json_match = re.search(r"\{[\s\S]*\}", text)
    if not json_match:
        raise HTTPException(status_code=500, detail="Could not parse grocery list from AI")

    parsed = json.loads(json_match.group())
    return schemas.GroceryListResponse(
        sections=parsed.get("sections", []),
        generatedAt=datetime.utcnow().isoformat(),
    )
