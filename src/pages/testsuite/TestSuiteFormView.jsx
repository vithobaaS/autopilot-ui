import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/apiClient';
import { statusBadge } from '../../utils/helpers';
import { toast } from '../../components/common/ToastContainer';
import { PageHeader, ItemPicker } from '../../components/common/PageComponents';

export default function TestSuiteFormView() {
  const { id } = useParams(); const isEdit = !!id; const navigate = useNavigate();
  const [name, setName] = useState(''); const [desc, setDesc] = useState(''); const [browser, setBrowser] = useState('chrome');
  const [allGroups, setAllGroups] = useState([]); const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false); const [loaded, setLoaded] = useState(!isEdit);

  useEffect(() => { api('/api/test-case-groups').then(r => r.json()).then(setAllGroups).catch(() => {}); }, []);
  useEffect(() => {
    if (isEdit) {
      api(`/api/test-suites/${id}`).then(r => r.json()).then(d => {
        setName(d.suite.name); setDesc(d.suite.description || ''); setBrowser(d.suite.browserType || 'chrome');
        setSelected((d.groups || []).map(g => g.group.id));
        setLoaded(true);
      });
    }
  }, [id, isEdit]);

  const toggle = (gId) => setSelected(p => p.includes(gId) ? p.filter(x => x !== gId) : [...p, gId]);

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    const url = isEdit ? `/api/test-suites/${id}` : '/api/test-suites';
    const method = isEdit ? 'PUT' : 'POST';
    const r = await api(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, description: desc, browserType: browser, testCaseGroupIds: selected }) });
    if (r.ok) { toast('success', isEdit ? 'Updated!' : 'Created!', `"${name}" with ${selected.length} group(s).`); setTimeout(() => navigate('/test-suites'), 900); }
    else { toast('error', 'Failed'); setSaving(false); }
  };

  if (!loaded) return <div className="page-view"><div className="spinner" style={{ marginTop: 80 }} /></div>;

  return (
    <div className="page-view">
      <PageHeader title={isEdit ? 'Edit Suite' : 'Create Suite'} actions={<Link to="/test-suites" className="btn btn-ghost">← Back</Link>} />
      <div className="card form-card"><div className="card-header"><div><h2>🗂️ {isEdit ? 'Edit' : 'New'} Test Suite</h2></div></div>
        <form onSubmit={save}><div className="form-section"><div className="form-grid cols-1">
          <div className="form-group"><label className="form-label">Suite Name <span className="req">*</span></label><input className="form-input" placeholder="e.g. Full Regression Suite" value={name} onChange={e => setName(e.target.value)} required /></div>
          <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" placeholder="What does this suite test?" value={desc} onChange={e => setDesc(e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Browser</label>
            <select className="form-select" value={browser} onChange={e => setBrowser(e.target.value)}>
              <option value="chrome">🌐 Chrome</option><option value="firefox">🦊 Firefox</option><option value="edge">🔷 Edge</option>
            </select></div>
          <div className="form-group"><label className="form-label">Assign Groups</label>
            <ItemPicker items={allGroups} selected={selected} onToggle={toggle} getLabel={g => g.name} getSub={g => g.description || 'No description'} getMeta={g => <span className={`badge ${statusBadge(g.status)}`}>{g.status}</span>} />
            {allGroups.length === 0 && <span className="form-hint">No groups — <Link to="/test-case-groups/create" style={{color:'var(--brand)'}}>create one first</Link></span>}
          </div>
        </div></div>
        <div className="form-actions"><Link to="/test-suites" className="btn btn-ghost">Cancel</Link>
          <button type="submit" className="btn btn-success" disabled={saving}>{saving ? '⏳' : '💾'} {isEdit ? 'Update' : 'Save'} ({selected.length} groups)</button>
        </div></form>
      </div>
    </div>
  );
}
