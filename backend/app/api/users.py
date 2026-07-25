from fastapi import APIRouter
router=APIRouter()
@router.get('/')
async def users_status():
    return {'module':'users','status':'ready'}
