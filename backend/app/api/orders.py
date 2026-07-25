from fastapi import APIRouter
router=APIRouter()
@router.get('/')
async def orders_status():
    return {'module':'orders','status':'ready'}
