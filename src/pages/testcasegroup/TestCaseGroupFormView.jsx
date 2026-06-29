import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/apiClient';
import { statusBadge } from '../../utils/helpers';
import { toast } from '../../components/common/ToastContainer';
import { PageHeader, ItemPicker } from '../../components/common/PageComponents';

export default function TestCaseGroupFormView() {
  const { id } = useParams(); const isEdit = !!id; const navigate = useNavigate();
  const [name, setName] = useState(''); const [desc, setDesc] = useState('');
  const [allCases, setAllCases] = useState([]); const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false); const [loaded, setLoaded] = useState(!isEdit);

  useEffect(() => { api('/api/test-cases').then(r => r.json()).then(setAllCases).catch(() => {}); }, []);
  useEffect(() => {
    if (isEdit) {
      api(`/api/test-case-groups/${id}`).then(r => r.json()).then(d => {
        setName(d.group.name); setDesc(d.group.description || '');
        setSelected((d.testCases || []).map(tc => tc.testCase.id));
        setLoaded(true);
      });
    }
  }, [id, isEdit]);

  const toggle = (tcId) => setSelected(p => p.includes(tcId) ? p.filter(x => x !== tcId) : [...p, tcId]);

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    const url = isEdit ? `/api/test-case-groups/${id}` : '/api/test-case-groups';
    const method = isEdit ? 'PUT' : 'POST';
    const r = await api(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, description: desc, testCaseIds: selected }) });
    if (r.ok) { toast('success', isEdit ? 'Updated!' : 'Created!', `"${name}" with ${selected.length} case(s).`); setTimeout(() => navigate('/test-case-groups'), 900); }
    else { toast('error', 'Failed'); setSaving(false); }
  };

  if (!loaded) return <div className="page-view"><div className="spinner" style={{ marginTop: 80 }} /></div>;

  return (
    <div className="page-view">
      <PageHeader title={isEdit ? 'Edit Group' : 'Create Group'} actions={<Link to="/test-case-groups" className="btn btn-ghost">← Back</Link>} />
      <div className="card form-card"><div className="card-header"><div><h2>📁 {isEdit ? 'Edit' : 'New'} Test Case Group</h2></div></div>
        <form onSubmit={save}><div className="form-section"><div className="form-grid cols-1">
          <div className="form-group"><label className="form-label">Group Name <span className="req">*</span></label><input className="form-input" placeholder="e.g. Authentication Tests" value={name} onChange={e => setName(e.target.value)} required /></div>
          <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" placeholder="What does this group test?" value={desc} onChange={e => setDesc(e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Assign Test Cases</label>
            <ItemPicker items={allCases} selected={selected} onToggle={toggle} getLabel={tc => tc.name} getSub={tc => tc.description || 'No description'} getMeta={tc => <span className={`badge ${statusBadge(tc.status)}`}>{tc.status}</span>} />
            {allCases.length === 0 && <span className="form-hint">No test cases — <Link to="/test-cases/create" style={{color:'var(--brand)'}}>create one first</Link></span>}
          </div>
        </div></div>
        <div className="form-actions"><Link to="/test-case-groups" className="btn btn-ghost">Cancel</Link>
          <button type="submit" className="btn btn-success" disabled={saving}>{saving ? '⏳' : '💾'} {isEdit ? 'Update' : 'Save'} ({selected.length} cases)</button>
        </div></form>
      </div>
    </div>
  );
}
