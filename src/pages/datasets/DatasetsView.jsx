import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/apiClient';
import { toast } from '../../components/common/ToastContainer';
import { Database, Plus, Upload, Trash2, Edit2, Search, Download, Table2, FileSpreadsheet, ChevronDown, X, Save, Eye } from 'lucide-react';

function PageHeader({ title, crumb, actions }) {
  return (
    <div className="page-header">
      <div className="page-header-left">
        <h1>{title}</h1>
        <div className="breadcrumbs">
          <Link to="/dashboard">Home</Link><span className="sep">›</span><span>{crumb}</span>
        </div>
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  );
}

export default function DatasetsView() {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', headers: ['Column 1', 'Column 2'], rows: [['', '']] });
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  const load = () => {
    setLoading(true);
    api('/api/datasets').then(r => r.json()).then(d => { setDatasets(d || []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = datasets.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

  // ─── CSV Upload ──────────────────────────────────────────
  const handleCSVUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length < 2) { toast('error', 'Invalid CSV', 'CSV must have at least a header row and one data row.'); return; }
      const parseLine = (line) => {
        const result = []; let current = ''; let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const ch = line[i];
          if (ch === '"') { inQuotes = !inQuotes; }
          else if (ch === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
          else { current += ch; }
        }
        result.push(current.trim());
        return result;
      };
      const headers = parseLine(lines[0]);
      const rows = lines.slice(1).map(l => parseLine(l));
      setForm({ name: file.name.replace(/\.csv$/i, ''), description: `Imported from ${file.name}`, headers, rows });
      setEditing(null);
      setShowForm(true);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ─── Manual Create ──────────────────────────────────────
  const openCreate = () => {
    setForm({ name: '', description: '', headers: ['Column 1', 'Column 2'], rows: [['', '']] });
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (ds) => {
    try {
      const headers = JSON.parse(ds.headers || '[]');
      const rows = JSON.parse(ds.rows || '[]');
      setForm({ name: ds.name, description: ds.description || '', headers, rows });
    } catch {
      setForm({ name: ds.name, description: ds.description || '', headers: [], rows: [] });
    }
    setEditing(ds.id);
    setShowForm(true);
  };

  const openPreview = (ds) => {
    try {
      const headers = JSON.parse(ds.headers || '[]');
      const rows = JSON.parse(ds.rows || '[]');
      setPreview({ name: ds.name, headers, rows });
    } catch {
      toast('error', 'Error', 'Could not parse dataset data.');
    }
  };

  // ─── Table Builder Helpers ──────────────────────────────
  const addColumn = () => {
    setForm(f => ({
      ...f,
      headers: [...f.headers, `Column ${f.headers.length + 1}`],
      rows: f.rows.map(r => [...r, ''])
    }));
  };

  const removeColumn = (ci) => {
    if (form.headers.length <= 1) return;
    setForm(f => ({
      ...f,
      headers: f.headers.filter((_, i) => i !== ci),
      rows: f.rows.map(r => r.filter((_, i) => i !== ci))
    }));
  };

  const addRow = () => {
    setForm(f => ({ ...f, rows: [...f.rows, new Array(f.headers.length).fill('')] }));
  };

  const removeRow = (ri) => {
    if (form.rows.length <= 1) return;
    setForm(f => ({ ...f, rows: f.rows.filter((_, i) => i !== ri) }));
  };

  const updateHeader = (ci, val) => {
    setForm(f => ({ ...f, headers: f.headers.map((h, i) => i === ci ? val : h) }));
  };

  const updateCell = (ri, ci, val) => {
    setForm(f => ({
      ...f,
      rows: f.rows.map((r, i) => i === ri ? r.map((c, j) => j === ci ? val : c) : r)
    }));
  };

  // ─── Save ────────────────────────────────────────────────
  const save = async () => {
    if (!form.name.trim()) { toast('error', 'Validation', 'Dataset name is required.'); return; }
    if (form.headers.length === 0) { toast('error', 'Validation', 'At least one column is required.'); return; }

    const payload = {
      name: form.name,
      description: form.description,
      headers: JSON.stringify(form.headers),
      rows: JSON.stringify(form.rows),
      rowCount: form.rows.length
    };

    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/datasets/${editing}` : '/api/datasets';
    const r = await api(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (r.ok) {
      toast('success', editing ? 'Updated' : 'Created', `Dataset "${form.name}" saved.`);
      setShowForm(false);
      load();
    } else {
      toast('error', 'Error', 'Failed to save dataset.');
    }
  };

  const del = async (id, name) => {
    if (!window.confirm(`Delete dataset "${name}"? This cannot be undone.`)) return;
    const r = await api(`/api/datasets/${id}`, { method: 'DELETE' });
    if (r.ok) { toast('success', 'Deleted', `"${name}" removed.`); load(); }
  };

  const downloadCSV = (ds) => {
    try {
      const headers = JSON.parse(ds.headers || '[]');
      const rows = JSON.parse(ds.rows || '[]');
      const csv = [headers.join(','), ...rows.map(r => r.map(c => c.includes(',') ? `"${c}"` : c).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${ds.name}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast('error', 'Error', 'Could not export dataset.');
    }
  };

  return (
    <div className="page-view">
      <PageHeader title="Datasets" crumb="Datasets"
        actions={
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="file" ref={fileRef} accept=".csv" onChange={handleCSVUpload} style={{ display: 'none' }} />
            <button className="btn btn-secondary" onClick={() => fileRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Upload size={16} /> Import CSV
            </button>
            <button className="btn btn-primary" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> New Dataset
            </button>
          </div>
        }
      />

      {/* ─── Dataset List Card ──────────────────────────────── */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={20} />
            <h2 style={{ margin: 0 }}>All Datasets</h2>
            <span className="badge badge-info">{filtered.length}</span>
          </div>
          <div className="search-container">
            <Search size={16} className="search-icon" />
            <input className="form-input" placeholder="Search datasets..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '36px', maxWidth: '280px' }} />
          </div>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Description</th><th>Columns</th><th>Rows</th><th>Usage</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={6}><div className="spinner" /></td></tr>
                : filtered.length === 0
                  ? <tr><td colSpan={6}>
                    <div className="empty-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                      <h3 style={{ marginBottom: '8px' }}>No datasets yet</h3>
                      <p className="text-muted" style={{ marginBottom: '20px' }}>
                        Upload a CSV file or create a dataset manually to power your data-driven tests.
                      </p>
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button className="btn btn-secondary" onClick={() => fileRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Upload size={16} /> Import CSV
                        </button>
                        <button className="btn btn-primary" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Plus size={16} /> Create Manually
                        </button>
                      </div>
                    </div>
                  </td></tr>
                  : filtered.map(ds => {
                    let colCount = 0;
                    try { colCount = JSON.parse(ds.headers || '[]').length; } catch { }
                    return (
                      <tr key={ds.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileSpreadsheet size={18} style={{ color: 'var(--brand)' }} />
                            <span className="cell-bold">{ds.name}</span>
                          </div>
                        </td>
                        <td className="text-muted text-sm">{ds.description || '—'}</td>
                        <td><span className="badge badge-info">{colCount} cols</span></td>
                        <td><span className="badge badge-neutral">{ds.rowCount || 0} rows</span></td>
                        <td>
                          <code style={{ background: 'var(--bg)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', color: 'var(--brand)', fontWeight: 600 }}>
                            {'{{'}column_name{'}}'}
                          </code>
                        </td>
                        <td>
                          <div className="action-row">
                            <button className="act-btn view" onClick={() => openPreview(ds)} title="Preview"><Eye size={16} /></button>
                            <button className="act-btn view" onClick={() => openEdit(ds)} title="Edit"><Edit2 size={16} /></button>
                            <button className="act-btn view" onClick={() => downloadCSV(ds)} title="Export CSV"><Download size={16} /></button>
                            <button className="act-btn kill" onClick={() => del(ds.id, ds.name)} title="Delete"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── How it works info card ──────────────────────────── */}
      <div className="card" style={{ marginTop: '24px', background: 'linear-gradient(135deg, rgba(124,58,237,0.05), rgba(59,130,246,0.05))' }}>
        <div className="card-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Table2 size={20} /> How Data-Driven Testing Works
          </h2>
        </div>
        <div style={{ padding: '20px 24px', lineHeight: 1.8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div>
              <strong style={{ color: 'var(--brand)' }}>Step 1: Create a Dataset</strong>
              <p className="text-muted text-sm">Upload a CSV file or manually build a data table with column headers (like <code>username</code>, <code>password</code>, <code>expected_result</code>).</p>
            </div>
            <div>
              <strong style={{ color: 'var(--brand)' }}>Step 2: Use Variables in Test Steps</strong>
              <p className="text-muted text-sm">In your test step's "Test Data" field, type <code>{'{{'}username{'}}'}</code> or <code>{'{{'}password{'}}'}</code> to reference dataset columns.</p>
            </div>
            <div>
              <strong style={{ color: 'var(--brand)' }}>Step 3: Run — AutoPilot Iterates</strong>
              <p className="text-muted text-sm">When you execute the test, AutoPilot automatically runs it once per row in your dataset, substituting the values each time.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Preview Modal ──────────────────────────────────── */}
      {preview && (
        <div className="modal-overlay" onClick={() => setPreview(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '80vh', overflow: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Eye size={20} /> {preview.name}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setPreview(null)}><X size={18} /></button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ fontSize: '13px' }}>
                <thead>
                  <tr>
                    <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                    {preview.headers.map((h, i) => <th key={i}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row, ri) => (
                    <tr key={ri}>
                      <td style={{ textAlign: 'center', color: 'var(--txt-muted)' }}>{ri + 1}</td>
                      {row.map((cell, ci) => <td key={ci}><code style={{ fontSize: '12px' }}>{cell}</code></td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-muted text-sm" style={{ marginTop: '16px' }}>
              {preview.headers.length} columns · {preview.rows.length} rows · Use <code>{'{{'}column_name{'}}'}</code> in test steps to reference values.
            </p>
          </div>
        </div>
      )}

      {/* ─── Create/Edit Modal ──────────────────────────────── */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '900px', maxHeight: '85vh', overflow: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>{editing ? 'Edit Dataset' : 'Create Dataset'}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div className="form-group">
                <label className="form-label">Dataset Name *</label>
                <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Login Credentials" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input className="form-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description" />
              </div>
            </div>

            {/* Inline Table Editor */}
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="text-muted text-sm">{form.headers.length} columns · {form.rows.length} rows</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-ghost btn-sm" onClick={addColumn} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Plus size={14} /> Column</button>
                <button className="btn btn-ghost btn-sm" onClick={addRow} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Plus size={14} /> Row</button>
              </div>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg)' }}>
                    <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', width: '40px', textAlign: 'center' }}>#</th>
                    {form.headers.map((h, ci) => (
                      <th key={ci} style={{ padding: '4px', borderBottom: '1px solid var(--border)', minWidth: '140px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input
                            value={h}
                            onChange={e => updateHeader(ci, e.target.value)}
                            style={{
                              flex: 1, border: '1px solid transparent', background: 'transparent', padding: '6px 8px',
                              borderRadius: '4px', fontWeight: 700, fontSize: '12px', color: 'var(--brand)',
                              outline: 'none', transition: 'border-color 0.2s'
                            }}
                            onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                            onBlur={e => e.target.style.borderColor = 'transparent'}
                          />
                          {form.headers.length > 1 && (
                            <button onClick={() => removeColumn(ci)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '2px', opacity: 0.5 }} title="Remove column">
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      </th>
                    ))}
                    <th style={{ width: '40px', borderBottom: '1px solid var(--border)' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {form.rows.map((row, ri) => (
                    <tr key={ri} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '4px 12px', textAlign: 'center', color: 'var(--txt-muted)', fontSize: '11px' }}>{ri + 1}</td>
                      {row.map((cell, ci) => (
                        <td key={ci} style={{ padding: '2px 4px' }}>
                          <input
                            value={cell}
                            onChange={e => updateCell(ri, ci, e.target.value)}
                            style={{
                              width: '100%', border: '1px solid transparent', background: 'transparent',
                              padding: '6px 8px', borderRadius: '4px', fontSize: '12px',
                              outline: 'none', transition: 'border-color 0.2s', color: 'var(--txt)'
                            }}
                            onFocus={e => e.target.style.borderColor = 'var(--border)'}
                            onBlur={e => e.target.style.borderColor = 'transparent'}
                            placeholder="..."
                          />
                        </td>
                      ))}
                      <td style={{ padding: '4px' }}>
                        {form.rows.length > 1 && (
                          <button onClick={() => removeRow(ri)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '2px', opacity: 0.5 }} title="Remove row">
                            <X size={12} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '12px', padding: '12px 16px', background: 'rgba(124,58,237,0.05)', borderRadius: '8px', fontSize: '13px', color: 'var(--txt-muted)' }}>
              💡 <strong>Tip:</strong> Use column names as variables in your test steps. For example, if you have a column called <code>username</code>, type <code>{'{{'}username{'}}'}</code> in the test data field.
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Save size={16} /> {editing ? 'Update' : 'Create'} Dataset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
