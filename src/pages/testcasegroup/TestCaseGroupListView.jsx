import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/apiClient';
import { fmt, statusBadge } from '../../utils/helpers';
import { toast } from '../../components/common/ToastContainer';
import { PageHeader, TableCard } from '../../components/common/PageComponents';
import { Eye, Edit2, Trash2, ChevronUp, Plus, Folder } from 'lucide-react';

export default function TestCaseGroupListView() {
  const [data, setData] = useState([]); const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(''); const [entries, setEntries] = useState(10); const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState(null); const [expandedCases, setExpandedCases] = useState([]);

  useEffect(() => { api('/api/test-case-groups').then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const toggle = (id) => { if (expanded === id) { setExpanded(null); return; } setExpanded(id); api(`/api/test-case-groups/${id}`).then(r => r.json()).then(d => setExpandedCases(d.testCases || [])); };
  const remove = (id) => { api(`/api/test-case-groups/${id}`, { method: 'DELETE' }).then(r => { if (r.ok) { setData(p => p.filter(g => g.id !== id)); toast('success', 'Deleted'); } }); };

  const filtered = data.filter(g => g.name.toLowerCase().includes(search.toLowerCase()));
  const paged = filtered.slice(page * entries, (page + 1) * entries);

  return (
    <div className="page-view">
      <PageHeader title="Test Case Groups" actions={<Link to="/test-case-groups/create" className="btn btn-primary" style={{display:'flex',alignItems:'center',gap:'6px'}}><Plus size={16}/> New Group</Link>} />
      <TableCard title="All Test Case Groups" total={filtered.length} search={search} onSearch={s => { setSearch(s); setPage(0); }} entries={entries} onEntries={n => { setEntries(n); setPage(0); }} page={page} onPage={setPage}>
        <table className="data-table"><thead><tr><th>ID</th><th>Name</th><th>Description</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
          <tbody>{loading ? <tr className="row-loading"><td colSpan={6}><div className="spinner"/></td></tr>
            : paged.length === 0 ? <tr className="row-empty"><td colSpan={6}><div className="empty-state"><div className="empty-state-icon"><Folder size={32} style={{margin:'auto'}}/></div><h3>No groups yet</h3></div></td></tr>
            : paged.map(g => (<>
              <tr key={g.id} className={expanded === g.id ? 'row-expanded' : ''}>
                <td><span className="cell-bold">#{g.id}</span></td><td><span className="cell-bold">{g.name}</span></td><td className="text-muted text-sm">{g.description || '—'}</td>
                <td><span className={`badge ${statusBadge(g.status)}`}>{g.status}</span></td><td className="text-muted text-sm">{fmt(g.createdAt)}</td>
                <td><div className="action-row">
                  <button className="act-btn view" onClick={() => toggle(g.id)}>{expanded === g.id ? <ChevronUp size={16}/> : <Eye size={16}/>}</button>
                  <Link to={`/test-case-groups/edit/${g.id}`} className="act-btn view" title="Edit"><Edit2 size={16}/></Link>
                  <button className="act-btn delete" onClick={() => remove(g.id)}><Trash2 size={16}/></button>
                </div></td>
              </tr>
              {expanded === g.id && <tr key={`${g.id}-exp`} className="expand-panel"><td colSpan={6}><div className="expand-panel-inner">
                <div className="expand-panel-title">📋 Test Cases ({expandedCases.length})</div>
                {expandedCases.length === 0 ? <p className="text-muted text-sm" style={{fontStyle:'italic'}}>No test cases assigned.</p> : (
                  <div className="nested-table"><table className="data-table"><thead><tr><th>#</th><th>Name</th><th>Steps</th><th>Status</th></tr></thead>
                    <tbody>{expandedCases.map((item, idx) => (<tr key={idx}><td className="cell-bold">{item.caseOrder + 1}</td><td className="cell-bold">{item.testCase.name}</td><td><span className="badge badge-info">{(item.steps || []).length} steps</span></td><td><span className={`badge ${statusBadge(item.testCase.status)}`}>{item.testCase.status}</span></td></tr>))}</tbody>
                  </table></div>
                )}
              </div></td></tr>}
            </>))}</tbody>
        </table>
      </TableCard>
    </div>
  );
}
