from fastapi import APIRouter
router=APIRouter()
@router.get('/')
async def favorites_status():
    return {'module':'favorites','status':'ready'}
