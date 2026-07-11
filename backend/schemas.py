from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import date, datetime

# Token
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# User
class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: str
    password: Optional[str] = None
    is_active: bool = True

class User(UserBase):
    id: int
    is_active: bool
    class Config:
        from_attributes = True

# Client
class ClientBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None

class ClientCreate(ClientBase):
    pass

class Client(ClientBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# Product
class ProductBase(BaseModel):
    name: str
    category: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    class Config:
        from_attributes = True

# ClientProduct
class ClientProductBase(BaseModel):
    client_id: int
    product_id: int
    purchase_date: date

class ClientProductCreate(ClientProductBase):
    pass

class ClientProduct(ClientProductBase):
    id: int
    class Config:
        from_attributes = True

# AMC
class AMCBase(BaseModel):
    client_id: int
    client_product_id: int
    start_date: date
    end_date: date
    amount: float
    status: str

class AMCCreate(BaseModel):
    client_id: int
    product_id: int
    start_date: date
    end_date: date
    amount: float
    status: str

class AMC(AMCBase):
    id: int
    class Config:
        from_attributes = True

class ReportRow(BaseModel):
    id: int
    client: Optional[str] = None
    product: Optional[str] = None
    status: Optional[str] = None
    amount: Optional[float] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

# Lead
class LeadBase(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    status: str = "New"
    notes: Optional[str] = None

class LeadCreate(LeadBase):
    pass

class Lead(LeadBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True
