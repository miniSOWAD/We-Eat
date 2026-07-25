from passlib.context import CryptContext
from jose import jwt
pwd=CryptContext(schemes=['argon2'])
def hash_password(password): return pwd.hash(password)
def verify_password(password,hashed): return pwd.verify(password,hashed)
