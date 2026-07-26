from __future__ import annotations

import asyncio
import io
import logging

import cloudinary
import cloudinary.uploader
from cloudinary.exceptions import Error as CloudinaryError
from fastapi import HTTPException, UploadFile, status
from PIL import Image, UnidentifiedImageError

from app.core.config import settings

logger = logging.getLogger("we_eat.cloudinary")


def _configure() -> str:
    credentials = settings.cloudinary_credentials
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Cloudinary is not configured in this backend deployment. Set CLOUDINARY_URL "
                "or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in "
                "FastAPI Cloud environment variables, then redeploy."
            ),
        )
    cloud_name, api_key, api_secret = credentials
    cloudinary.config(
        cloud_name=cloud_name,
        api_key=api_key,
        api_secret=api_secret,
        secure=True,
    )
    return cloud_name


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
    transformation = [
        {"quality": "auto:good", "fetch_format": "auto"},
        {"width": 1800, "height": 1800, "crop": "limit"},
    ]
    if resource_group == "users":
        transformation = [
            {"width": 512, "height": 512, "crop": "fill", "gravity": "auto"},
            {"quality": "auto:good", "fetch_format": "auto"},
        ]

    try:
        result = await asyncio.to_thread(
            cloudinary.uploader.upload,
            data,
            folder=folder,
            resource_type="image",
            overwrite=False,
            unique_filename=True,
            use_filename=False,
            transformation=transformation,
        )
    except CloudinaryError as exc:
        logger.exception("Cloudinary upload failed", extra={"resource_group": resource_group})
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Cloudinary rejected the upload. Check the cloud name, API key and API secret.",
        ) from exc
    except Exception as exc:
        logger.exception("Cloudinary upload request failed", extra={"resource_group": resource_group})
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Cloudinary could not be reached. Try again later.",
        ) from exc

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
