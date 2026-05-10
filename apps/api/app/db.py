from pymongo import MongoClient, ASCENDING, DESCENDING

from .config import settings

client = MongoClient(settings.mongodb_uri, appname="Voyage")
db = client[settings.mongodb_db]

sessions_coll = db["sessions"]
messages_coll = db["messages"]
users_coll = db["users"]


def init_indexes() -> None:
    messages_coll.create_index([("session_id", ASCENDING), ("created_at", ASCENDING)])
    sessions_coll.create_index([("user_id", ASCENDING), ("updated_at", DESCENDING)])
    users_coll.create_index([("email", ASCENDING)], unique=True)
