from fastapi import APIRouter
router=APIRouter()
@router.get('/')
async def auth_status():
    return {'module':'auth','status':'ready'}
