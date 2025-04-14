from fastapi import APIRouter, status

from app.schemas.image import ImageStorageResponse
from app.services.image_storage import image_storage_service

router = APIRouter()


@router.post(
    "/company_logos_to_storage",
    status_code=status.HTTP_200_OK,
    description="Uses the stored hotlink to download a company logo from LinkedIn \
    and save it to Cloudinary",
)
async def company_logos_to_storage():
    pass

@router.post(
    "/alumni_profile_pictures_to_storage",
    status_code=status.HTTP_200_OK,
    description="Uses the stored hotlink to download a alumni profile picture from LinkedIn \
    and save it to Cloudinary",
)
async def alumni_profile_pictures_to_storage():
    pass

@router.post(
    "/test-image-upload",
    status_code=status.HTTP_200_OK,
    description="Test the image upload to Cloudinary",
    response_model=ImageStorageResponse,
)
async def test_image_upload(image_url: str):
    secure_url = image_storage_service.upload_image(
        image_url=image_url,
        public_id="alumni-profile-pictures/test-image",
    )

    return {"status": "success", "secure_url": secure_url}

