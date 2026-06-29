import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/apiClient';
import { toast } from '../../components/common/ToastContainer';
import { Edit2, Trash2, Plus, Globe, Settings, Lock, Save } from 'lucide-react';

const ENV_COLORS = { DEV: '#3b82f6', QA: '#f59e0b', UAT: '#8b5cf6', PREPROD: '#f97316', PROD: '#dc2626' };
const getColor = (name) => ENV_COLORS[name?.toUpperCase()] || '#10b981';

export default function EnvironmentsView() {
  const [envs, setEnvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [selectedEnv, setSelectedEnv] = useState(null);
  const [envVars, setEnvVars] = useState([]);
  const [varForm, setVarForm] = useState({ keyName: '', value: '', isSecret: false });
  const [showVarForm, setShowVarForm] = useState(false);

  const loadEnvs = () => {
    setLoading(true);
    api('/api/environments').then(r => r.json()).then(d => { setEnvs(d || []); setLoading(false); });
  };
  const loadVars = (envId) => api(`/api/environments/${envId}/variables`).then(r => r.json()).then(d => setEnvVars(d || []));

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadEnvs(); }, []);
  useEffect(() => { if (selectedEnv) loadVars(selectedEnv.id); }, [selectedEnv]);

  const openCreate = () => { setForm({ name: '', description: '' }); setEditing(null); setShowForm(true); };
  const openEdit = (e) => { setForm({ name: e.name, description: e.description || '' }); setEditing(e.id); setShowForm(true); };

  const save = async () => {
    if (!form.name.trim()) { toast('error', 'Validation', 'Environment name is required.'); return; }
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/environments/${editing}` : '/api/environments';
    const r = await api(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (r.ok) { toast('success', editing ? 'Updated' : 'Created', `"${form.name}" saved.`); setShowForm(false); loadEnvs(); }
    else toast('error', 'Error', 'Failed to save environment.');
  };

  const del = async (id, name) => {
    if (!window.confirm(`Delete environment "${name}"?`)) return;
    await api(`/api/environments/${id}`, { method: 'DELETE' });
    if (selectedEnv?.id === id) setSelectedEnv(null);
    toast('success', 'Deleted', `"${name}" removed.`); loadEnvs();
  };

  const saveVar = async () => {
    if (!varForm.keyName.trim()) { toast('error', 'Validation', 'Variable name is required.'); return; }
    const r = await api(`/api/environments/${selectedEnv.id}/variables`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(varForm)
    });
    if (r.ok) { toast('success', 'Added', `Variable saved.`); setShowVarForm(false); setVarForm({ keyName: '', value: '', isSecret: false }); loadVars(selectedEnv.id); }
    else toast('error', 'Error', 'Failed to save variable.');
  };

  const delVar = async (varId, keyName) => {
    if (!window.confirm(`Delete variable "${keyName}"?`)) return;
    await api(`/api/environments/${selectedEnv.id}/variables/${varId}`, { method: 'DELETE' });
    toast('success', 'Deleted', `"${keyName}" removed.`); loadVars(selectedEnv.id);
  };

  return (
    <div className="page-view">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Environments</h1>
          <div className="breadcrumbs"><Link to="/dashboard">Home</Link><span className="sep">›</span><span>Environments</span></div>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openCreate} style={{display:'flex',alignItems:'center',gap:'6px'}}><Plus size={16}/> New Environment</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20 }}>
        {/* Left: Environment List */}
        <div className="card">
          <div className="card-header" style={{display:'flex',alignItems:'center',gap:'8px'}}><h2><Globe size={20}/> Environments</h2></div>
          <div style={{ padding: '0 16px 16px' }}>
            {loading ? <div className="spinner" style={{ margin: '20px auto' }} /> :
            envs.length === 0 ? <div className="empty-state" style={{ padding: 24 }}><div className="empty-state-icon"><Globe size={32} style={{margin:'auto'}}/></div><h3>No environments</h3><p>Create your first environment (DEV, QA, PROD...).</p></div> :
            envs.map(env => (
              <div key={env.id}
                onClick={() => setSelectedEnv(env)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, cursor: 'pointer', marginBottom: 8, background: selectedEnv?.id === env.id ? 'var(--bg-hover)' : 'transparent', border: `1.5px solid ${selectedEnv?.id === env.id ? getColor(env.name) : 'var(--border)'}`, transition: 'all 0.2s' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: getColor(env.name), flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: 'var(--txt-h)', fontSize: '0.9rem' }}>{env.name}</div>
                  {env.description && <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{env.description}</div>}
                </div>
                <div className="action-row" onClick={e => e.stopPropagation()}>
                  <button className="act-btn view" onClick={() => openEdit(env)} title="Edit"><Edit2 size={16}/></button>
                  <button className="act-btn kill" style={{ color: '#dc2626' }} onClick={() => del(env.id, env.name)} title="Delete"><Trash2 size={16}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Variables for selected env */}
        <div className="card">
          {!selectedEnv ? (
            <div className="empty-state" style={{ padding: 60 }}><div className="empty-state-icon">👈</div><h3>Select an Environment</h3><p>Click an environment to manage its variables.</p></div>
          ) : (
            <>
              <div className="card-header">
                <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                  <h2 style={{ color: getColor(selectedEnv.name), display:'flex',alignItems:'center',gap:'6px' }}><Settings size={20}/> {selectedEnv.name} Variables</h2>
                  <p>These override global variables when running in the <strong>{selectedEnv.name}</strong> environment.</p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowVarForm(true)} style={{display:'flex',alignItems:'center',gap:'6px'}}><Plus size={16}/> Add Variable</button>
              </div>
              <div className="table-responsive">
                <table className="data-table">
                  <thead><tr><th>Variable</th><th>Value</th><th>Secret</th><th>Actions</th></tr></thead>
                  <tbody>
                    {envVars.length === 0 ? (
                      <tr><td colSpan={4}><div className="empty-state" style={{ padding: 24 }}><p>No variables yet for {selectedEnv.name}.</p></div></td></tr>
                    ) : envVars.map(v => (
                      <tr key={v.id}>
                        <td><code style={{ color: 'var(--brand)', fontWeight: 700 }}>${'{'}{ v.keyName }{'}'}</code></td>
                        <td><span style={{ fontFamily: 'monospace' }}>{v.value}</span></td>
                        <td>{v.isSecret ? <Lock size={16} color="#9ca3af"/> : '—'}</td>
                        <td><button className="act-btn kill" style={{ color: '#dc2626' }} onClick={() => delVar(v.id, v.keyName)}><Trash2 size={16}/></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Environment Create/Edit Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="modal-header"><h2 style={{display:'flex',alignItems:'center',gap:'6px'}}>{editing ? <><Edit2 size={18}/> Edit Environment</> : <><Plus size={18}/> New Environment</>}</h2><button className="modal-close" onClick={() => setShowForm(false)}>✕</button></div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="field-label">Name *</label>
                <input className="field-input" placeholder="e.g. DEV, QA, PROD" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="field-label">Description</label>
                <input className="field-input" placeholder="Optional description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </div>
            <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button><button className="btn btn-primary" onClick={save} style={{display:'flex',alignItems:'center',gap:'6px'}}><Save size={16}/> Save</button></div>
          </div>
        </div>
      )}

      {/* Add Variable to Environment Modal */}
      {showVarForm && (
        <div className="modal-overlay" onClick={() => setShowVarForm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="modal-header"><h2 style={{display:'flex',alignItems:'center',gap:'6px'}}><Plus size={18}/> Add Variable to {selectedEnv?.name}</h2><button className="modal-close" onClick={() => setShowVarForm(false)}>✕</button></div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="field-label">Variable Name *</label>
                <input className="field-input" placeholder="e.g. BASE_URL" value={varForm.keyName} onChange={e => setVarForm(f => ({ ...f, keyName: e.target.value }))} />
              </div>
              <div>
                <label className="field-label">Value</label>
                <input className="field-input" type={varForm.isSecret ? 'password' : 'text'} placeholder={`Value for ${selectedEnv?.name}`} value={varForm.value} onChange={e => setVarForm(f => ({ ...f, value: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" id="varIsSecret" checked={varForm.isSecret} onChange={e => setVarForm(f => ({ ...f, isSecret: e.target.checked }))} />
                <label htmlFor="varIsSecret" style={{ fontSize: '0.85rem', color: 'var(--txt)' }}>🔒 Secret</label>
              </div>
            </div>
            <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setShowVarForm(false)}>Cancel</button><button className="btn btn-primary" onClick={saveVar} style={{display:'flex',alignItems:'center',gap:'6px'}}><Save size={16}/> Save</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
