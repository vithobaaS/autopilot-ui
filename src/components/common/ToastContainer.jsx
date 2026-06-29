import { useState } from 'react';

let _toastId = 0;
let _setToasts = null;

// eslint-disable-next-line react-refresh/only-export-components
export function toast(type, title, msg) {
  if (!_setToasts) return;
  const id = ++_toastId;
  _setToasts(p => [...p, { id, type, title, msg }]);
  setTimeout(() => _setToasts(p => p.map(t => t.id === id ? { ...t, hide: true } : t)), 3200);
  setTimeout(() => _setToasts(p => p.filter(t => t.id !== id)), 3600);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  // eslint-disable-next-line react-hooks/globals
  _setToasts = setToasts;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}${t.hide ? ' hide' : ''}`}>
          <div className="toast-icon">{icons[t.type]}</div>
          <div className="toast-body">
            <div className="toast-title">{t.title}</div>
            {t.msg && <div className="toast-msg">{t.msg}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
