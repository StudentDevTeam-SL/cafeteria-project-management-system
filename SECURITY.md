# Security Policy

## Supported Versions

This repository is maintained for the current release line only. The project is built on:

- **Backend:** Django 5.0.4
- **Frontend:** React 19.2.5
- **Database:** PostgreSQL 14+

Security fixes are applied to active development branches and any released deployment configurations.

## Reporting a Vulnerability

If you discover a security issue, please open a GitHub issue in this repository and include:

- A clear description of the vulnerability
- Steps to reproduce it
- Affected versions or deployment configuration
- Any relevant logs or request/response details

We will respond to vulnerability reports within 72 hours and aim to acknowledge and triage valid issues as soon as possible.

## Responsible Disclosure

Please do not publish security issues publicly before they have been addressed. Allow the maintainers at least 90 days to provide a fix or mitigation.

## Security Best Practices

- Keep `SECRET_KEY` out of source control.
- Keep `.env` files private and do not commit them.
- Use HTTPS in production and enforce secure cookies.
- Use `PGSSLMODE=require` for production PostgreSQL connections.
- Run dependency audits regularly for both backend and frontend.
