from fastapi import APIRouter
router=APIRouter()
@router.get('/')
async def exchanges_status():
    return {'module':'exchanges','status':'ready'}
