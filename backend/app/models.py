import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Numeric, Boolean, Date, DateTime, ForeignKey, Text, SmallInteger
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from .database import Base


def gen_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("Profile", back_populates="user", uselist=False)
    meal_plans = relationship("MealPlan", back_populates="user")
    pantry_items = relationship("PantryItem", back_populates="user")
    grocery_lists = relationship("GroceryList", back_populates="user")


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    full_name = Column(Text)
    household_size = Column(SmallInteger, default=2)
    dietary_preferences = Column(ARRAY(Text), default=[])
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")


class MealPlan(Base):
    __tablename__ = "meal_plans"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(Text)
    week_start = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="meal_plans")
    days = relationship("MealPlanDay", back_populates="meal_plan", cascade="all, delete-orphan")


class MealPlanDay(Base):
    __tablename__ = "meal_plan_days"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    meal_plan_id = Column(UUID(as_uuid=False), ForeignKey("meal_plans.id", ondelete="CASCADE"), nullable=False)
    day_of_week = Column(SmallInteger, nullable=False)
    meal_type = Column(String, nullable=False)
    recipe_name = Column(Text, nullable=False)
    servings = Column(SmallInteger, default=2)
    notes = Column(Text)

    meal_plan = relationship("MealPlan", back_populates="days")


class PantryItem(Base):
    __tablename__ = "pantry_items"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(Text, nullable=False)
    quantity = Column(Numeric, nullable=False, default=1)
    unit = Column(Text)
    category = Column(Text)
    expiry_date = Column(Date)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="pantry_items")


class GroceryList(Base):
    __tablename__ = "grocery_lists"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    meal_plan_id = Column(UUID(as_uuid=False), ForeignKey("meal_plans.id", ondelete="SET NULL"), nullable=True)
    name = Column(Text, nullable=False, default="Shopping List")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="grocery_lists")
    items = relationship("GroceryListItem", back_populates="grocery_list", cascade="all, delete-orphan")


class GroceryListItem(Base):
    __tablename__ = "grocery_list_items"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    grocery_list_id = Column(UUID(as_uuid=False), ForeignKey("grocery_lists.id", ondelete="CASCADE"), nullable=False)
    name = Column(Text, nullable=False)
    quantity = Column(Numeric, nullable=False, default=1)
    unit = Column(Text)
    category = Column(Text)
    checked = Column(Boolean, nullable=False, default=False)
    notes = Column(Text)

    grocery_list = relationship("GroceryList", back_populates="items")
