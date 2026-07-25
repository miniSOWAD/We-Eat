from fastapi import APIRouter
router=APIRouter()
@router.get('/')
async def messages_status():
    return {'module':'messages','status':'ready'}
