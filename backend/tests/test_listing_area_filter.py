from app.main import app


def test_listing_browse_exposes_area_filter() -> None:
    operation = app.openapi()["paths"]["/api/v1/listings"]["get"]
    names = {parameter["name"] for parameter in operation["parameters"]}
    assert "area" in names
