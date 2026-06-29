import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/apiClient';
import { toast } from '../../components/common/ToastContainer';
import { Edit2, Trash2, Plus, Settings, Lock, Save } from 'lucide-react';

const SCOPES = ['GLOBAL', 'SUITE', 'ENVIRONMENT'];

export default function VariablesView() {
  const [variables, setVariables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ keyName: '', value: '', scope: 'GLOBAL', isSecret: false });

  const load = () => {
    setLoading(true);
    api('/api/variables').then(r => r.json()).then(d => { setVariables(d || []); setLoading(false); });
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm({ keyName: '', value: '', scope: 'GLOBAL', isSecret: false }); setEditing(null); setShowForm(true); };
  const openEdit = (v) => { setForm({ keyName: v.keyName, value: v.value, scope: v.scope, isSecret: v.isSecret }); setEditing(v.id); setShowForm(true); };

  const save = async () => {
    if (!form.keyName.trim()) { toast('error', 'Validation', 'Variable name is required.'); return; }
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/variables/${editing}` : '/api/variables';
    const r = await api(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (r.ok) { toast('success', editing ? 'Updated' : 'Created', `Variable "${form.keyName}" saved.`); setShowForm(false); load(); }
    else { toast('error', 'Error', 'Failed to save variable.'); }
  };

  const del = async (id, name) => {
    if (!window.confirm(`Delete variable "${name}"?`)) return;
    await api(`/api/variables/${id}`, { method: 'DELETE' });
    toast('success', 'Deleted', `"${name}" removed.`); load();
  };

  const scopeColor = (s) => s === 'GLOBAL' ? '#3b82f6' : s === 'SUITE' ? '#8b5cf6' : '#10b981';

  return (
    <div className="page-view">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Variables</h1>
          <div className="breadcrumbs"><Link to="/dashboard">Home</Link><span className="sep">›</span><span>Variables</span></div>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openCreate} style={{display:'flex',alignItems:'center',gap:'6px'}}><Plus size={16}/> New Variable</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}><h2 style={{display:'flex',alignItems:'center',gap:'6px'}}><Settings size={20}/> Variable Registry</h2><p>Use <code>$&#123;variable_name&#125;</code> in test data to inject values at runtime.</p></div>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Value</th><th>Scope</th><th>Secret</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={5}><div className="spinner" /></td></tr>
              : variables.length === 0 ? <tr><td colSpan={5}><div className="empty-state"><div className="empty-state-icon"><Settings size={32} style={{margin:'auto'}}/></div><h3>No variables yet</h3><p>Create your first variable to start injecting dynamic values into test steps.</p></div></td></tr>
              : variables.map(v => (
                <tr key={v.id}>
                  <td><code style={{ color: 'var(--brand)', fontWeight: 700 }}>${'{'}{ v.keyName }{'}'}</code></td>
                  <td><span style={{ fontFamily: 'monospace', color: v.isSecret ? '#9ca3af' : 'var(--txt)' }}>{v.value}</span></td>
                  <td><span className="badge" style={{ background: scopeColor(v.scope) + '22', color: scopeColor(v.scope), border: `1px solid ${scopeColor(v.scope)}55` }}>{v.scope}</span></td>
                  <td>{v.isSecret ? <div style={{display:'flex',alignItems:'center',gap:'4px'}}><Lock size={14}/> Yes</div> : '—'}</td>
                  <td>
                    <div className="action-row">
                      <button className="act-btn view" onClick={() => openEdit(v)} title="Edit"><Edit2 size={16}/></button>
                      <button className="act-btn kill" style={{ color: '#dc2626' }} onClick={() => del(v.id, v.keyName)} title="Delete"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2 style={{display:'flex',alignItems:'center',gap:'6px'}}>{editing ? <><Edit2 size={18}/> Edit Variable</> : <><Plus size={18}/> New Variable</>}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="field-label">Variable Name *</label>
                <input className="field-input" placeholder="e.g. BASE_URL" value={form.keyName} onChange={e => setForm(f => ({ ...f, keyName: e.target.value }))} />
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 4 }}>Use as <code style={{ color: 'var(--brand)' }}>${'{'}{ form.keyName || 'VAR_NAME' }{'}'}</code> in test data</div>
              </div>
              <div>
                <label className="field-label">Value</label>
                <input className="field-input" type={form.isSecret ? 'password' : 'text'} placeholder="Variable value" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} />
              </div>
              <div>
                <label className="field-label">Scope</label>
                <select className="field-input" value={form.scope} onChange={e => setForm(f => ({ ...f, scope: e.target.value }))}>
                  {SCOPES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" id="isSecret" checked={form.isSecret} onChange={e => setForm(f => ({ ...f, isSecret: e.target.checked }))} />
                <label htmlFor="isSecret" style={{ fontSize: '0.85rem', color: 'var(--txt)', display:'flex', alignItems:'center', gap:'4px' }}><Lock size={14}/> Secret (value will be masked in UI)</label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} style={{display:'flex',alignItems:'center',gap:'6px'}}><Save size={16}/> Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
