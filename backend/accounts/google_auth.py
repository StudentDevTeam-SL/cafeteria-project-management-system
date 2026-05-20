"""Helpers for the Google sign-in flow."""

from .models import CustomUser


DEMO_GOOGLE_EMAIL_ALIASES = {
    'admin@gmail.com': 'admin@cafeteria.com',
    'manager@gmail.com': 'manager@cafeteria.com',
    'employee@gmail.com': 'employee@cafeteria.com',
}


def normalize_email(email):
    return (email or '').strip().lower()


def resolve_google_user(email):
    """Return the database user for a Google/Gmail address, if one exists."""
    normalized_email = normalize_email(email)
    if not normalized_email:
        return None, normalized_email

    lookup_emails = [normalized_email]
    alias_email = DEMO_GOOGLE_EMAIL_ALIASES.get(normalized_email)
    if alias_email:
        lookup_emails.append(alias_email)

    for lookup_email in lookup_emails:
        user = CustomUser.objects.filter(email__iexact=lookup_email).first()
        if user:
            return user, normalized_email

    if normalized_email.endswith('@gmail.com'):
        username = normalized_email.split('@', 1)[0]
        user = CustomUser.objects.filter(username__iexact=username).first()
        if user:
            return user, normalized_email

    return None, normalized_email


def google_user_payload(user, requested_email):
    full_name = f"{user.first_name} {user.last_name}".strip() or user.username.title()
    return {
        'found': True,
        'id': user.id,
        'username': user.username,
        'full_name': full_name,
        'role': getattr(user, 'role', 'Staff'),
        'email': requested_email,
        'database_email': user.email,
    }
