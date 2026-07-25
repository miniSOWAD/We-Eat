from fastapi import APIRouter
router=APIRouter()
@router.get('/')
async def moderator_status():
    return {'module':'moderator','status':'ready'}
