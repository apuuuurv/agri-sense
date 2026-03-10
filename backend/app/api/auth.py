# backend/app/api/auth.py
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta

from app.models.farmer import FarmerSignup, FarmerResponse, Token
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings

router = APIRouter()

@router.post("/signup", response_model=FarmerResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_data: FarmerSignup):
    db = get_db()
    
    # 1. Check if email already exists
    existing_user = await db["farmers"].find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # 2. Hash the password
    hashed_pwd = get_password_hash(user_data.password)
    
    # 3. Prepare minimal data for Database
    farmer_dict = {
        "full_name": user_data.full_name,
        "email": user_data.email,
        "hashed_password": hashed_pwd,
        # Default empty lists/booleans for when they fill it out later
        "primary_crops": [],
        "documents_uploaded": [],
        "is_differently_abled": False,
        "bank_account_linked": False
    }
    
    # 4. Save to DB
    result = await db["farmers"].insert_one(farmer_dict)
    
    # 5. Fetch and return
    new_user = await db["farmers"].find_one({"_id": result.inserted_id})
    new_user["_id"] = str(new_user["_id"])
    return new_user

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = get_db()
    
    # In FastAPI OAuth2, the 'username' field will now hold our EMAIL
    user = await db["farmers"].find_one({"email": form_data.username})
    
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # Generate JWT Token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user["_id"])}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}