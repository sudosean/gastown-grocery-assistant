import json
import os
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import anthropic
from .. import models, schemas
from ..auth import get_current_user
from ..database import get_db
from typing import List, Union

router = APIRouter(prefix="/api/pantry", tags=["pantry"])

CATEGORIES = [
    "Produce", "Dairy & Eggs", "Meat & Seafood", "Grains & Pasta",
    "Canned & Jarred", "Frozen", "Spices & Condiments", "Other",
]


@router.get("", response_model=dict)
def get_pantry(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    items = (
        db.query(models.PantryItem)
        .filter(models.PantryItem.user_id == current_user.id)
        .order_by(models.PantryItem.category, models.PantryItem.name)
        .all()
    )
    return {"items": [schemas.PantryItemResponse.model_validate(i) for i in items]}


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
def add_pantry_items(
    body: Union[schemas.PantryItemCreate, List[schemas.PantryItemCreate]],
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    items_data = body if isinstance(body, list) else [body]
    created = []
    for item_data in items_data:
        item = models.PantryItem(user_id=current_user.id, **item_data.model_dump())
        db.add(item)
        created.append(item)
    db.commit()
    for item in created:
        db.refresh(item)
    return {"items": [schemas.PantryItemResponse.model_validate(i) for i in created]}


@router.put("/{item_id}", response_model=dict)
def update_pantry_item(
    item_id: str,
    body: schemas.PantryItemUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = (
        db.query(models.PantryItem)
        .filter(models.PantryItem.id == item_id, models.PantryItem.user_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    item.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(item)
    return {"item": schemas.PantryItemResponse.model_validate(item)}


@router.delete("/{item_id}")
def delete_pantry_item(
    item_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = (
        db.query(models.PantryItem)
        .filter(models.PantryItem.id == item_id, models.PantryItem.user_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
    return {"ok": True}


@router.post("/parse", response_model=schemas.ParsePantryResponse)
def parse_pantry(
    body: schemas.ParsePantryRequest,
    current_user: models.User = Depends(get_current_user),
):
    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        system="You are a kitchen assistant. Parse ingredient descriptions into structured JSON. Return only valid JSON, no explanation.",
        messages=[{
            "role": "user",
            "content": f"""Parse this text into a list of pantry items: "{body.text}"

Return JSON in this exact format:
{{
  "items": [
    {{"name": "flour", "quantity": 2, "unit": "cups", "category": "Grains & Pasta"}},
    {{"name": "eggs", "quantity": 6, "unit": null, "category": "Dairy & Eggs"}}
  ]
}}

Rules:
- name: lowercase, singular form (e.g. "egg" not "eggs")
- quantity: numeric, default 1 if vague (e.g. "some" = 1)
- unit: standard cooking unit (cups, tbsp, tsp, oz, lb, g, kg, ml) or null for countable items
- category: must be one of: {', '.join(CATEGORIES)}""",
        }],
    )

    response_text = message.content[0].text if message.content[0].type == "text" else ""
    parsed = json.loads(response_text)
    return schemas.ParsePantryResponse(items=parsed["items"])
