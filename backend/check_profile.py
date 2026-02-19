import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(url, key)

user_id = "0cc22b9b-5686-44d0-976e-7402de85089d"

try:
    response = supabase.table("profiles").select("*").eq("id", user_id).execute()
    if response.data:
        print(f"Profile found: {response.data[0]}")
    else:
        print("Profile NOT found.")
        # Optional: create it if missing
        print("Attempting to create profile...")
        supabase.table("profiles").insert({"id": user_id, "username": "amit", "full_name": "amit"}).execute()
        print("Profile created.")

except Exception as e:
    print(f"Error checking/creating profile: {e}")
