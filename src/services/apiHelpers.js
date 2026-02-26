/**
 * Build a single message from API errors array (field + message per item).
 */
function messageFromErrors(errors) {
  if (!Array.isArray(errors) || errors.length === 0) return null;
  return errors
    .map(e => {
      const msg = e.message || e.msg || 'Invalid value';
      return e.field ? `${e.field}: ${msg}` : msg;
    })
    .join('. ');
}

/**
 * Extract user-facing message from API error response.
 * For validation errors, uses the actual field messages; otherwise uses response message or first error.
 */
export function getApiMessage(err, fallback = 'Something went wrong') {
  if (!err || typeof err !== 'object') return fallback;
  const data = err.response?.data;
  if (!data) {
    if (err.message && err.code !== 'ERR_NETWORK') return err.message;
    if (err.code === 'ERR_NETWORK') return 'Network error. Please check your connection.';
    return fallback;
  }
  const fromErrors = messageFromErrors(data.errors);
  if (fromErrors && fromErrors.trim()) return fromErrors.trim();
  if (typeof data.message === 'string' && data.message.trim()) return data.message.trim();
  const first = Array.isArray(data.errors) && data.errors[0];
  if (first && (first.msg || first.message)) return first.msg || first.message;
  if (data.error && typeof data.error === 'string') return data.error;
  return fallback;
}

/**
 * Get full error info: message string and per-field errors for inline display.
 * @returns {{ message: string, errors: Array<{ field?: string, message: string }> }}
 */
export function getApiErrors(err, fallback = 'Something went wrong') {
  const message = getApiMessage(err, fallback);
  const data = err?.response?.data;
  const errors = Array.isArray(data?.errors)
    ? data.errors.map(e => ({
        field: e.field ?? e.path ?? e.param,
        message: e.message || e.msg || 'Invalid value'
      }))
    : [];
  return { message, errors };
}

export function isAuthError(err) {
  return err?.response?.status === 401;
}

export function isForbiddenError(err) {
  return err?.response?.status === 403;
}
