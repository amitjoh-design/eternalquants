from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, BackgroundTasks
from typing import Optional
from services.supabase_client import get_supabase
from services.modal_runner import run_modal_job
from services.auth import get_current_user
import shutil

router = APIRouter()

@router.post("/upload")
async def upload_model(
    background_tasks: BackgroundTasks,
    python_file: UploadFile = File(...),
    data_file: UploadFile = File(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    category: str = Form(...),
    timeseries_name: str = Form(...),
    asset_class: str = Form(...),
    user: dict = Depends(get_current_user)
):
    user_id = user.get("sub") # Supabase User ID is usually in 'sub' claim
    supabase = get_supabase()
    
    # 1. Upload files to Supabase Storage
    python_path = f"{user_id}/{python_file.filename}"
    data_path = f"{user_id}/{data_file.filename}"
    
    # Read file content safely
    python_content = await python_file.read()
    data_content = await data_file.read()
    
    try:
        supabase.storage.from_("model-files").upload(python_path, python_content)
        supabase.storage.from_("data-files").upload(data_path, data_content)
    except Exception as e:
        print(f"Storage upload warning: {e}") 
        # Proceeding as it might be an update or double upload which Supabase handles gracefully or throws specific error

    # 2. Insert record into DB
    model_data = {
        "user_id": user_id,
        "title": title,
        "description": description,
        "category": category,
        "timeseries_name": timeseries_name,
        "asset_class": asset_class,
        "status": "pending",
        "python_file_url": python_path,
        "data_file_url": data_path
    }
    
    response = supabase.table("models").insert(model_data).execute()
    
    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to create model record")
        
    model_id = response.data[0]['id']
    
    # 3. Trigger Modal Job in Background
    background_tasks.add_task(process_model_execution, model_id, python_content.decode("utf-8"), data_content)
    
    return {"message": "Model uploaded and processing started", "model_id": model_id}

# Helper for background task
def process_model_execution(model_id: str, python_code: str, data_csv: bytes):
    supabase = get_supabase()
    result = run_modal_job(python_code, data_csv)
    
    if result.get("success"):
       # Assuming result['metrics'] matches our DB schema for model_metrics
       metrics = result.get('metrics', {})
       supabase.table("model_metrics").insert({
           "model_id": model_id,
           **metrics
       }).execute()
       supabase.table("models").update({"status": "completed"}).eq("id", model_id).execute()
    else:
       error_msg = result.get("error", "Unknown error")
       supabase.table("models").update({"status": "failed", "description": error_msg}).eq("id", model_id).execute()

@router.get("/")
async def list_models():
    supabase = get_supabase()
    response = supabase.table("models").select("*, model_metrics(*), profiles(username, avatar_url)").eq("status", "completed").execute()
    return response.data

@router.get("/{model_id}")
async def get_model(model_id: str):
    supabase = get_supabase()
    response = supabase.table("models").select("*, model_metrics(*), profiles(*), comments(*, profiles(username)), ratings(*, profiles(username))").eq("id", model_id).single().execute()
    return response.data
