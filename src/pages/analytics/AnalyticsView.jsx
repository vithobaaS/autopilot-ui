import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/apiClient';
import { BarChart3, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { fmt } from '../../utils/helpers';

export default function AnalyticsView() {
  const [execs, setExecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/api/executions')
      .then(r => r.json())
      .then(d => { setExecs(d || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const getName = (e) => {
    try { return JSON.parse(e.environmentJson || '{}').referenceId || `Run #${e.orgExecutionId || e.id}`; }
    catch { return `Run #${e.orgExecutionId || e.id}`; }
  };

  const { passRate, totalExecs, avgDuration, flakiness } = useMemo(() => {
    if (!execs.length) return { passRate: 0, totalExecs: 0, avgDuration: 0, flakiness: [] };

    // Pass Rate
    const completed = execs.filter(e => e.status?.toLowerCase() === 'success' || e.status?.toLowerCase() === 'failed');
    const passed = completed.filter(e => e.status?.toLowerCase() === 'success').length;
    const rate = completed.length > 0 ? (passed / completed.length) * 100 : 0;

    // Average Duration
    let totalDur = 0;
    let durCount = 0;
    completed.forEach(e => {
      if (e.createdAt && e.finishedAt) {
        totalDur += (new Date(e.finishedAt) - new Date(e.createdAt));
        durCount++;
      }
    });
    const avgDur = durCount > 0 ? Math.floor(totalDur / durCount / 1000) : 0;

    // Flakiness Analysis: Group by Test Suite Name (referenceId)
    const suiteMap = {};
    completed.forEach(e => {
      const name = getName(e);
      if (!suiteMap[name]) suiteMap[name] = { total: 0, passed: 0, failed: 0 };
      suiteMap[name].total++;
      if (e.status?.toLowerCase() === 'success') suiteMap[name].passed++;
      if (e.status?.toLowerCase() === 'failed') suiteMap[name].failed++;
    });

    const flakeData = Object.entries(suiteMap)
      .map(([name, stats]) => ({
        name,
        total: stats.total,
        flakeScore: stats.total > 2 ? Math.min(stats.passed, stats.failed) / stats.total : 0 // The closer passed/failed are, the higher the flakiness
      }))
      .filter(f => f.flakeScore > 0)
      .sort((a, b) => b.flakeScore - a.flakeScore)
      .slice(0, 10);

    return { passRate: rate.toFixed(1), totalExecs: execs.length, avgDuration: avgDur, flakiness: flakeData };
  }, [execs]);

  if (loading) {
    return (
      <div className="page-view">
        <div className="page-header">
          <div className="page-header-left"><h1>Analytics & Reports</h1></div>
        </div>
        <div style={{ textAlign: 'center', padding: 48 }}><div className="spinner" /></div>
      </div>
    );
  }

  return (
    <div className="page-view">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Analytics & Reports</h1>
          <div className="breadcrumbs">
            <Link to="/dashboard">Home</Link>
            <span className="sep">›</span>
            <span>Analytics</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <TrendingUp size={32} color="var(--brand)" style={{ marginBottom: 12 }} />
          <div style={{ fontSize: '32px', fontWeight: 800 }}>{passRate}%</div>
          <div style={{ color: 'var(--txt-muted)', fontSize: '13px' }}>Overall Pass Rate</div>
        </div>
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <BarChart3 size={32} color="var(--blue)" style={{ marginBottom: 12 }} />
          <div style={{ fontSize: '32px', fontWeight: 800 }}>{totalExecs}</div>
          <div style={{ color: 'var(--txt-muted)', fontSize: '13px' }}>Total Executions</div>
        </div>
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Clock size={32} color="var(--green)" style={{ marginBottom: 12 }} />
          <div style={{ fontSize: '32px', fontWeight: 800 }}>{avgDuration}s</div>
          <div style={{ color: 'var(--txt-muted)', fontSize: '13px' }}>Avg Execution Time</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><AlertTriangle size={18} color="var(--amber)" /> Flakiness Analysis</h2>
            <p>Test suites that frequently alternate between pass and fail.</p>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Test Suite</th>
                <th>Total Runs</th>
                <th>Flakiness Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {flakiness.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: 'var(--txt-muted)' }}>No flaky tests detected! Great job!</td></tr>
              ) : (
                flakiness.map(f => (
                  <tr key={f.name}>
                    <td style={{ fontWeight: 600 }}>{f.name}</td>
                    <td>{f.total}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: '100px', height: '6px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${f.flakeScore * 200}%`, height: '100%', background: 'var(--amber)' }} />
                        </div>
                        <span style={{ fontSize: '12px' }}>{(f.flakeScore * 200).toFixed(1)}%</span>
                      </div>
                    </td>
                    <td><span className="badge badge-warning">Needs Review</span></td>
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
