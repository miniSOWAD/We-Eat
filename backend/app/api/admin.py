from fastapi import APIRouter
router=APIRouter()
@router.get('/')
async def admin_status():
    return {'module':'admin','status':'ready'}
