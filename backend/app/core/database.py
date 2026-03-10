from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings


class Database:
    client: AsyncIOMotorClient | None = None
    db = None


db_instance = Database()


# ================================
# Connect to MongoDB
# ================================
async def connect_to_mongo():
    print("🚀 Connecting to MongoDB...")

    db_instance.client = AsyncIOMotorClient(settings.MONGO_URI)

    db_instance.db = db_instance.client[settings.DATABASE_NAME]

    print(f"✅ Successfully connected to database: {settings.DATABASE_NAME}!")


# ================================
# Close MongoDB Connection
# ================================
async def close_mongo_connection():
    print("🛑 Closing MongoDB connection...")

    if db_instance.client:
        db_instance.client.close()
        print("✅ MongoDB connection closed.")


# ================================
# Get Database Anywhere
# ================================
def get_db():
    return db_instance.db


# ================================
# Shortcut (optional but useful)
# ================================
def get_collection(name: str):
    return db_instance.db[name]