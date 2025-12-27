"""
Script to reset the database - drops all tables and recreates them.
Use this when you need a fresh database or after schema changes.
"""
import asyncio
import os
import sys

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import async_engine, Base
from app.models import user, resume, job  # Import all models


async def reset_database():
    """Drop all tables and recreate them"""
    print("Dropping all tables...")
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    print("Creating all tables...")
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    print("Database reset complete!")


if __name__ == "__main__":
    print("WARNING: This will delete all data in the database!")
    response = input("Are you sure you want to continue? (yes/no): ")
    
    if response.lower() == 'yes':
        asyncio.run(reset_database())
    else:
        print("Database reset cancelled.")
