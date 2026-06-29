import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/apiClient';
import { toast } from '../../components/common/ToastContainer';
import { PageHeader } from '../../components/common/PageComponents';

export default function CreateGroupView() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    const r = await api('/api/groups', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, description: desc }) });
    if (r.ok) { toast('success', 'Created!'); setTimeout(() => navigate('/groups'), 800); } else { toast('error', 'Failed'); setSaving(false); }
  };

  return (
    <div className="page-view">
      <PageHeader title="Create Agent Group" actions={<Link to="/groups" className="btn btn-ghost">← Back</Link>} />
      <div className="card form-card"><div className="card-header"><h2>👥 Group Details</h2></div>
        <form onSubmit={save}><div className="form-section"><div className="form-grid cols-1">
          <div className="form-group"><label className="form-label">Group Name <span className="req">*</span></label><input className="form-input" placeholder="e.g. QA Team Alpha" value={name} onChange={e => setName(e.target.value)} required /></div>
          <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" placeholder="Describe this group…" value={desc} onChange={e => setDesc(e.target.value)} /></div>
        </div></div>
        <div className="form-actions"><Link to="/groups" className="btn btn-ghost">Cancel</Link><button type="submit" className="btn btn-success" disabled={saving}>{saving ? '⏳' : '💾'} Save</button></div></form>
      </div>
    </div>
  );
}
