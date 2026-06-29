import { useState, useEffect } from 'react';
import { api } from '../../api/apiClient';
import { fmt } from '../../utils/helpers';
import { PageHeader, TableCard } from '../../components/common/PageComponents';

export default function AgentListView() {
  const [data, setData] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(''); 
  const [entries, setEntries] = useState(10); 
  const [page, setPage] = useState(0);

  useEffect(() => { 
    api('/api/agents')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false)); 
  }, []);

  const filtered = data.filter(a => 
    (a.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (a.os || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.id || '').toLowerCase().includes(search.toLowerCase())
  );
  
  const paged = filtered.slice(page * entries, (page + 1) * entries);

  // Helper to determine if an agent is online (seen in the last 2 minutes)
  const isOnline = (lastSeenAt) => {
    if (!lastSeenAt) return false;
    const diff = new Date() - new Date(lastSeenAt);
    return diff < 120000; // 2 minutes
  };

  return (
    <div className="page-view">
      <PageHeader title="Agent Directory" />
      <TableCard 
        title="Physical Agents" 
        total={filtered.length} 
        search={search} 
        onSearch={s => { setSearch(s); setPage(0); }} 
        entries={entries} 
        onEntries={n => { setEntries(n); setPage(0); }} 
        page={page} 
        onPage={setPage}
      >
        <table className="data-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Agent Name</th>
              <th>OS</th>
              <th>Version</th>
              <th>Last Seen</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="row-loading"><td colSpan={5}><div className="spinner"/></td></tr>
            ) : paged.length === 0 ? (
              <tr className="row-empty">
                <td colSpan={5}>
                  <div className="empty-state">
                    <div className="empty-state-icon">🖥️</div>
                    <h3>No agents found</h3>
                    <p>Install the local agent to see it here.</p>
                  </div>
                </td>
              </tr>
            ) : paged.map(a => {
              const online = isOnline(a.lastSeenAt);
              return (
                <tr key={a.id}>
                  <td>
                    <span className={`status-badge ${online ? 'success' : 'error'}`}>
                      {online ? 'Online' : 'Offline'}
                    </span>
                  </td>
                  <td>
                    <div className="cell-bold">{a.name || 'Unnamed Agent'}</div>
                    <div className="text-muted text-xs">{a.id}</div>
                  </td>
                  <td className="text-muted">{a.os || 'Unknown'}</td>
                  <td className="text-muted">{a.agentVersion || '—'}</td>
                  <td className="text-muted text-sm">{fmt(a.lastSeenAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableCard>
    </div>
  );
}
