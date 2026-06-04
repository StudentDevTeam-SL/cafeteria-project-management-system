import api from '../api/axios';

const asApiMediaPath = (mediaUrl) => {
  const parsed = new URL(mediaUrl, window.location.origin);
  if (!parsed.pathname.startsWith('/api/media/')) {
    return null;
  }
  return `${parsed.pathname.replace(/^\/api\//, '')}${parsed.search}`;
};

export const openProtectedMedia = async (mediaUrl) => {
  if (!mediaUrl) return;

  const apiPath = asApiMediaPath(mediaUrl);
  if (!apiPath) {
    window.open(mediaUrl, '_blank', 'noopener,noreferrer');
    return;
  }

  const targetWindow = window.open('about:blank', '_blank');
  if (targetWindow) {
    targetWindow.opener = null;
  }
  try {
    const response = await api.get(apiPath, { responseType: 'blob' });
    const objectUrl = URL.createObjectURL(response.data);

    if (targetWindow) {
      targetWindow.location.href = objectUrl;
    } else {
      window.open(objectUrl, '_blank', 'noopener,noreferrer');
    }

    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 30000);
  } catch (error) {
    if (targetWindow) targetWindow.close();
    throw error;
  }
};
