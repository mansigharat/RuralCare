from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
import uuid
from models.user import UserRole


class UserRegister(BaseModel):
    name: str
    phone: str
    password: str
    role: UserRole = UserRole.citizen
    email: Optional[EmailStr] = None


class UserLogin(BaseModel):
    phone: str
    password: str


class UserOut(BaseModel):
    id: uuid.UUID
    name: str
    phone: str
    email: Optional[str] = None
    role: UserRole
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRole
