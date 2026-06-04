import mimetypes
from importlib import import_module
from urllib.parse import urljoin

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.core.files.base import ContentFile
from django.core.files.storage import Storage
from django.utils.encoding import filepath_to_uri
from django.utils.text import get_valid_filename


def _blob_func(name):
    try:
        module = import_module("vercel.blob")
    except ImportError as exc:
        raise ImproperlyConfigured(
            "Vercel Blob storage is enabled, but the 'vercel' package is not installed."
        ) from exc
    return getattr(module, name)


def _token():
    token = getattr(settings, "BLOB_READ_WRITE_TOKEN", "")
    if not token:
        raise ImproperlyConfigured("BLOB_READ_WRITE_TOKEN is required for Vercel Blob storage.")
    return token


def blob_access():
    return getattr(settings, "BLOB_ACCESS", "private")


def iter_blob_stream(stream):
    if stream is None:
        return

    if hasattr(stream, "__aiter__"):
        from asgiref.sync import async_to_sync

        async def collect_chunks():
            chunks = []
            async for chunk in stream:
                chunks.append(chunk)
            return chunks

        for chunk in async_to_sync(collect_chunks)():
            yield chunk
        return

    yield from stream


class VercelBlobStorage(Storage):
    """
    Django storage backend for Vercel Blob private stores.

    Files are saved to Blob, while url() returns the Django proxy endpoint so
    private blobs are delivered through app auth instead of direct storage URLs.
    """

    def _clean_name(self, name):
        name = str(name).replace("\\", "/").strip("/")
        parts = [get_valid_filename(part) for part in name.split("/") if part not in {"", ".", ".."}]
        return "/".join(parts)

    def _save(self, name, content):
        name = self._clean_name(name)
        content_type = getattr(content, "content_type", None) or mimetypes.guess_type(name)[0]

        if hasattr(content, "chunks"):
            body = b"".join(content.chunks())
        else:
            body = content.read()

        result = _blob_func("put")(
            name,
            body,
            access=blob_access(),
            content_type=content_type,
            add_random_suffix=True,
            token=_token(),
        )
        return result.pathname

    def delete(self, name):
        if not name or str(name).startswith(("http://", "https://")):
            return
        _blob_func("delete")(self._clean_name(name), token=_token())

    def exists(self, name):
        return False

    def open(self, name, mode="rb"):
        result = _blob_func("get")(self._clean_name(name), access=blob_access(), token=_token())
        if result is None or result.status_code != 200:
            raise FileNotFoundError(name)
        return ContentFile(b"".join(iter_blob_stream(result.stream)), name=name)

    def size(self, name):
        result = _blob_func("head")(self._clean_name(name), token=_token())
        return result.size

    def url(self, name):
        if not name:
            return ""
        name = str(name)
        if name.startswith(("http://", "https://")):
            return name
        return urljoin(settings.MEDIA_URL, filepath_to_uri(name))

    def get_valid_name(self, name):
        return get_valid_filename(name)
