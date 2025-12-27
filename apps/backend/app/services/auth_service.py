"""
Authentication service for user registration, login, and JWT token management.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import bcrypt
import jwt
from jwt.exceptions import InvalidTokenError as JWTInvalidTokenError

from app.core.config import settings
from app.core.exceptions import ResumeMatcherException
from app.models.user import User
from app.schemas.pydantic.auth import (
    TokenData,
    UserLogin,
    UserRegister,
)


class AuthenticationError(ResumeMatcherException):
    """Raised when authentication fails"""
    pass


class UserAlreadyExistsError(ResumeMatcherException):
    """Raised when attempting to register with an existing email"""
    pass


class InvalidTokenError(ResumeMatcherException):
    """Raised when JWT token is invalid or expired"""
    pass


class AuthService:
    """Service for handling user authentication operations"""

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )

    @staticmethod
    def get_password_hash(password: str) -> str:
        """Hash a password."""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')

    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """
        Create a JWT access token.
        
        Args:
            data: Dictionary containing token payload data
            expires_delta: Optional expiration time delta
            
        Returns:
            Encoded JWT token string
        """
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(
                minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES
            )
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(
            to_encode, 
            settings.JWT_SECRET_KEY, 
            algorithm=settings.JWT_ALGORITHM
        )
        return encoded_jwt

    @staticmethod
    async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
        """Get user by email address."""
        result = await db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: UUID) -> Optional[User]:
        """Get user by ID."""
        result = await db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()

    async def register_user(
        self, 
        db: AsyncSession, 
        user_data: UserRegister
    ) -> User:
        """
        Register a new user.
        
        Args:
            db: Database session
            user_data: User registration data
            
        Returns:
            Created user object
            
        Raises:
            UserAlreadyExistsError: If user with email already exists
        """
        # Check if user already exists
        existing_user = await self.get_user_by_email(db, user_data.email)
        if existing_user:
            raise UserAlreadyExistsError(f"User with email {user_data.email} already exists")
        
        # Hash the password
        hashed_password = self.get_password_hash(user_data.password)
        
        # Create new user
        new_user = User(
            email=user_data.email,
            name=user_data.name,
            hashed_password=hashed_password
        )
        
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        
        return new_user

    async def authenticate_user(
        self,
        db: AsyncSession,
        login_data: UserLogin
    ) -> User:
        """
        Authenticate a user with email and password.
        
        Args:
            db: Database session
            login_data: Login credentials
            
        Returns:
            Authenticated user object
            
        Raises:
            AuthenticationError: If authentication fails
        """
        user = await self.get_user_by_email(db, login_data.email)
        
        if not user:
            raise AuthenticationError("Invalid email or password")
        
        if not self.verify_password(login_data.password, user.hashed_password):
            raise AuthenticationError("Invalid email or password")
        
        return user

    def decode_token(self, token: str) -> TokenData:
        """
        Decode and validate a JWT token.
        
        Args:
            token: JWT token string
            
        Returns:
            Decoded token data
            
        Raises:
            InvalidTokenError: If token is invalid or expired
        """
        try:
            payload = jwt.decode(
                token,
                settings.JWT_SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM]
            )
            email: str = payload.get("sub")
            user_id_str = payload.get("user_id")
            user_id = UUID(user_id_str) if user_id_str else None
            
            if email is None:
                raise InvalidTokenError("Invalid token payload")
            
            return TokenData(email=email, user_id=user_id)
        except JWTInvalidTokenError as e:
            raise InvalidTokenError(f"Invalid token: {str(e)}")
        except Exception as e:
            raise InvalidTokenError(f"Token decode error: {str(e)}")
