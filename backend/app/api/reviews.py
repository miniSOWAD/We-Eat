from fastapi import APIRouter
router=APIRouter()
@router.get('/')
async def reviews_status():
    return {'module':'reviews','status':'ready'}
