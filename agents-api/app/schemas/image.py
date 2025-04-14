from pydantic import BaseModel


class ImageStorageResponse(BaseModel):
    status: str
    secure_url: str

    class Config:
        from_attributes = True
