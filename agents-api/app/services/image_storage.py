import cloudinary
import cloudinary.uploader

from app.core.config import settings
from app.utils.alumni_db import find_all, update_alumni
from app.utils.company_db import get_all_companies, update_company
from app.db import get_db

db = next(get_db())
class ImageStorageService:
    def __init__(self):
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True,
        )

    def upload_all_alumni_profile_pictures(self):
        """
        Upload all alumni profile pictures to Cloudinary.
        """
        alumni = find_all(db)
        for alumni in alumni:
            if alumni.profile_picture_url:
                new_profile_picture_url = self.upload_image(alumni.profile_picture_url, alumni.id)
                alumni.profile_picture_url = new_profile_picture_url
                update_alumni(alumni, db)

    def upload_image(self, image_url: str, public_id: str) -> str:
        """
        Upload an image to Cloudinary and return the secure URL.
        
        Args:
            image_url: The URL of the image to upload.
            public_id: The public ID of the image.

        Returns:
            The secure URL of the uploaded image.
        """
        upload_result = cloudinary.uploader.upload(image_url, public_id=public_id)
        return upload_result["secure_url"]

image_storage_service = ImageStorageService()
