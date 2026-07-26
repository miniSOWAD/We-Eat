from app.core.config import Settings

BASE = {
    "database_url": "postgresql://user:password@localhost/db?sslmode=disable",
    "jwt_secret": "a" * 40,
    "otp_pepper": "b" * 24,
    "check_database_on_startup": False,
}


def test_individual_cloudinary_variables_are_supported() -> None:
    settings = Settings(
        **BASE,
        cloudinary_cloud_name="demo",
        cloudinary_api_key="123",
        cloudinary_api_secret="secret",
    )
    assert settings.cloudinary_is_configured is True
    assert settings.effective_cloudinary_cloud_name == "demo"
    assert settings.cloudinary_configuration_source == "individual variables"


def test_cloudinary_url_is_supported() -> None:
    settings = Settings(
        **BASE,
        cloudinary_url="cloudinary://123:secret@demo",
    )
    assert settings.cloudinary_credentials == ("demo", "123", "secret")
    assert settings.cloudinary_is_configured is True
    assert settings.cloudinary_configuration_source == "CLOUDINARY_URL"


def test_incomplete_cloudinary_values_are_rejected() -> None:
    settings = Settings(
        **BASE,
        cloudinary_cloud_name="demo",
        cloudinary_api_key="123",
    )
    assert settings.cloudinary_is_configured is False
