# Security Policy

Last updated: May 26, 2026

## Supported Version

This repository is maintained for the current development release.

| Layer | Version |
| --- | --- |
| Backend | Django 5.0.4 |
| API | Django REST Framework 3.15.1 |
| Frontend | React 19.2.5 |
| Database | PostgreSQL 14+ |

## Reporting a Vulnerability

If you discover a security issue, open a private/internal report or GitHub issue for the maintainers and include:

- A clear description of the issue.
- Steps to reproduce it.
- Affected endpoint, page, or deployment setting.
- Relevant logs, request payloads, or screenshots.
- Suggested severity if known.

Do not publish exploit details publicly before the issue is fixed or mitigated.

## Authentication and Authorization

- API authentication uses JWT access and refresh tokens.
- Frontend requests attach `Authorization: Bearer <token>`.
- Access is role-based through backend permission classes.
- Admin-only actions include destructive system actions such as admin deletes.
- Manager/Admin actions include management writes for menu, inventory, employees, salaries, and selected system data.

## Production Security Rules

Required:

- `DEBUG=False`
- Strong `SECRET_KEY`
- HTTPS enabled
- Correct `ALLOWED_HOSTS`
- Correct `CORS_ALLOWED_ORIGINS`
- Correct `CSRF_TRUSTED_ORIGINS`
- `PGSSLMODE=require` for hosted PostgreSQL
- `.env` files kept out of source control

Recommended:

- Create production users intentionally.
- Do not enable `CREATE_DEMO_USERS` in production.
- Rotate credentials if demo users were ever exposed on a public deployment.
- Run dependency audits regularly.
- Review uploaded media handling and storage permissions before public production launch.

## Demo User Policy

Demo users are not created automatically by default. Local/demo environments can opt in with:

```env
CREATE_DEMO_USERS=true
```

Production should leave this unset or false. Use Django admin, a secure management process, or a controlled one-time seed to create production users.

## External Services

The backend verifies Google ID tokens through Google's tokeninfo endpoint when using real Google credentials. Payment UI does not call an external payment processor; it only stores payment metadata on an order.

## Related Docs

- [System data flow](backend/docs/data_flow.md)
- [Backend architecture](backend/docs/backend.md)
- [Render deployment](backend/docs/render.md)
