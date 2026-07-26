from app.core.config import Settings

BASE = {
    "database_url": "postgresql://user:password@localhost/db?sslmode=disable",
    "jwt_secret": "a" * 40,
    "otp_pepper": "b" * 24,
    "check_database_on_startup": False,
}


def test_log_mode_is_not_delivery_configured() -> None:
    settings = Settings(**BASE, email_mode="log")
    assert settings.email_is_configured is False


def test_smtp_requires_auth_credentials_by_default() -> None:
    incomplete = Settings(
        **BASE,
        email_mode="smtp",
        smtp_host="smtp.gmail.com",
        smtp_from_email="sender@gmail.com",
    )
    assert incomplete.email_is_configured is False
    assert "SMTP_PASSWORD" in incomplete.email_configuration_errors

    configured = Settings(
        **BASE,
        email_mode="smtp",
        smtp_host="smtp.gmail.com",
        smtp_username="sender@gmail.com",
        smtp_password="app-password",
        smtp_from_email="sender@gmail.com",
    )
    assert configured.email_is_configured is True


def test_gmail_host_and_username_are_inferred_from_sender() -> None:
    configured = Settings(
        **BASE,
        email_mode="smtp",
        smtp_username="Sender Name",
        smtp_password="app-password",
        smtp_from_email="sender@gmail.com",
    )
    assert configured.effective_smtp_host == "smtp.gmail.com"
    assert configured.effective_smtp_username == "sender@gmail.com"
    assert configured.email_is_configured is True


def test_legacy_mail_variable_names_are_accepted() -> None:
    configured = Settings(
        **BASE,
        email_mode="smtp",
        MAIL_SERVER="smtp.example.com",
        MAIL_PORT=587,
        MAIL_USERNAME="sender@example.com",
        MAIL_PASSWORD="password",
        MAIL_FROM="sender@example.com",
    )
    assert configured.smtp_host == "smtp.example.com"
    assert configured.smtp_username == "sender@example.com"
    assert configured.smtp_from_email == "sender@example.com"
    assert configured.email_is_configured is True


def test_brevo_remains_optional() -> None:
    configured = Settings(
        **BASE,
        email_mode="brevo",
        brevo_api_key="secret",
        smtp_from_email="sender@example.com",
    )
    assert configured.email_is_configured is True


def test_previous_project_smtp_key_defaults_to_brevo_relay() -> None:
    settings = Settings(
        **BASE,
        email_mode="smtp",
        smtp_username="relay-user",
        smtp_key="relay-password",
        smtp_from_email="sender@example.com",
    )
    assert settings.effective_smtp_host == "smtp-relay.brevo.com"
    assert settings.effective_smtp_password == "relay-password"
    assert settings.email_is_configured is True
