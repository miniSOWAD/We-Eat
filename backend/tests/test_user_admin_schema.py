from app.schemas.users import UserAdminView


def test_admin_user_schema_never_exposes_password() -> None:
    fields = UserAdminView.model_fields
    assert "password" not in fields
    assert "password_hash" not in fields
