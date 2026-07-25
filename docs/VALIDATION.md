# Validation Report — We Eat Backend v1.1.0

## Completed in the build environment

- Parsed and compiled every Python source file.
- Statically extracted all FastAPI route decorators.
- Confirmed 53 API operations are registered in source.
- Confirmed all API paths currently used by the frontend are present.
- Validated Neon URL normalization:
  - `postgresql://` becomes `postgresql+asyncpg://`;
  - `sslmode` and `channel_binding` are removed from the SQLAlchemy URL;
  - SSL is supplied through asyncpg connect arguments.
- Validated strong-password schemas with Pydantic.
- Confirmed no `.env` file or real credentials are included.
- Verified ZIP integrity after packaging.

## Not completed in the build environment

The package mirror available during generation did not provide all runtime
packages, including asyncpg and Cloudinary. Therefore, the following must be run
on the target computer:

```powershell
pip install -e ".[dev]"
pytest
alembic upgrade head
python -m scripts.check_database
```

A real end-to-end registration test also requires the user’s Neon connection and
either `EMAIL_MODE=log` or valid SMTP credentials.
