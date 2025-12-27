"""
Authentication schemas for user registration, login, and token management.
"""
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID


class UserRegister(BaseModel):
    """Schema for user registration request"""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=6, description="User password (min 6 characters)")
    name: str = Field(..., min_length=1, description="User display name")


class UserLogin(BaseModel):
    """Schema for user login request"""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="User password")


class Token(BaseModel):
    """Schema for authentication token response"""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")


class TokenData(BaseModel):
    """Schema for decoded token data"""
    email: Optional[str] = None
    user_id: Optional[UUID] = None


class UserResponse(BaseModel):
    """Schema for user data response"""
    id: UUID
    email: str
    name: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserWithToken(BaseModel):
    """Schema for user registration/login response with token"""
    user: UserResponse
    access_token: str
    token_type: str = "bearer"


class AuthCheckResponse(BaseModel):
    """Schema for authentication check response"""
    authenticated: bool
    user: Optional[UserResponse] = None
    message: Optional[str] = None
