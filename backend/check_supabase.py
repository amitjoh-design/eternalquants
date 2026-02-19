from services.supabase_client import get_supabase
import logging

logging.basicConfig(level=logging.DEBUG)

try:
    print("Connecting to Supabase...")
    supabase = get_supabase()
    print("Querying models...")
    response = supabase.table("models").select("id").limit(1).execute()
    print("Success!")
    print(response.data)
except Exception as e:
    print(f"Error: {e}")
    # import traceback
    # traceback.print_exc()
