from fastapi import APIRouter, Depends, HTTPException, Response, status
from pymongo.errors import DuplicateKeyError

from ..auth import (
    clear_auth_cookie,
    encode_token,
    get_current_user,
    hash_password,
    set_auth_cookie,
    verify_password,
)
from ..db import users_coll
from ..models import new_user, user_out
from ..schemas import AuthCredentials, UserOut

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=201)
def register(payload: AuthCredentials, response: Response):
    doc = new_user(email=payload.email, password_hash=hash_password(payload.password))
    try:
        users_coll.insert_one(doc)
    except DuplicateKeyError:
        raise HTTPException(status.HTTP_409_CONFLICT, "email already registered")
    set_auth_cookie(response, encode_token(doc["_id"]))
    return user_out(doc)


@router.post("/login", response_model=UserOut)
def login(payload: AuthCredentials, response: Response):
    doc = users_coll.find_one({"email": payload.email.lower().strip()})
    if not doc or not verify_password(payload.password, doc["password_hash"]):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "invalid email or password")
    set_auth_cookie(response, encode_token(doc["_id"]))
    return user_out(doc)


@router.post("/logout", status_code=204)
def logout(response: Response):
    clear_auth_cookie(response)


@router.get("/me", response_model=UserOut)
def me(user: dict = Depends(get_current_user)):
    return user_out(user)
