from fastapi import APIRouter, Form, Depends
from services.supabase_client import get_supabase
from services.auth import get_current_user

router = APIRouter()

@router.post("/")
async def add_rating(
    model_id: str = Form(...),
    score: int = Form(...),
    comment: str = Form(None),
    user: dict = Depends(get_current_user)
):
    user_id = user.get("sub")
    supabase = get_supabase()
    data = {
        "model_id": model_id,
        "user_id": user_id,
        "score": score,
        "comment": comment
    }
    response = supabase.table("ratings").upsert(data).execute()
    return response.data

@router.post("/comment")
async def add_comment(
    model_id: str = Form(...),
    content: str = Form(...),
    user: dict = Depends(get_current_user)
):
    user_id = user.get("sub")
    supabase = get_supabase()
    data = {
        "model_id": model_id,
        "user_id": user_id,
        "content": content
    }
    response = supabase.table("comments").insert(data).execute()
    return response.data
