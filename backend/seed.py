import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal
from app.models import User, Profile, gen_uuid
from app.auth import hash_password
from dotenv import load_dotenv

load_dotenv()

EMAIL = "dev@example.com"
PASSWORD = "password"


def seed():
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == EMAIL).first()
        if existing:
            print(f"Dev user already exists: {EMAIL}")
            return

        user = User(id=gen_uuid(), email=EMAIL, hashed_password=hash_password(PASSWORD))
        db.add(user)
        db.flush()

        profile = Profile(id=user.id, household_size=2, dietary_preferences=[])
        db.add(profile)
        db.commit()

        print(f"Dev user created:")
        print(f"  Email:    {EMAIL}")
        print(f"  Password: {PASSWORD}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
