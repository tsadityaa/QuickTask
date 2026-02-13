import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from bson import ObjectId

load_dotenv()

app = FastAPI(title="QuickTask Analytics Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
client = MongoClient(os.getenv("MONGO_URI"))
db = client.get_default_database()
tasks_collection = db["tasks"]
users_collection = db["users"]


@app.api_route("/api/analytics/health", methods=["GET", "HEAD"])
def health_check():
    return {"status": "ok", "service": "analytics"}


@app.get("/api/analytics/stats/{user_id}")
def get_user_stats(user_id: str):
    """User Statistics Endpoint — aggregate stats for a user."""
    try:
        uid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    user = users_collection.find_one({"_id": uid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    pipeline = [
        {"$match": {"user": uid}},
        {
            "$group": {
                "_id": None,
                "totalTasks": {"$sum": 1},
                "completed": {
                    "$sum": {"$cond": [{"$eq": ["$status", "Completed"]}, 1, 0]}
                },
                "inProgress": {
                    "$sum": {"$cond": [{"$eq": ["$status", "In Progress"]}, 1, 0]}
                },
                "todo": {
                    "$sum": {"$cond": [{"$eq": ["$status", "Todo"]}, 1, 0]}
                },
                "highPriority": {
                    "$sum": {"$cond": [{"$eq": ["$priority", "High"]}, 1, 0]}
                },
                "mediumPriority": {
                    "$sum": {"$cond": [{"$eq": ["$priority", "Medium"]}, 1, 0]}
                },
                "lowPriority": {
                    "$sum": {"$cond": [{"$eq": ["$priority", "Low"]}, 1, 0]}
                },
            }
        },
    ]

    result = list(tasks_collection.aggregate(pipeline))

    if not result:
        return {
            "totalTasks": 0,
            "completed": 0,
            "inProgress": 0,
            "todo": 0,
            "highPriority": 0,
            "mediumPriority": 0,
            "lowPriority": 0,
            "completionRate": 0,
        }

    stats = result[0]
    del stats["_id"]
    total = stats["totalTasks"]
    stats["completionRate"] = round((stats["completed"] / total) * 100, 1) if total > 0 else 0
    return stats


@app.get("/api/analytics/productivity/{user_id}")
def get_productivity(user_id: str, days: int = 30):
    """Productivity Analysis Endpoint — task completion trends over time."""
    try:
        uid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    start_date = datetime.utcnow() - timedelta(days=days)

    pipeline = [
        {
            "$match": {
                "user": uid,
                "status": "Completed",
                "updatedAt": {"$gte": start_date},
            }
        },
        {
            "$group": {
                "_id": {
                    "$dateToString": {"format": "%Y-%m-%d", "date": "$updatedAt"}
                },
                "count": {"$sum": 1},
            }
        },
        {"$sort": {"_id": 1}},
    ]

    results = list(tasks_collection.aggregate(pipeline))

    # Fill in missing dates with 0
    date_map = {r["_id"]: r["count"] for r in results}
    daily_data = []
    current = start_date
    now = datetime.utcnow()
    while current <= now:
        date_str = current.strftime("%Y-%m-%d")
        daily_data.append({"date": date_str, "completed": date_map.get(date_str, 0)})
        current += timedelta(days=1)

    total_completed = sum(d["completed"] for d in daily_data)
    avg = round(total_completed / max(len(daily_data), 1), 2)

    return {
        "period": f"Last {days} days",
        "totalCompleted": total_completed,
        "averageCompletionsPerDay": avg,
        "dailyData": daily_data,
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
