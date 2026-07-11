from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, Date, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

class Client(Base):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    address = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    products = relationship("ClientProduct", back_populates="client")
    amcs = relationship("AMC", back_populates="client")

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String)
    price = Column(Float)
    description = Column(String)
    
    clients = relationship("ClientProduct", back_populates="product")

class ClientProduct(Base):
    __tablename__ = "client_products"
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    purchase_date = Column(Date)
    
    client = relationship("Client", back_populates="products")
    product = relationship("Product", back_populates="clients")
    amcs = relationship("AMC", back_populates="client_product")

class AMC(Base):
    __tablename__ = "amcs"
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"))
    client_product_id = Column(Integer, ForeignKey("client_products.id"))
    start_date = Column(Date)
    end_date = Column(Date)
    amount = Column(Float)
    status = Column(String) # Active, Expired, Pending, Renewed
    
    client = relationship("Client", back_populates="amcs")
    client_product = relationship("ClientProduct", back_populates="amcs")

class Lead(Base):
    __tablename__ = "leads"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String)
    phone = Column(String)
    status = Column(String) # New, Contacted, Converted, Lost
    notes = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
