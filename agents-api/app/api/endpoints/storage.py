from fastapi import APIRouter, status

from app.services.image_storage import image_storage_service

router = APIRouter()

@router.post(
    "/alumni_profile_pictures_to_storage",
    status_code=status.HTTP_200_OK,
    description="Uses the stored hotlink to download a alumni profile picture from LinkedIn \
    and save it to Cloudinary",
)
async def alumni_profile_pictures_to_storage():
    image_storage_service.upload_all_alumni_profile_pictures()


