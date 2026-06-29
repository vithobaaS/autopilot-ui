export const fmt = (iso) => {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return isNaN(d) ? iso : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return iso; }
};

export const fmtShort = (iso) => {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return isNaN(d) ? iso : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  } catch { return iso; }
};

export const statusBadge = (s) => {
  const map = {
    active: 'badge-success', inactive: 'badge-danger',
    success: 'badge-success', failed: 'badge-danger', running: 'badge-purple',
    queued: 'badge-neutral', assigned: 'badge-info',
    now: 'badge-info', scheduled: 'badge-warning',
    chrome: 'badge-info', firefox: 'badge-warning', edge: 'badge-purple',
  };
  return map[(s || '').toLowerCase()] || 'badge-neutral';
};

export const copyToClipboard = async (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn("Clipboard API failed, falling back to execCommand", err);
    }
  }
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error("Fallback clipboard copy failed", err);
    return false;
  }
};
