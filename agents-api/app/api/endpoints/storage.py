from fastapi import APIRouter, status

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