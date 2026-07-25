from __future__ import annotations

import asyncio
import io

import cloudinary
import cloudinary.uploader
from fastapi import HTTPException, UploadFile, status
from PIL import Image, UnidentifiedImageError

from app.core.config import settings


def _configure() -> None:
    if not all(
        [
            settings.cloudinary_cloud_name,
            settings.cloudinary_api_key,
            settings.cloudinary_api_secret,
        ]
    ):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Cloudinary is not configured",
        )
    cloudinary.config(
        cloud_name=settings.cloudinary_cloud_name,
        api_key=settings.cloudinary_api_key,
        api_secret=settings.cloudinary_api_secret,
        secure=True,
    )


async def upload_image(file: UploadFile, *, owner_id: str, resource_group: str) -> dict:
    _configure()
    if file.content_type not in settings.allowed_image_type_list:
        raise HTTPException(status_code=415, detail="Unsupported image type")

    data = await file.read(settings.max_upload_bytes + 1)
    if len(data) > settings.max_upload_bytes:
        raise HTTPException(status_code=413, detail="Image exceeds the upload size limit")

    try:
        with Image.open(io.BytesIO(data)) as image:
            image.verify()
    except (UnidentifiedImageError, OSError) as exc:
        raise HTTPException(status_code=400, detail="Invalid image file") from exc

    folder = f"{settings.cloudinary_folder}/{resource_group}/{owner_id}"
    result = await asyncio.to_thread(
        cloudinary.uploader.upload,
        data,
        folder=folder,
        resource_type="image",
        overwrite=False,
        unique_filename=True,
        use_filename=False,
        transformation=[
            {"quality": "auto:good", "fetch_format": "auto"},
            {"width": 1800, "height": 1800, "crop": "limit"},
        ],
    )
    return {
        "secure_url": result["secure_url"],
        "public_id": result["public_id"],
        "width": result.get("width"),
        "height": result.get("height"),
        "bytes": result.get("bytes"),
        "format": result.get("format"),
    }


async def delete_image(public_id: str) -> None:
    _configure()
    await asyncio.to_thread(cloudinary.uploader.destroy, public_id, invalidate=True)
