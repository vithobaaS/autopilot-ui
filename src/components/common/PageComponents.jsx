import { Link } from 'react-router-dom';

export function PageHeader({ title, crumb, actions }) {
  return (
    <div className="page-header">
      <div className="page-header-left">
        <h1>{title}</h1>
        <div className="breadcrumbs"><Link to="/dashboard">Home</Link><span className="sep">›</span><span>{crumb || title}</span></div>
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  );
}

export function TableCard({ title, headerRight, search, onSearch, entries, onEntries, children, total, page, onPage }) {
  return (
    <div className="card">
      <div className="card-header">
        <div><h2>{title}</h2>{total !== undefined && <p>{total} record{total !== 1 ? 's' : ''} found</p>}</div>
        {headerRight}
      </div>
      <div className="table-toolbar">
        <div className="toolbar-left">
          <div className="entries-select-wrap">
            Show <select value={entries} onChange={e => onEntries(+e.target.value)}>{[10,25,50].map(n => <option key={n} value={n}>{n}</option>)}</select> entries
          </div>
        </div>
        <div className="toolbar-right">
          {onSearch !== undefined && (
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input className="search-input" placeholder="Search…" value={search} onChange={e => onSearch(e.target.value)} />
            </div>
          )}
        </div>
      </div>
      <div className="table-responsive">{children}</div>
      {onPage && (
        <div className="table-footer">
          <span className="pag-info">Showing {Math.min(total, entries)} of {total}</span>
          <div className="pag-btns">
            <button className="pag-btn" disabled={page === 0} onClick={() => onPage(page - 1)}>‹ Prev</button>
            <button className="pag-btn active">{page + 1}</button>
            <button className="pag-btn" disabled={(page + 1) * entries >= total} onClick={() => onPage(page + 1)}>Next ›</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ItemPicker({ items, selected, onToggle, getLabel, getSub, getMeta }) {
  return (
    <div className="picker-wrap">
      <div className="picker-header">
        <span className="picker-header-left">{items.length} available</span>
        <span className="picker-selected-count">{selected.length} selected</span>
      </div>
      <div className="picker-list">
        {items.length === 0 ? (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--txt-muted)', fontSize: '13px', fontStyle: 'italic' }}>No items available yet.</div>
        ) : items.map(item => {
          const checked = selected.includes(item.id);
          return (
            <div key={item.id} className={`picker-item ${checked ? 'checked' : ''}`} onClick={() => onToggle(item.id)}>
              <div className="picker-checkbox"><span className="picker-checkmark">✓</span></div>
              <div className="picker-info"><strong>{getLabel(item)}</strong>{getSub && <small>{getSub(item)}</small>}</div>
              {getMeta && <div className="picker-meta">{getMeta(item)}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Card({ title, children, style }) {
  return (
    <div className="card" style={style}>
      {title && <div className="card-header"><h2>{title}</h2></div>}
      <div className="card-body" style={{ padding: '24px' }}>
        {children}
      </div>
    </div>
  );
}
