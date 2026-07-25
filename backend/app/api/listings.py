from fastapi import APIRouter
router=APIRouter()
@router.get('/')
async def listings_status():
    return {'module':'listings','status':'ready'}
