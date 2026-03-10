from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

class Database:
    client: AsyncIOMotorClient = None
    db = None

db_instance = Database()

async def connect_to_mongo():
    print("🚀 Connecting to MongoDB...")
    db_instance.client = AsyncIOMotorClient(settings.MONGO_URI)
    db_instance.db = db_instance.client[settings.DATABASE_NAME]
    print(f"✅ Successfully connected to database: {settings.DATABASE_NAME}!")

async def close_mongo_connection():
    print("🛑 Closing MongoDB connection...")
    if db_instance.client:
        db_instance.client.close()
        print("✅ MongoDB connection closed.")

# Helper function to get the database instance anywhere in your app
def get_db():
    return db_instance.db