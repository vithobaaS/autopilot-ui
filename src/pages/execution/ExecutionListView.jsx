import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/apiClient';
import { fmt, statusBadge } from '../../utils/helpers';
import { toast } from '../../components/common/ToastContainer';
import { PageHeader, TableCard } from '../../components/common/PageComponents';
import { Eye, StopCircle, RotateCw, PlayCircle } from 'lucide-react';

export default function ExecutionListView({ type }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [entries, setEntries] = useState(10);
  const [page, setPage] = useState(0);

  const fetchExecutions = () => {
    api('/api/executions')
      .then(r => r.json())
      .then(d => {
        setData(d || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        toast('error', 'Error', 'Failed to fetch executions');
      });
  };

  useEffect(() => {
    setLoading(true);
    fetchExecutions();
    
    // Auto-refresh for running executions
    let interval;
    if (type === 'running') {
      interval = setInterval(fetchExecutions, 3000);
    }
    return () => clearInterval(interval);
  }, [type]);

  const getName = (e) => {
    try { return JSON.parse(e.environmentJson || '{}').referenceId || `Run #${e.orgExecutionId || e.id}`; }
    catch { return `Run #${e.orgExecutionId || e.id}`; }
  };

  const getBrowser = (e) => {
    try { return (JSON.parse(e.environmentJson || '{}').browserTypeName || 'chrome').toLowerCase(); }
    catch { return 'chrome'; }
  };

  const stopExecution = async (id) => {
    if (!window.confirm("Are you sure you want to stop this execution?")) return;
    try {
      const res = await api(`/api/executions/${id}/stop`, { method: 'POST' });
      if (res.ok) {
        setData(data.map(e => e.id === id ? { ...e, status: 'aborted' } : e));
        toast('success', 'Stopped', 'Execution stopped successfully.');
      } else {
        toast('error', 'Error', 'Failed to stop execution.');
      }
    } catch {
      toast('error', 'Error', 'Error connecting to server.');
    }
  };

  const rerunExecution = async (id) => {
    try {
      const res = await api(`/api/executions/${id}/rerun`, { method: 'POST' });
      if (res.ok) {
        toast('success', 'Success', 'Re-run triggered successfully.');
        setTimeout(fetchExecutions, 1000);
      } else {
        toast('error', 'Error', 'Failed to re-run execution.');
      }
    } catch {
      toast('error', 'Error', 'Error connecting to server.');
    }
  };

  const durationStr = (e) => {
    if (!e.createdAt || !e.finishedAt) return '—';
    const ms = new Date(e.finishedAt) - new Date(e.createdAt);
    if (ms < 0) return '—';
    return `${Math.floor(ms / 1000)}s`;
  };

  const sortedExecs = [...data].sort((a, b) => b.id - a.id);
  
  // Filter by type
  const typeFiltered = sortedExecs.filter(e => {
    const s = (e.status || '').toLowerCase();
    if (type === 'running') return ['running', 'queued', 'assigned'].includes(s);
    if (type === 'history') return ['success', 'completed', 'failed', 'aborted'].includes(s);
    return true;
  });

  // Filter by search
  const filtered = typeFiltered.filter(e => {
    const q = search.toLowerCase();
    return getName(e).toLowerCase().includes(q) || (e.status || '').toLowerCase().includes(q) || String(e.id).includes(q);
  });

  const paged = filtered.slice(page * entries, (page + 1) * entries);

  const title = type === 'running' ? 'Active Executions' : 'Execution History';
  const crumb = type === 'running' ? 'Running' : 'History';

  return (
    <div className="page-view">
      <PageHeader title={title} crumb={crumb} />
      
      <TableCard 
        title={title} 
        search={search} 
        onSearch={s => { setSearch(s); setPage(0); }} 
        total={filtered.length} 
        entries={entries} 
        onEntries={n => { setEntries(n); setPage(0); }} 
        page={page} 
        onPage={setPage}
      >
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Suite Name</th>
              <th>Status</th>
              <th>Browser</th>
              <th>Duration</th>
              <th>Started</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && data.length === 0 ? (
              <tr className="row-loading"><td colSpan={7}><div className="spinner"/></td></tr>
            ) : paged.length === 0 ? (
              <tr className="row-empty">
                <td colSpan={7}>
                  <div className="empty-state">
                    <div className="empty-state-icon">{type === 'running' ? <PlayCircle size={32} /> : <Eye size={32} />}</div>
                    <h3>{type === 'running' ? 'No active executions' : 'No execution history'}</h3>
                    <p>{type === 'running' ? 'All executions have finished. Check the history tab.' : 'Run a test suite to see history here.'}</p>
                  </div>
                </td>
              </tr>
            ) : paged.map(e => (
              <tr key={e.id}>
                <td><span className="text-muted">#{e.orgExecutionId || e.id}</span></td>
                <td><Link to={`/executions/${e.id}`} className="cell-bold cell-link">{getName(e)}</Link></td>
                <td><span className={`badge ${statusBadge(e.status)}`}>{e.status}</span></td>
                <td><span className={`badge ${statusBadge(getBrowser(e))}`}>{getBrowser(e)}</span></td>
                <td>{durationStr(e)}</td>
                <td><span className="text-muted text-sm">{fmt(e.createdAt)}</span></td>
                <td>
                  <div className="action-row">
                    <Link to={`/executions/${e.id}`} className="act-btn view" title="View Details"><Eye size={16} /></Link>
                    {['running', 'queued', 'assigned'].includes((e.status || '').toLowerCase()) ? (
                      <button className="act-btn delete" onClick={() => stopExecution(e.id)} title="Stop Execution"><StopCircle size={16} /></button>
                    ) : (
                      <button className="act-btn view" onClick={() => rerunExecution(e.id)} title="Re-run Execution"><RotateCw size={16} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>
    </div>
  );
}
