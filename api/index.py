import os
import sys
import traceback

# Add backend directory to sys.path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

try:
    from django.core.wsgi import get_wsgi_application

    class VercelPathInfoMiddleware:
        """
        WSGI middleware to correct PATH_INFO when Vercel rewrites routes.
        If Vercel rewrites /api/auth/login/ to /api/index.py, the PATH_INFO
        is restored to /api/auth/login/ so Django's URL routing works.
        """
        def __init__(self, application):
            self.application = application

        def __call__(self, environ, start_response):
            # Restore the original path from Vercel's forwarded request URI or RAW_URI
            original_uri = (
                environ.get('HTTP_X_VERCEL_FORWARDED_REQUEST_URI') or
                environ.get('HTTP_X_FORWARDED_PATH') or
                environ.get('REQUEST_URI') or
                environ.get('RAW_URI')
            )
            if original_uri:
                # Strip query string from path
                path = original_uri.split('?')[0]
                environ['PATH_INFO'] = path
            return self.application(environ, start_response)

    app = VercelPathInfoMiddleware(get_wsgi_application())

except Exception as e:
    # If Django fails to start (e.g. missing DATABASE_URL, import error),
    # return a helpful JSON error instead of a cryptic 500
    import json

    _startup_error = traceback.format_exc()

    def app(environ, start_response):
        status = '500 Internal Server Error'
        body = json.dumps({
            'error': 'Django application failed to start',
            'detail': str(e),
            'traceback': _startup_error,
        }).encode('utf-8')
        headers = [
            ('Content-Type', 'application/json'),
            ('Content-Length', str(len(body))),
        ]
        start_response(status, headers)
        return [body]
