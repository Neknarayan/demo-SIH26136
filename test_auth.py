import urllib.request
import json

BASE = "http://127.0.0.1:8000"
print("Registering...")
req = urllib.request.Request(f"{BASE}/api/auth/register", method="POST", headers={"Content-Type": "application/json"})
data = json.dumps({
    "name": "Test User",
    "email": "test2@example.com",
    "password": "password123",
    "role": "startup",
    "startup_profile": {
        "startup_name": "Test Startup",
        "sector": "FinTech",
        "dpiit_status": True,
        "profile_text": "We do fintech stuff."
    }
}).encode()

try:
    with urllib.request.urlopen(req, data=data) as f:
        print("Reg status:", f.status)
        print("Reg response:", json.loads(f.read().decode()))
except urllib.error.HTTPError as e:
    print("Reg status:", e.code)
    print("Reg error:", e.read().decode())

print("Logging in...")
req2 = urllib.request.Request(f"{BASE}/api/auth/login", method="POST", headers={"Content-Type": "application/json"})
data2 = json.dumps({
    "email": "test2@example.com",
    "password": "password123"
}).encode()

try:
    with urllib.request.urlopen(req2, data=data2) as f:
        print("Login status:", f.status)
        print("Login response:", json.loads(f.read().decode()))
except urllib.error.HTTPError as e:
    print("Login status:", e.code)
    print("Login error:", e.read().decode())
