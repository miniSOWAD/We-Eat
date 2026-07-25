from fastapi import APIRouter
router=APIRouter()
@router.get('/')
async def utility_status():
    return {'module':'utility','status':'ready'}
