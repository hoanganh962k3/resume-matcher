"""
Authentication API endpoints for user registration and login.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.core.auth_dependencies import get_current_user_optional, get_current_user_required
from app.schemas.pydantic.auth import (
    UserRegister,
    UserLogin,
    UserWithToken,
    UserResponse,
    AuthCheckResponse
)
from app.services.auth_service import (
    AuthService,
    AuthenticationError,
    UserAlreadyExistsError
)
from app.models.user import User


router = APIRouter(prefix="/auth", tags=["Authentication"])
auth_service = AuthService()


@router.post(
    "/register",
    response_model=UserWithToken,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Create a new user account with email and password. Returns user data and access token."
)
async def register(
    user_data: UserRegister,
    db: AsyncSession = Depends(get_db_session)
):
    """
    Register a new user account.
    
    - **email**: Valid email address (will be used as username)
    - **password**: Password (minimum 6 characters)
    - **name**: User's display name
    """
    try:
        user = await auth_service.register_user(db, user_data)
        
        # Create access token (convert UUID to string)
        access_token = auth_service.create_access_token(
            data={"sub": user.email, "user_id": str(user.id)}
        )
        
        return UserWithToken(
            user=UserResponse.from_orm(user),
            access_token=access_token,
            token_type="bearer"
        )
    except UserAlreadyExistsError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post(
    "/login",
    response_model=UserWithToken,
    summary="Login user",
    description="Authenticate user with email and password. Returns user data and access token."
)
async def login(
    login_data: UserLogin,
    db: AsyncSession = Depends(get_db_session)
):
    """
    Authenticate a user and return access token.
    
    - **email**: User email address
    - **password**: User password
    """
    try:
        user = await auth_service.authenticate_user(db, login_data)
        
        # Create access token (convert UUID to string)
        access_token = auth_service.create_access_token(
            data={"sub": user.email, "user_id": str(user.id)}
        )
        
        return UserWithToken(
            user=UserResponse.from_orm(user),
            access_token=access_token,
            token_type="bearer"
        )
    except AuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user",
    description="Get the currently authenticated user's information. Requires authentication."
)
async def get_current_user(
    current_user: User = Depends(get_current_user_required)
):
    """
    Get the currently authenticated user's information.
    Requires valid JWT token in Authorization header.
    """
    return UserResponse.from_orm(current_user)


@router.get(
    "/check",
    response_model=AuthCheckResponse,
    summary="Check authentication status",
    description="Check if the user is authenticated. Works with or without token."
)
async def check_auth(
    current_user: User = Depends(get_current_user_optional)
):
    """
    Check authentication status.
    Returns user info if authenticated, or indicates guest status.
    """
    if current_user:
        return AuthCheckResponse(
            authenticated=True,
            user=UserResponse.from_orm(current_user)
        )
    return AuthCheckResponse(
        authenticated=False,
        message="Using as guest"
    )
