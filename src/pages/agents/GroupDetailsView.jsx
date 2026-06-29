import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/apiClient';
import { toast } from '../../components/common/ToastContainer';
import { PageHeader, TableCard } from '../../components/common/PageComponents';
import { fmt } from '../../utils/helpers';

export default function GroupDetailsView() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [assignedAgents, setAssignedAgents] = useState([]);
  const [allAgents, setAllAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('');

  const loadData = async () => {
    try {
      const [groupsRes, agentsRes, assignedRes] = await Promise.all([
        api('/api/groups').then(r => r.json()),
        api('/api/agents').then(r => r.json()),
        api(`/api/groups/${id}/agents`).then(r => r.json())
      ]);
      
      const foundGroup = groupsRes.find(g => g.id === parseInt(id));
      if (foundGroup) setGroup(foundGroup);
      
      setAllAgents(agentsRes);
      setAssignedAgents(assignedRes);
    } catch {
      toast('error', 'Failed to load group details');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { loadData(); }, [id]);

  const handleAddAgent = async (e) => {
    e.preventDefault();
    if (!selectedAgent) return;
    setAdding(true);
    try {
      const res = await api(`/api/groups/${id}/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: selectedAgent })
      });
      if (res.ok) {
        toast('success', 'Agent added to group!');
        setSelectedAgent('');
        loadData();
      } else {
        toast('error', 'Failed to add agent to group');
      }
    } catch {
      toast('error', 'Network error');
    } finally {
      setAdding(false);
    }
  };

  const removeAgent = async (agentId) => {
    if (!window.confirm("Remove this agent from the group?")) return;
    try {
      const res = await api(`/api/groups/${id}/agents/${agentId}`, { method: 'DELETE' });
      if (res.ok) {
        toast('success', 'Agent removed');
        setAssignedAgents(prev => prev.filter(m => m.agent.id !== agentId));
      } else {
        toast('error', 'Failed to remove agent');
      }
    } catch {
      toast('error', 'Network error');
    }
  };

  const isOnline = (lastSeenAt) => {
    if (!lastSeenAt) return false;
    return (new Date() - new Date(lastSeenAt)) < 120000;
  };

  // Filter out agents that are already assigned
  const availableAgents = allAgents.filter(a => !assignedAgents.some(m => m.agent.id === a.id));

  if (loading) return <div className="page-view"><div className="spinner" style={{ margin: '50px auto' }}></div></div>;
  if (!group) return <div className="page-view"><h2>Group not found</h2></div>;

  return (
    <div className="page-view">
      <PageHeader 
        title={`Group: ${group.name}`} 
        actions={<Link to="/groups" className="btn btn-ghost">← Back to Groups</Link>} 
      />
      
      <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
        <h3>Add Agent to Group</h3>
        <p className="text-muted" style={{ marginBottom: '16px' }}>
          Assign an idle agent to this pool. When you run a Test Suite targeted at "{group.name}", any agent in this pool can pick up the jobs.
        </p>
        <form onSubmit={handleAddAgent} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label">Select Agent</label>
            <select 
              className="form-input" 
              value={selectedAgent} 
              onChange={e => setSelectedAgent(e.target.value)}
              required
            >
              <option value="" disabled>-- Choose an available agent --</option>
              {availableAgents.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name || 'Unnamed Agent'} ({isOnline(a.lastSeenAt) ? 'Online' : 'Offline'})
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={adding || !selectedAgent || availableAgents.length === 0}>
            {adding ? 'Adding...' : '➕ Assign Agent'}
          </button>
        </form>
        {availableAgents.length === 0 && allAgents.length > 0 && (
          <p className="text-muted text-sm" style={{ marginTop: '8px' }}>All agents are already assigned to this group.</p>
        )}
      </div>

      <TableCard title="Assigned Agents" total={assignedAgents.length}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Agent Details</th>
              <th>Version</th>
              <th>Last Seen</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignedAgents.length === 0 ? (
              <tr className="row-empty">
                <td colSpan={5}>
                  <div className="empty-state">
                    <div className="empty-state-icon">🔌</div>
                    <h3>No agents in this pool</h3>
                    <p>Assign an agent above to start executing jobs.</p>
                  </div>
                </td>
              </tr>
            ) : assignedAgents.map(m => {
              const a = m.agent;
              const online = isOnline(a.lastSeenAt);
              return (
                <tr key={m.mappingId}>
                  <td>
                    <span className={`status-badge ${online ? 'success' : 'error'}`}>
                      {online ? 'Online' : 'Offline'}
                    </span>
                  </td>
                  <td>
                    <div className="cell-bold">{a.name || 'Unnamed Agent'}</div>
                    <div className="text-muted text-xs">{a.id}</div>
                  </td>
                  <td className="text-muted">{a.agentVersion || '—'}</td>
                  <td className="text-muted text-sm">{fmt(a.lastSeenAt)}</td>
                  <td>
                    <div className="action-row">
                      <button className="act-btn delete" onClick={() => removeAgent(a.id)} title="Remove from Group">
                        ❌
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableCard>
    </div>
  );
}
