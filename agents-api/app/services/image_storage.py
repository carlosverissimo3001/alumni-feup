import cloudinary
import cloudinary.uploader

from app.core.config import settings


class ImageStorageService:
    def __init__(self):
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True,
        )


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