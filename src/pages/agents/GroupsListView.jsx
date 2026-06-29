import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/apiClient';
import { fmt } from '../../utils/helpers';
import { toast } from '../../components/common/ToastContainer';
import { PageHeader, TableCard } from '../../components/common/PageComponents';
import { Eye, Trash2, Plus, Box } from 'lucide-react';

export default function GroupsListView() {
  const [data, setData] = useState([]); const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(''); const [entries, setEntries] = useState(10); const [page, setPage] = useState(0);

  useEffect(() => { api('/api/groups').then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const remove = (id) => { api(`/api/groups/${id}`, { method: 'DELETE' }).then(r => { if (r.ok) { setData(p => p.filter(g => g.id !== id)); toast('success', 'Deleted'); } else toast('error', 'Error'); }); };

  const filtered = data.filter(g => g.name.toLowerCase().includes(search.toLowerCase()) || (g.description || '').toLowerCase().includes(search.toLowerCase()));
  const paged = filtered.slice(page * entries, (page + 1) * entries);

  return (
    <div className="page-view">
      <PageHeader title="Agent Pools" actions={<Link to="/groups/create" className="btn btn-primary" style={{display:'flex',alignItems:'center',gap:'6px'}}><Plus size={16}/> New Pool</Link>} />
      <TableCard title="Agent Group Directory" total={filtered.length} search={search} onSearch={s => { setSearch(s); setPage(0); }} entries={entries} onEntries={n => { setEntries(n); setPage(0); }} page={page} onPage={setPage}>
        <table className="data-table"><thead><tr><th>ID</th><th>Name</th><th>Description</th><th>Created</th><th>Actions</th></tr></thead>
          <tbody>{loading ? <tr className="row-loading"><td colSpan={5}><div className="spinner"/></td></tr>
            : paged.length === 0 ? <tr className="row-empty"><td colSpan={5}><div className="empty-state"><div className="empty-state-icon"><Box size={32} style={{margin:'auto'}}/></div><h3>No pools yet</h3></div></td></tr>
            : paged.map(g => (<tr key={g.id}><td><span className="cell-bold">#{g.id}</span></td><td><span className="cell-bold"><Link to={`/groups/${g.id}`}>{g.name}</Link></span></td><td className="text-muted">{g.description || '—'}</td><td className="text-muted text-sm">{fmt(g.createdAt)}</td><td><div className="action-row"><Link to={`/groups/${g.id}`} className="act-btn view"><Eye size={16}/></Link><button className="act-btn delete" onClick={() => remove(g.id)}><Trash2 size={16}/></button></div></td></tr>))}</tbody>
        </table>
      </TableCard>
    </div>
  );
}
