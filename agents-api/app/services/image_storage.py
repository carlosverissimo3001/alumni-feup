import logging

import cloudinary
import cloudinary.uploader
import cloudinary.exceptions

from app.core.config import settings
from app.db import get_db
from app.utils.alumni_db import find_all, update_alumni

db = next(get_db())

logger = logging.getLogger(__name__)


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
        logger.info(f"Found {len(alumni)} alumni with profile pictures to upload")
        for alumni in alumni:
            if alumni.profile_picture_url:
                try:
                    new_profile_picture_url = self.upload_image(
                        alumni.profile_picture_url, alumni.id
                    )
                    if new_profile_picture_url:
                        alumni.profile_picture_url = new_profile_picture_url
                        update_alumni(alumni, db)
                except Exception as e:
                    logger.error(
                        f"Failed to upload profile picture for alumni {alumni.id}: {str(e)}"
                    )
                    continue

    def upload_image(self, image_url: str, public_id: str) -> str | None:
        """
        Upload an image to Cloudinary and return the secure URL.

        Args:
            image_url: The URL of the image to upload.
            public_id: The public ID of the image.

        Returns:
            The secure URL of the uploaded image, or None if upload fails.
        """
        try:
            upload_result = cloudinary.uploader.upload(image_url, public_id=public_id)
            return upload_result["secure_url"]
        except (cloudinary.exceptions.Error, Exception) as e:
            logger.error(f"Failed to upload image {image_url}: {str(e)}")
            return None


image_storage_service = ImageStorageService()
