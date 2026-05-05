from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr


# Auth
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# Profile
class ProfileResponse(BaseModel):
    id: str
    full_name: Optional[str] = None
    household_size: int = 2
    dietary_preferences: List[str] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    household_size: Optional[int] = None
    dietary_preferences: Optional[List[str]] = None


# Meal Plan
class MealSchema(BaseModel):
    name: str
    description: str
    estimatedCost: float
    prepTime: int


class MealPlanDay(BaseModel):
    day: str
    breakfast: MealSchema
    lunch: MealSchema
    dinner: MealSchema


class WeeklyMealPlan(BaseModel):
    days: List[MealPlanDay]
    totalEstimatedCost: float
    generatedAt: str


class GenerateMealPlanRequest(BaseModel):
    householdSize: int
    dietaryRestrictions: List[str] = []
    weeklyBudget: float
    maxCookingTime: int
    pantryItems: List[str] = []


class SwapMealRequest(BaseModel):
    day: str
    mealType: str
    currentMeal: MealSchema
    householdSize: int
    dietaryRestrictions: List[str] = []
    dislikedMeal: str


# Pantry
class PantryItemCreate(BaseModel):
    name: str
    quantity: float = 1
    unit: Optional[str] = None
    category: Optional[str] = None
    expiry_date: Optional[date] = None


class PantryItemUpdate(BaseModel):
    name: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    category: Optional[str] = None
    expiry_date: Optional[date] = None


class PantryItemResponse(BaseModel):
    id: str
    user_id: str
    name: str
    quantity: float
    unit: Optional[str] = None
    category: Optional[str] = None
    expiry_date: Optional[date] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ParsePantryRequest(BaseModel):
    text: str


class ParsedPantryItem(BaseModel):
    name: str
    quantity: float
    unit: Optional[str] = None
    category: str


class ParsePantryResponse(BaseModel):
    items: List[ParsedPantryItem]


# Grocery List
class GroceryItem(BaseModel):
    name: str
    quantity: str
    section: str


class GrocerySection(BaseModel):
    name: str
    items: List[GroceryItem]


class GroceryListResponse(BaseModel):
    sections: List[GrocerySection]
    generatedAt: str


class GenerateGroceryListRequest(BaseModel):
    mealPlan: WeeklyMealPlan
    pantryItems: List[str] = []
