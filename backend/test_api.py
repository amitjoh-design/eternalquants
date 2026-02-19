import urllib.request
import urllib.error

try:
    with urllib.request.urlopen('http://localhost:8000/api/models/') as response:
        print(f"Status: {response.status}")
        print(f"Content: {response.read().decode()}")
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code}")
    print(f"Content: {e.read().decode()}")
except Exception as e:
    print(f"Error: {e}")
