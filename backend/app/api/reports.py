from fastapi import APIRouter
router=APIRouter()
@router.get('/')
async def reports_status():
    return {'module':'reports','status':'ready'}
