from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
from jose import jwt, JWTError

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Verifies the Supabase JWT token and returns the user payload.
    """
    token = credentials.credentials
    secret = os.getenv("JWT_SECRET")
    
    if not secret:
        # If secret is not configured, we might want to fail open or closed.
        # Faluire closed is safer.
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="JWT_SECRET is not configured"
        )

    try:
        # Supabase uses HS256 by default for their JWTs
        payload = jwt.decode(token, secret, algorithms=["HS256"], audience="authenticated")
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
