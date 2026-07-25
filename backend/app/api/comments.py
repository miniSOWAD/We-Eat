from fastapi import APIRouter
router=APIRouter()
@router.get('/')
async def comments_status():
    return {'module':'comments','status':'ready'}
