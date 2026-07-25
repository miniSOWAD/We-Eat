# We Eat FastAPI Cloud build fix v1.1.1

Copy both files into the backend project root, replacing `pyproject.toml`.

Files:
- `pyproject.toml`
- `.python-version`

Then run:

```powershell
cd "D:\PROJ\We Eat\backend"
fastapi deploy
```

This fix:
1. Marks the flat-layout backend as a non-package uv application, so uv does not try to build `app` and `alembic` as one distributable package.
2. Declares the FastAPI entrypoint as `app.main:app`.
3. Pins cloud builds to Python 3.12.
