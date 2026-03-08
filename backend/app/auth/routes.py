"""
Auth endpoints: register, login, me, logout.
File: backend/app/auth/routes.py
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from app.database import get_db
from app.auth.auth_service import (
    create_user, authenticate_user,
    create_token, get_current_user
)
from app.auth.models import User

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    email:    str
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    username:     str
    email:        str


@router.post("/register", response_model=TokenResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if len(req.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be 8+ characters")
    user  = create_user(db, req.email, req.username, req.password)
    token = create_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, username=user.username, email=user.email)


@router.post("/login", response_model=TokenResponse)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # OAuth2PasswordRequestForm uses 'username' field — we treat it as email
    user  = authenticate_user(db, form.username, form.password)
    token = create_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, username=user.username, email=user.email)


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id":         current_user.id,
        "email":      current_user.email,
        "username":   current_user.username,
        "is_admin":   current_user.is_admin,
        "created_at": current_user.created_at.isoformat(),
        "last_login": current_user.last_login.isoformat() if current_user.last_login else None,
    }


@router.post("/logout")
def logout():
    # JWT is stateless — client just deletes token
    return {"message": "Logged out. Delete your token on the client."}