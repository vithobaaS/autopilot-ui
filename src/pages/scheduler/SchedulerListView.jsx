import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/apiClient';
import { fmt, statusBadge } from '../../utils/helpers';
import { toast } from '../../components/common/ToastContainer';
import { PageHeader, TableCard } from '../../components/common/PageComponents';
import { Edit2, Trash2, Plus, Calendar } from 'lucide-react';

const DAY_OPTIONS = [
  { key: 'MON', label: 'Mon' }, { key: 'TUE', label: 'Tue' }, { key: 'WED', label: 'Wed' },
  { key: 'THU', label: 'Thu' }, { key: 'FRI', label: 'Fri' }, { key: 'SAT', label: 'Sat' },
  { key: 'SUN', label: 'Sun' },
];

function formatTime12h(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

function formatScheduleSummary(s) {
  if (!s.recurrenceType && !s.scheduledDate && !s.scheduledTime && !s.cronExpression) {
    return s.executionType === 'now' ? 'Run immediately' : '—';
  }
  const timeStr = s.scheduledTime ? formatTime12h(s.scheduledTime) : '';
  const dateStr = s.scheduledDate ? new Date(s.scheduledDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
  switch (s.recurrenceType) {
    case 'once':    return `Once on ${dateStr}${timeStr ? ' at ' + timeStr : ''}`;
    case 'daily':   return `Every day at ${timeStr}`;
    case 'weekly': {
      const days = (s.recurrenceDays || '').split(',').map(d => DAY_OPTIONS.find(x => x.key === d.trim())?.label || d).join(', ');
      return `Every ${days} at ${timeStr}`;
    }
    case 'monthly': return `Monthly on day ${s.scheduledDate ? new Date(s.scheduledDate).getDate() : '?'} at ${timeStr}`;
    default: return s.cronExpression || '—';
  }
}

export default function SchedulerListView() {
  const [data, setData] = useState([]); const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState(10); const [page, setPage] = useState(0);

  useEffect(() => { api('/api/schedulers').then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const remove = (id) => {
    if (!window.confirm('Delete this scheduler?')) return;
    api(`/api/schedulers/${id}`, { method: 'DELETE' }).then(r => {
      if (r.ok) { setData(p => p.filter(s => s.id !== id)); toast('success', 'Deleted', 'Scheduler removed.'); }
      else toast('error', 'Error', 'Failed to delete.');
    });
  };

  const allSchedulers = data;
  const paged = allSchedulers.slice(page * entries, (page + 1) * entries);

  return (
    <div className="page-view">
      <PageHeader title="Schedulers" crumb="All Schedulers" actions={<Link to="/scheduler/create" className="btn btn-primary" style={{display:'flex',alignItems:'center',gap:'6px'}}><Plus size={16}/> New Scheduler</Link>} />
      <TableCard title="Scheduled Test Runs" total={allSchedulers.length} entries={entries} onEntries={n => { setEntries(n); setPage(0); }} page={page} onPage={setPage}>
        <table className="data-table">
          <thead><tr><th>Suite Name</th><th>Type</th><th>Schedule</th><th>Browser</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? <tr className="row-loading"><td colSpan={7}><div className="spinner"/></td></tr>
            : paged.length === 0 ? <tr className="row-empty"><td colSpan={7}><div className="empty-state"><div className="empty-state-icon"><Calendar size={32} style={{margin:'auto'}}/></div><h3>No schedulers yet</h3><p><Link to="/scheduler/create" style={{color:'var(--brand)'}}>Create your first scheduler</Link></p></div></td></tr>
            : paged.map(s => (
              <tr key={s.id}>
                <td><span className="cell-bold">{s.testSuiteName}</span></td>
                <td><span className={`badge ${statusBadge(s.executionType)}`}>{s.executionType === 'now' ? '▶ Now' : '🕐 Scheduled'}</span></td>
                <td><span className="schedule-summary-cell" title={s.cronExpression || ''}>{formatScheduleSummary(s)}</span></td>
                <td><span className={`badge ${statusBadge(s.browserType)}`}>{s.browserType}</span></td>
                <td><span className={`badge ${statusBadge(s.status)}`}>{s.status}</span></td>
                <td><span className="text-muted text-sm">{fmt(s.createdAt)}</span></td>
                <td><div className="action-row">
                  <Link to={`/scheduler/edit/${s.id}`} className="act-btn view" title="Edit"><Edit2 size={16}/></Link>
                  <button className="act-btn delete" title="Delete" onClick={() => remove(s.id)}><Trash2 size={16}/></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>
    </div>
  );
}
