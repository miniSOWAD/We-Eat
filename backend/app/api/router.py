from fastapi import APIRouter

from app.api.routes import (
    admin,
    auth,
    comments,
    exchanges,
    favorites,
    listings,
    orders,
    reports,
    reviews,
    system,
    users,
)

api_router = APIRouter()
api_router.include_router(system.router)
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(listings.router)
api_router.include_router(favorites.router)
api_router.include_router(comments.router)
api_router.include_router(orders.router)
api_router.include_router(exchanges.router)
api_router.include_router(reviews.router)
api_router.include_router(reports.router)
api_router.include_router(admin.router)
