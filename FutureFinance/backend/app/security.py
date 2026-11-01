import os
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
import bcrypt

bearer = HTTPBearer()
SECRET = os.getenv('JWT_SECRET', 'development-secret')
ALG = 'HS256'

def hash_password(v: str) -> str:
    return bcrypt.hashpw(v.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(v: str, h: str) -> bool:
    try:
        return bcrypt.checkpw(v.encode('utf-8'), h.encode('utf-8'))
    except Exception:
        return False

def token(user_id):
    return jwt.encode({'sub': str(user_id), 'exp': datetime.now(timezone.utc) + timedelta(minutes=int(os.getenv('ACCESS_TOKEN_MINUTES', '480')))}, SECRET, algorithm=ALG)

def current_user_id(c: HTTPAuthorizationCredentials = Depends(bearer)):
    try:
        return int(jwt.decode(c.credentials, SECRET, algorithms=[ALG])['sub'])
    except (JWTError, KeyError, ValueError):
        raise HTTPException(401, 'Invalid or expired token')
