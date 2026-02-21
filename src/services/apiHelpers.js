/**
 * Extract user-facing message from API error response.
 * Use for toasts and inline error display.
 */
export function getApiMessage(err, fallback = 'Something went wrong') {
  if (!err || typeof err !== 'object') return fallback;
  const data = err.response?.data;
  if (!data) {
    if (err.message && err.code !== 'ERR_NETWORK') return err.message;
    if (err.code === 'ERR_NETWORK') return 'Network error. Please check your connection.';
    return fallback;
  }
  if (typeof data.message === 'string' && data.message.trim()) return data.message.trim();
  const first = Array.isArray(data.errors) && data.errors[0];
  if (first && (first.msg || first.message)) return first.msg || first.message;
  if (data.error && typeof data.error === 'string') return data.error;
  return fallback;
}

export function isAuthError(err) {
  return err?.response?.status === 401;
}

export function isForbiddenError(err) {
  return err?.response?.status === 403;
}
