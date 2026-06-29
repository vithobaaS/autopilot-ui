import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/apiClient';
import { ScrollText, Search } from 'lucide-react';
import { fmt } from '../../utils/helpers';
import { PageHeader, Card } from '../../components/common/PageComponents';

export default function AuditLogsView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api('/api/audit-logs')
      .then(res => res.json())
      .then(data => { setLogs(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const actionBadge = (action) => {
    switch(action) {
      case 'CREATE': return <span className="badge badge-success">CREATE</span>;
      case 'UPDATE': return <span className="badge badge-primary">UPDATE</span>;
      case 'DELETE': return <span className="badge badge-error">DELETE</span>;
      default: return <span className="badge">{action}</span>;
    }
  };

  const filteredLogs = logs.filter(log => 
    (log.userEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.entityType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.details || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-view">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Audit Logs</h1>
          <div className="breadcrumbs">
            <Link to="/dashboard">Home</Link>
            <span className="sep">›</span>
            <span>Administration</span>
            <span className="sep">›</span>
            <span>Audit Logs</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ScrollText size={18} /> Immutable Audit Trail</h2>
            <p>Track changes to environments, test suites, and system settings across your organization.</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--txt-muted)' }} />
              <input
                type="text"
                placeholder="Search logs..."
                className="input"
                style={{ paddingLeft: 36, width: 250 }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5"><div className="spinner" style={{ margin: '20px auto' }} /></td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="empty-state">
                      <ScrollText size={48} color="var(--border)" style={{ marginBottom: 16 }} />
                      <h3>No Audit Logs Found</h3>
                      <p>System events will appear here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td style={{ whiteSpace: 'nowrap' }}><span className="text-muted text-sm">{fmt(log.createdAt)}</span></td>
                    <td><span className="cell-bold">{log.userEmail}</span></td>
                    <td>{actionBadge(log.action)}</td>
                    <td><code style={{ fontSize: '12px' }}>{log.entityType}</code></td>
                    <td>{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
