import modal
from services.metrics_calculator import calculate_metrics

def run_modal_job(python_code: str, data_csv: bytes):
    """
    Triggers the Modal job to execute the user's strategy.
    """
    try:
        f = modal.Function.lookup("eternalquants-executor", "execute_strategy")
        result = f.remote(python_code, data_csv)
        
        if result.get("success"):
            trades = result.get("trades", [])
            metrics = calculate_metrics(trades)
            return {"status": "success", "metrics": metrics, "trades": trades}
        else:
            return {"status": "failed", "error": result.get("error")}
            
    except Exception as e:
        return {"status": "failed", "error": str(e)}
