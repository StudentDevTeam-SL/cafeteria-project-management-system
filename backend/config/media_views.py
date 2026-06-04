import mimetypes
import os

from django.conf import settings
from django.core.files.storage import default_storage
from django.http import FileResponse, Http404, HttpResponse, StreamingHttpResponse
from django.views.decorators.http import require_GET
from rest_framework_simplejwt.authentication import JWTAuthentication

from config.storage import blob_access, iter_blob_stream


PUBLIC_MEDIA_PREFIXES = ("menu_images/",)
MANAGEMENT_MEDIA_PREFIXES = ("job_applications/cvs/",)


def _normalise_path(pathname):
    clean = str(pathname).replace("\\", "/").strip("/")
    if not clean or any(part in {"", ".", ".."} for part in clean.split("/")):
        raise Http404("File not found")
    return clean


def _authenticated_user(request):
    user = getattr(request, "user", None)
    if user and user.is_authenticated:
        return user

    try:
        auth_result = JWTAuthentication().authenticate(request)
    except Exception:
        return None

    if auth_result is None:
        return None

    user, _ = auth_result
    request.user = user
    return user


def _can_read_media(request, pathname):
    if pathname.startswith(PUBLIC_MEDIA_PREFIXES):
        return True

    user = _authenticated_user(request)
    if not user or not user.is_authenticated:
        return False

    if pathname.startswith(MANAGEMENT_MEDIA_PREFIXES):
        return getattr(user, "role", "") in {"Admin", "Manager"}

    return getattr(user, "role", "") in {"Admin", "Manager"}


def _content_disposition(request, pathname):
    filename = os.path.basename(pathname).replace('"', "")
    disposition = "attachment" if request.GET.get("download") else "inline"
    return f'{disposition}; filename="{filename}"'


def _local_media_response(request, pathname):
    if not default_storage.exists(pathname):
        raise Http404("File not found")

    content_type = mimetypes.guess_type(pathname)[0] or "application/octet-stream"
    response = FileResponse(
        default_storage.open(pathname, "rb"),
        content_type=content_type,
    )
    response["Content-Disposition"] = _content_disposition(request, pathname)
    response["X-Content-Type-Options"] = "nosniff"
    return response


def _blob_media_response(request, pathname):
    from vercel.blob import get

    result = get(
        pathname,
        access=blob_access(),
        token=settings.BLOB_READ_WRITE_TOKEN,
    )
    if result is None or result.status_code != 200:
        raise Http404("File not found")

    content_type = (
        getattr(result.blob, "content_type", None)
        or mimetypes.guess_type(pathname)[0]
        or "application/octet-stream"
    )
    response = StreamingHttpResponse(iter_blob_stream(result.stream), content_type=content_type)
    response["Content-Disposition"] = _content_disposition(request, pathname)
    response["X-Content-Type-Options"] = "nosniff"
    cache_control = getattr(result.blob, "cache_control", None)
    if cache_control:
        response["Cache-Control"] = cache_control
    return response


@require_GET
def media_file(request, pathname):
    pathname = _normalise_path(pathname)

    if not _can_read_media(request, pathname):
        return HttpResponse("Authentication required", status=401)

    if settings.USE_VERCEL_BLOB_STORAGE:
        return _blob_media_response(request, pathname)

    return _local_media_response(request, pathname)
