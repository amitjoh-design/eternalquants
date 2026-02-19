import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_KEY")

if not url or not key:
    print("Error: SUPABASE_URL or SUPABASE_SERVICE_KEY not found in environment variables.")
    exit(1)

supabase: Client = create_client(url, key)

email = "amitjoh@gmail.com"
password = "test@12345"
full_name = "amit"

print(f"Attempting to manage user: {email}")

try:
    # 1. Try to create the user
    user = supabase.auth.admin.create_user({
        "email": email,
        "password": password,
        "email_confirm": True,
        "user_metadata": {
            "full_name": full_name
        }
    })
    print(f"User created successfully!")
    print(f"ID: {user.user.id}")

except Exception as e:
    # 2. If creation fails (likely exists), find and update
    print(f"Creation failed/skipped: {e}")
    print("Attempting to find and update existing user...")
    
    try:
        users = supabase.auth.admin.list_users()
        target_user = None
        for u in users:
            if u.email == email:
                target_user = u
                break
        
        if target_user:
            print(f"Found existing user {target_user.id}. Updating...")
            updated_user = supabase.auth.admin.update_user_by_id(
                target_user.id,
                {
                    "password": password, 
                    "email_confirm": True, 
                    "user_metadata": {"full_name": full_name}
                }
            )
            print(f"User {email} updated successfully!")
            print(f"ID: {updated_user.user.id}")
        else:
            print("User already registered but could not be found in list.")
            
    except Exception as inner_e:
        print(f"Failed to update existing user: {inner_e}")
