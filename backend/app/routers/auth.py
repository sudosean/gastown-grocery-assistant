from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas
from ..auth import hash_password, verify_password, create_access_token, get_current_user
from ..database import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=schemas.TokenResponse, status_code=status.HTTP_201_CREATED)
def register(body: schemas.RegisterRequest, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = models.User(email=body.email, hashed_password=hash_password(body.password))
    db.add(user)
    db.flush()

    profile = models.Profile(id=user.id)
    db.add(profile)
    db.commit()
    db.refresh(user)

    return schemas.TokenResponse(
        access_token=create_access_token(user.id),
        user=schemas.UserOut(id=user.id, email=user.email),
    )


@router.post("/login", response_model=schemas.TokenResponse)
def login(body: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == body.email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return schemas.TokenResponse(
        access_token=create_access_token(user.id),
        user=schemas.UserOut(id=user.id, email=user.email),
    )


@router.get("/me", response_model=schemas.UserOut)
def me(current_user: models.User = Depends(get_current_user)):
    return schemas.UserOut(id=current_user.id, email=current_user.email)
