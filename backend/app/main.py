import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from .routers import auth, profile, meal_plan, pantry, grocery

load_dotenv()

app = FastAPI(title="Grocery Assistant API", version="1.0.0")

allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(meal_plan.router)
app.include_router(pantry.router)
app.include_router(grocery.router)


@app.get("/health")
def health():
    return {"status": "ok"}
