from fastapi import Request, APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from jose import jwt, JWTError
from models import Base, User, Itinerary, FavoritePlace, get_db, engine
import os
import requests
import boto3

load_dotenv()

router = APIRouter()
Base.metadata.create_all(bind=engine)

# Cognito setup
AWS_REGION = os.getenv("AWS_REGION")
COGNITO_USER_POOL_ID = os.getenv("COGNITO_USER_POOL_ID")
COGNITO_CLIENT_ID = os.getenv("COGNITO_CLIENT_ID")
print(AWS_REGION)
print(COGNITO_USER_POOL_ID)
print(COGNITO_CLIENT_ID)
print("----------------------------------------------------------------------------------------------------")
JWKS_URL = f"https://cognito-idp.{AWS_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}/.well-known/jwks.json"
JWKS = requests.get(JWKS_URL).json()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")  # not used anymore but required for FastAPI

# ✅ Cognito-based token verification
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        headers = jwt.get_unverified_header(token)
        kid = headers.get("kid")

        key = next((k for k in JWKS["keys"] if k["kid"] == kid), None)
        if not key:
            raise HTTPException(status_code=401, detail="Public key not found")

        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience=COGNITO_CLIENT_ID,
            issuer=f"https://cognito-idp.{AWS_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}"
        )

        # ✅ Use Cognito username (always present and stable)
        cognito_id = payload.get("username") or payload.get("sub")
        if not cognito_id:
            raise HTTPException(status_code=401, detail="No unique identifier in token")

        # 🔍 Find user by Cognito ID
        user = db.query(User).filter(User.cognito_id == cognito_id).first()

        # 🆕 Auto-create if not found
        if not user:
            user = User(
                        cognito_id=cognito_id,
                        name=payload.get("name", "Unknown"),
                        surname=payload.get("family_name", ""),
                        mobile=payload.get("phone_number", ""),
                        email=payload.get("email", None),
                    )
            db.add(user)
            db.commit()
            db.refresh(user)

        return {
            "id": user.id,
            "name": user.name,
            "surname": user.surname,
            "mobile": user.mobile,
            "email": user.email,
            "created_at": user.created_at.isoformat() if user.created_at else None
        }

    except JWTError as e:
        print("DEBUG | JWTError:", e)
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        print("DEBUG | Unexpected error:", e)
        raise HTTPException(status_code=401, detail="Token validation failed")


# ✅ Keep all your original endpoints below
@router.get("/me")
def get_user_info(user: User = Depends(get_current_user)):
    return user

@router.post("/save-itinerary")
def save_itinerary(itinerary: dict, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_itinerary = Itinerary(
        user_id=user["id"],
        days=itinerary["days"],
        adults=itinerary["adults"],
        children=itinerary["children"],
        transportation=itinerary["transportation"],
        age_range=itinerary["ageRange"],
        budget=itinerary["budget"],
        priorities=itinerary["priorities"],
        content=itinerary["content"]
    )
    db.add(new_itinerary)
    db.commit()
    return {"message": "Itinerary saved"}

@router.get("/user/itineraries")
def get_user_itineraries(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    itineraries = db.query(Itinerary).filter(Itinerary.user_id == user["id"]).all()
    return [
        {
            "id": it.id,
            "days": it.days,
            "adults": it.adults,
            "children": it.children,
            "transportation": it.transportation,
            "ageRange": it.age_range,
            "budget": it.budget,
            "priorities": it.priorities,
            "content": it.content,
            "createdAt": it.created_at.isoformat()
        }
        for it in itineraries
    ]

@router.delete("/itineraries/{itinerary_id}")
def delete_itinerary(
    itinerary_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    itinerary = db.query(Itinerary).filter(
        Itinerary.id == itinerary_id,
        Itinerary.user_id == current_user["id"]
    ).first()

    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")

    db.delete(itinerary)
    db.commit()
    return {"detail": "Itinerary deleted successfully"}

@router.post("/save-favorite")
async def save_favorite(request: Request, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    data = await request.json()
    new_fav = FavoritePlace(
        user_id=user["id"],
        name=data["name"],
        description=data["description"],
        latitude=data["latitude"],
        longitude=data["longitude"],
    )
    db.add(new_fav)
    db.commit()
    db.refresh(new_fav)
    return {"message": "Favorite saved"}

@router.get("/user/favorites")
def get_favorites(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(FavoritePlace).filter_by(user_id=user["id"]).order_by(FavoritePlace.created_at.desc()).all()

@router.delete("/favorites/{fav_id}")
def delete_favorite(fav_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    fav = db.query(FavoritePlace).filter_by(id=fav_id, user_id=user["id"]).first()
    if fav:
        db.delete(fav)
        db.commit()
        return {"message": "Favorite deleted"}
    raise HTTPException(status_code=404, detail="Not found")
