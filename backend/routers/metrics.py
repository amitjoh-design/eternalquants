from fastapi import APIRouter

router = APIRouter()

@router.get("/{model_id}")
def get_metrics(model_id: str):
    return {"message": "Metrics for model " + model_id}
