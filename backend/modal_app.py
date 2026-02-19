import modal
import io
import json

stub = modal.Stub("eternalquants-executor")

image = (
    modal.Image.debian_slim()
    .pip_install("pandas", "numpy")
)

@stub.function(image=image, timeout=60, memory=512)
def execute_strategy(code_str: str, csv_data: bytes):
    """
    Executes user strategy in a sandboxed environment.
    """
    import pandas as pd
    
    try:
        # Load data
        df = pd.read_csv(io.BytesIO(csv_data))
        
        # Define the execution scope
        local_scope = {}
        
        # Execute the user code to define the 'run_strategy' function
        exec(code_str, {}, local_scope)
        
        if 'run_strategy' not in local_scope:
            return {"error": "Function 'run_strategy' not found in code."}
        
        run_strategy = local_scope['run_strategy']
        
        # Run the strategy
        trades = run_strategy(df)
        
        # Basic validation of return type
        if not isinstance(trades, list):
             return {"error": "Strategy must return a list of trades."}
             
        # Create a simplified result to return (avoiding serialization issues with complex objects)
        # In a real app, we might calculate metrics INSIDE the sandbox to ensure consistency
        # For now, we return trades to be processed by the backend metrics calculator
        return {"trades": trades, "success": True}

    except Exception as e:
        return {"error": str(e), "success": False}
