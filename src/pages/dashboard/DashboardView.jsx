import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import { fmt, statusBadge } from '../../utils/helpers';
import { toast } from '../../components/common/ToastContainer';
import { 
  Rocket, CheckCircle2, XCircle, Zap, 
  Search, Download, PieChart as PieChartIcon, 
  BarChart3, Inbox, OctagonX, Play, Eye, AlertTriangle, TrendingDown, TrendingUp, Minus,
  Server, Cpu, Wifi, WifiOff, Clock, ListOrdered, Trophy, Timer, DollarSign, Sparkles, Trash2
} from 'lucide-react';

/* ───────────────────────────────────────
   LOCAL REUSABLE COMPONENTS
─────────────────────────────────────── */
function PageHeader({ title, crumb, actions }) {
  return (
    <div className="page-header">
      <div className="page-header-left">
        <h1>{title}</h1>
        <div className="breadcrumbs"><Link to="/dashboard">Home</Link><span className="sep">›</span><span>{crumb || title}</span></div>
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  );
}

function TableCard({ title, headerRight, search, onSearch, entries, onEntries, children, total, page, onPage, maxHeight }) {
  return (
    <div className="card">
      <div className="card-header">
        <div><h2>{title}</h2>{total !== undefined && <p>{total} record{total !== 1 ? 's' : ''} found</p>}</div>
        {headerRight}
      </div>
      <div className="table-toolbar">
        <div className="toolbar-left">
          <div className="entries-select-wrap">
            Show <select value={entries} onChange={e => onEntries(+e.target.value)}>{[10,25,50].map(n => <option key={n} value={n}>{n}</option>)}</select> entries
          </div>
        </div>
        <div className="toolbar-right">
          {onSearch !== undefined && (
            <div className="search-wrap">
              <Search size={16} className="search-icon" />
              <input className="search-input" placeholder="Search…" value={search} onChange={e => onSearch(e.target.value)} />
            </div>
          )}
        </div>
      </div>
      <div className="table-responsive" style={maxHeight ? { maxHeight, overflowY: 'auto' } : {}}>{children}</div>
      {onPage && (
        <div className="table-footer">
          <span className="pag-info">Showing {Math.min(total, entries)} of {total}</span>
          <div className="pag-btns">
            <button className="pag-btn" disabled={page === 0} onClick={() => onPage(page - 1)}>‹ Prev</button>
            <button className="pag-btn active">{page + 1}</button>
            <button className="pag-btn" disabled={(page + 1) * entries >= total} onClick={() => onPage(page + 1)}>Next ›</button>
          </div>
        </div>
      )}
    </div>
  );
}

function DonutChart({ data, size = 220 }) {
  const total = data.reduce((a, d) => a + d.value, 0);
  if (total === 0) return <div className="chart-empty" style={{ padding: '40px', textAlign: 'center', color: 'var(--txt-muted)' }}>No data yet</div>;
  const r = 80, c = 2 * Math.PI * r;
  
  // Calculate success rate for center display
  const passed = data.find(d => d.label === 'Passed')?.value || 0;
  const successRate = total > 0 ? Math.round((passed / total) * 100) : 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '48px', padding: '24px 10px', flexWrap: 'wrap' }}>
      
      {/* SVG Container with drop shadow */}
      <div style={{ position: 'relative', width: size, height: size, filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.15))' }}>
        <svg width={size} height={size} viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
          {/* Background track */}
          <circle cx="100" cy="100" r={r} fill="none" stroke="var(--border)" strokeWidth="16" opacity="0.4" />
          
          {data.map((d, i) => {
            const pct = d.value / total;
            // Add a tiny gap between segments
            const dash = pct * c - (pct < 1 ? 3 : 0);
            const gap = c - dash;
            const prevPct = data.slice(0, i).reduce((sum, item) => sum + item.value, 0) / total;
            const o = prevPct * c;
            
            return (
              <circle 
                key={i} cx="100" cy="100" r={r} 
                fill="none" 
                stroke={d.color} 
                strokeWidth={d.label === 'Passed' ? '22' : '18'}
                strokeDasharray={`${Math.max(0, dash)} ${gap}`} 
                strokeDashoffset={-o}
                strokeLinecap={pct < 1 && pct > 0.03 ? "round" : "butt"}
                style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.2, 0.8, 0.2, 1), stroke-dashoffset 1.2s ease' }} 
              />
            );
          })}
        </svg>
        
        {/* Center Text (HTML overlay for sharper fonts) */}
        <div style={{ 
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none'
        }}>
          <span style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--txt-h)', lineHeight: 1, letterSpacing: '-0.04em' }}>{successRate}%</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--txt-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '6px' }}>Pass Rate</span>
        </div>
      </div>

      {/* Rich Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '180px' }}>
        {data.map((d, i) => {
          const pct = Math.round((d.value / total) * 100);
          return (
            <div key={i} style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', 
              background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)', transition: 'transform 0.2s ease', cursor: 'default'
            }} onMouseOver={e => e.currentTarget.style.transform = 'translateX(4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateX(0)'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ width: '14px', height: '14px', borderRadius: '5px', background: d.color, boxShadow: `0 0 10px ${d.color}80` }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--txt-muted)' }}>{d.label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--txt-h)' }}>{d.value}</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: d.color, background: `${d.color}20`, padding: '2px 8px', borderRadius: '20px', minWidth: '42px', textAlign: 'center' }}>{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="bar-chart">
      {data.map((d, i) => (
        <div key={i} className="bar-col">
          <div className="bar-value">{d.value}</div>
          <div className="bar-track">
            <div className="bar-fill" style={{ height: `${(d.value / max) * 100}%`, background: d.value > 0 ? 'var(--brand)' : 'var(--border)', animationDelay: `${i * 0.05}s` }} />
          </div>
          <div className="bar-label">{d.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ───────────────────────────────────────
   FLEET HEALTH WIDGET
─────────────────────────────────────── */
function FleetHealthWidget({ data, loading }) {
  if (loading) return (
    <div className="card" style={{ padding: '24px' }}>
      <div className="spinner" style={{ margin: '0 auto' }} />
    </div>
  );

  const { totalAgents = 0, onlineCount = 0, runningCount = 0, offlineCount = 0, queueDepth = 0, agents = [] } = data || {};
  const utilization = totalAgents > 0 ? Math.round((runningCount / totalAgents) * 100) : 0;

  const statusConfig = {
    running: { color: '#7c3aed', bg: 'rgba(124,58,237,0.12)', label: 'Running', icon: <Cpu size={12} /> },
    idle:    { color: '#059669', bg: 'rgba(5,150,105,0.12)',  label: 'Idle',    icon: <Wifi size={12} /> },
    offline: { color: '#6b7280', bg: 'rgba(107,114,128,0.12)', label: 'Offline', icon: <WifiOff size={12} /> },
  };

  const fmtRelative = (iso) => {
    if (!iso) return 'Never';
    const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (secs < 60) return `${secs}s ago`;
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    return `${Math.floor(secs / 3600)}h ago`;
  };

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
          <Server size={20} style={{ color: '#7c3aed' }} />
          Agent Fleet Health
          <span style={{ fontSize: '0.7rem', fontWeight: 600, background: 'rgba(124,58,237,0.15)', color: '#7c3aed', padding: '2px 8px', borderRadius: 20 }}>LIVE</span>
        </h2>
        <span style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>Infrastructure utilization & queue</span>
      </div>

      {/* Summary tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        {[
          { label: 'Total Agents',  val: totalAgents,  icon: <Server size={18} />,      color: 'var(--txt-h)' },
          { label: 'Running',       val: runningCount,  icon: <Cpu size={18} />,         color: '#7c3aed' },
          { label: 'Idle',          val: onlineCount,   icon: <Wifi size={18} />,        color: '#059669' },
          { label: 'Offline',       val: offlineCount,  icon: <WifiOff size={18} />,     color: '#6b7280' },
          { label: 'Jobs Queued',   val: queueDepth,    icon: <ListOrdered size={18} />, color: queueDepth > 5 ? '#dc2626' : '#f59e0b' },
        ].map(tile => (
          <div key={tile.label} style={{ background: 'var(--surface)', borderRadius: 10, padding: '12px 16px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: tile.color }}>{tile.icon}<span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--txt-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{tile.label}</span></div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: tile.color, lineHeight: 1 }}>{tile.val}</div>
          </div>
        ))}
        {/* Utilization bar tile */}
        <div style={{ background: 'var(--surface)', borderRadius: 10, padding: '12px 16px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6, gridColumn: 'span 1' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--txt-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Utilization</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: utilization > 70 ? '#dc2626' : utilization > 30 ? '#f59e0b' : '#059669', lineHeight: 1 }}>{utilization}%</div>
          <div style={{ height: 4, borderRadius: 2, background: 'var(--border)', overflow: 'hidden' }}>
            <div style={{ width: `${utilization}%`, height: '100%', background: utilization > 70 ? '#dc2626' : utilization > 30 ? '#f59e0b' : '#059669', borderRadius: 2, transition: 'width 1s ease' }} />
          </div>
        </div>
      </div>

      {/* Per-agent table */}
      {agents.length === 0 ? (
        <div className="empty-state" style={{ padding: '32px 0' }}>
          <div className="empty-state-icon"><Server size={36} /></div>
          <h3>No Agents Registered</h3>
          <p>Install and connect a Local Agent to begin running tests.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Agent Name</th>
                <th>OS</th>
                <th>Version</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'center' }}>Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {agents.map(agent => {
                const cfg = statusConfig[agent.status] || statusConfig.offline;
                return (
                  <tr key={agent.id}>
                    <td><span className="cell-bold" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, display: 'inline-block', flexShrink: 0, boxShadow: agent.status === 'running' ? `0 0 0 3px ${cfg.color}33` : 'none', animation: agent.status === 'running' ? 'pulse 2s infinite' : 'none' }} />
                      {agent.name || agent.id}
                    </span></td>
                    <td><span className="text-muted">{agent.os || '—'}</span></td>
                    <td><span className="text-muted">{agent.agentVersion || '—'}</span></td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', fontWeight: 700, color: cfg.color, background: cfg.bg, padding: '3px 10px', borderRadius: 20 }}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--txt-muted)' }}>
                        <Clock size={12} />{fmtRelative(agent.lastSeenAt)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────────────────
   SUITE PERFORMANCE LEADERBOARD WIDGET
─────────────────────────────────────── */
function SuitePerformanceWidget({ data, loading }) {
  if (loading) return (
    <div className="card" style={{ padding: '24px' }}>
      <div className="spinner" style={{ margin: '0 auto' }} />
    </div>
  );

  const MEDALS = ['🥇', '🥈', '🥉'];

  const fmtDuration = (secs) => {
    if (secs == null) return '—';
    if (secs < 60) return `${secs}s`;
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  };

  const fmtRelative = (iso) => {
    if (!iso) return 'Never';
    const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (secs < 60) return `${secs}s ago`;
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
    return `${Math.floor(secs / 86400)}d ago`;
  };

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
          <Trophy size={20} style={{ color: '#f59e0b' }} />
          Suite Performance Leaderboard
        </h2>
        <span style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>Ranked by success rate · All time</span>
      </div>

      {data.length === 0 ? (
        <div className="empty-state" style={{ padding: '40px 0' }}>
          <div className="empty-state-icon"><Trophy size={40} style={{ color: 'var(--txt-muted)' }} /></div>
          <h3>No Completed Runs Yet</h3>
          <p>Run your test suites to see performance rankings here.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 48, textAlign: 'center' }}>#</th>
                <th>Suite Name</th>
                <th style={{ textAlign: 'center' }}>Total Runs</th>
                <th style={{ textAlign: 'center' }}>Passed</th>
                <th style={{ textAlign: 'center' }}>Failed</th>
                <th style={{ minWidth: 180 }}>Success Rate</th>
                <th style={{ textAlign: 'center' }}><span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}><Timer size={13} /> Avg Duration</span></th>
                <th style={{ textAlign: 'center' }}>Last Run</th>
              </tr>
            </thead>
            <tbody>
              {data.map((suite, i) => {
                const rate = suite.successRate;
                const rateColor = rate >= 90 ? '#059669' : rate >= 70 ? '#f59e0b' : '#dc2626';
                const rateBg   = rate >= 90 ? 'rgba(5,150,105,0.1)' : rate >= 70 ? 'rgba(245,158,11,0.1)' : 'rgba(220,38,38,0.1)';
                return (
                  <tr key={i}>
                    <td style={{ textAlign: 'center' }}>
                      {i < 3
                        ? <span style={{ fontSize: '1.2rem' }}>{MEDALS[i]}</span>
                        : <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--txt-muted)' }}>#{i + 1}</span>
                      }
                    </td>
                    <td>
                      <span className="cell-bold">{suite.suiteName}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="text-muted">{suite.totalRuns}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ color: '#059669', fontWeight: 700 }}>{suite.passedRuns}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ color: suite.failedRuns > 0 ? '#dc2626' : 'var(--txt-muted)', fontWeight: suite.failedRuns > 0 ? 700 : 400 }}>
                        {suite.failedRuns}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'var(--border)', overflow: 'hidden', minWidth: 80 }}>
                          <div style={{
                            width: `${Math.min(rate, 100)}%`,
                            height: '100%',
                            background: `linear-gradient(90deg, ${rateColor}99, ${rateColor})`,
                            borderRadius: 4,
                            transition: 'width 0.8s ease'
                          }} />
                        </div>
                        <span style={{
                          fontSize: '0.82rem', fontWeight: 700,
                          color: rateColor, background: rateBg,
                          padding: '2px 9px', borderRadius: 20, minWidth: 52, textAlign: 'center'
                        }}>{rate}%</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: '0.8rem', color: 'var(--txt-muted)' }}>
                        <Timer size={12} />{fmtDuration(suite.avgDurationSecs)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--txt-muted)' }}>
                        <Clock size={12} />{fmtRelative(suite.lastRunAt)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────────────────
   FLAKINESS WIDGET
─────────────────────────────────────── */
function FlakinessWidget({ data, loading }) {
  if (loading) return (
    <div className="card" style={{ padding: '24px' }}>
      <div className="spinner" style={{ margin: '0 auto' }} />
    </div>
  );

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
          <AlertTriangle size={20} style={{ color: '#f59e0b' }} />
          Flakiness Tracker
          <span style={{ fontSize: '0.7rem', fontWeight: 600, background: 'rgba(245,158,11,0.15)', color: '#f59e0b', padding: '2px 8px', borderRadius: 20 }}>LIVE</span>
        </h2>
        <span style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>Suites with inconsistent pass/fail patterns</span>
      </div>

      {data.length === 0 ? (
        <div className="empty-state" style={{ padding: '40px 0' }}>
          <div className="empty-state-icon"><CheckCircle2 size={40} style={{ color: '#059669' }} /></div>
          <h3 style={{ color: '#059669' }}>All Suites Are Stable! 🎉</h3>
          <p>No flaky test suites detected. Keep up the great work!</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Test Suite</th>
                <th style={{ textAlign: 'center' }}>Total Runs</th>
                <th style={{ textAlign: 'center' }}>Passed</th>
                <th style={{ textAlign: 'center' }}>Failed</th>
                <th style={{ textAlign: 'center' }}>Flakiness Score</th>
                <th style={{ textAlign: 'center' }}>Trend</th>
              </tr>
            </thead>
            <tbody>
              {data.map((suite, i) => {
                const score = suite.flakinessScore;
                const scoreColor = score >= 40 ? '#dc2626' : score >= 20 ? '#f59e0b' : '#059669';
                const scoreBg = score >= 40 ? 'rgba(220,38,38,0.1)' : score >= 20 ? 'rgba(245,158,11,0.1)' : 'rgba(5,150,105,0.1)';
                return (
                  <tr key={i}>
                    <td>
                      <span className="cell-bold" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {score >= 40 && <AlertTriangle size={14} style={{ color: '#dc2626', flexShrink: 0 }} />}
                        {suite.suiteName}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}><span className="text-muted">{suite.totalRuns}</span></td>
                    <td style={{ textAlign: 'center' }}><span style={{ color: '#059669', fontWeight: 600 }}>{suite.passedRuns}</span></td>
                    <td style={{ textAlign: 'center' }}><span style={{ color: '#dc2626', fontWeight: 600 }}>{suite.failedRuns}</span></td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <div style={{ width: 80, height: 6, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(score, 100)}%`, height: '100%', background: scoreColor, borderRadius: 3, transition: 'width 0.8s ease' }} />
                        </div>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: scoreColor, background: scoreBg, padding: '2px 8px', borderRadius: 20, minWidth: 52, textAlign: 'center' }}>{score}%</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {suite.trend === 'deteriorating'
                        ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#dc2626', fontSize: '0.78rem', fontWeight: 600 }}><TrendingDown size={14} /> Deteriorating</span>
                        : suite.trend === 'improving'
                        ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#059669', fontSize: '0.78rem', fontWeight: 600 }}><TrendingUp size={14} /> Improving</span>
                        : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: 'var(--txt-muted)', fontSize: '0.78rem', fontWeight: 600 }}><Minus size={14} /> Stable</span>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────────────────
   TIME SAVED ROI WIDGET
─────────────────────────────────────── */
function TimeSavedWidget({ data, loading }) {
  if (loading) return (
    <div className="card" style={{ padding: '32px' }}>
      <div className="spinner" style={{ margin: '0 auto' }} />
    </div>
  );

  const {
    totalRuns = 0,
    hoursSaved = 0,
    dollarsSaved = 0,
    avgDurationSecs = 0,
    todayRuns = 0,
    weekRuns = 0,
    manualMinsPerRun = 15,
    hourlyRate = 50,
    dailyBreakdown = [],
    timeSavedSecs = 0,
  } = data || {};

  const fmtDuration = (secs) => {
    if (!secs) return '0s';
    if (secs < 60) return `${secs}s`;
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  };

  const fmtHours = (h) => {
    if (h < 1) return `${Math.round(h * 60)}m`;
    return `${h.toFixed(1)}h`;
  };

  // Sparkline SVG for daily savings
  const maxSaved = Math.max(...dailyBreakdown.map(d => d.savedMins), 1);
  const svgW = 320, svgH = 60, pad = 4;
  const pts = dailyBreakdown.map((d, i) => {
    const x = pad + (i / Math.max(dailyBreakdown.length - 1, 1)) * (svgW - pad * 2);
    const y = svgH - pad - (d.savedMins / maxSaved) * (svgH - pad * 2);
    return `${x},${y}`;
  });
  const areaPath = pts.length > 1
    ? `M${pts[0]} L${pts.join(' L')} L${svgW - pad},${svgH} L${pad},${svgH} Z`
    : '';
  const linePath = pts.length > 1 ? `M${pts[0]} L${pts.join(' L')}` : '';

  // ROI bar: what % of manual time was saved
  const manualEstimateSecs = totalRuns * manualMinsPerRun * 60;
  const savingsPct = manualEstimateSecs > 0 ? Math.round((timeSavedSecs / manualEstimateSecs) * 100) : 0;

  return (
    <div className="card" style={{
      overflow: 'hidden',
      background: 'linear-gradient(135deg, var(--surface) 0%, rgba(5,150,105,0.04) 100%)',
      border: '1px solid rgba(5,150,105,0.25)'
    }}>
      {/* Header */}
      <div className="card-header" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(5,150,105,0.2)', background: 'rgba(5,150,105,0.05)'
      }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, margin: 0 }}>
          <span style={{
            width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #059669, #10b981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            boxShadow: '0 4px 12px rgba(5,150,105,0.35)'
          }}>
            <DollarSign size={18} color="#fff" />
          </span>
          Time Saved — ROI Dashboard
          <span style={{
            fontSize: '0.7rem', fontWeight: 700,
            background: 'linear-gradient(90deg, #059669, #10b981)',
            color: '#fff', padding: '3px 10px', borderRadius: 20,
            letterSpacing: '0.05em'
          }}>WOW FACTOR</span>
        </h2>
        <span style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>
          vs. {manualMinsPerRun} min/run manual estimate · ${hourlyRate}/hr QA rate
        </span>
      </div>

      {/* Hero KPI tiles */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 16, padding: '20px 24px',
        borderBottom: '1px solid rgba(5,150,105,0.15)'
      }}>
        {/* Hours Saved — hero tile */}
        <div style={{
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          borderRadius: 14, padding: '20px 22px', color: '#fff',
          boxShadow: '0 8px 24px rgba(5,150,105,0.3)',
          display: 'flex', flexDirection: 'column', gap: 6, gridColumn: 'span 1'
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, opacity: 0.85, letterSpacing: '0.07em', textTransform: 'uppercase' }}>⏱ Hours Saved</span>
          <span style={{ fontSize: '2.6rem', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.02em' }}>
            {fmtHours(hoursSaved)}
          </span>
          <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>vs manual testing</span>
        </div>

        {/* Dollar Value Saved — hero tile */}
        <div style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
          borderRadius: 14, padding: '20px 22px', color: '#fff',
          boxShadow: '0 8px 24px rgba(124,58,237,0.3)',
          display: 'flex', flexDirection: 'column', gap: 6
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, opacity: 0.85, letterSpacing: '0.07em', textTransform: 'uppercase' }}>💰 Value Saved</span>
          <span style={{ fontSize: '2.6rem', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.02em' }}>
            ${dollarsSaved.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>at ${hourlyRate}/hr QA rate</span>
        </div>

        {/* Runs Automated */}
        <div style={{ background: 'var(--surface)', borderRadius: 14, padding: '20px 22px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--txt-muted)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>🤖 Runs Automated</span>
          <span style={{ fontSize: '2.6rem', fontWeight: 900, lineHeight: 1, color: 'var(--txt-h)' }}>{totalRuns.toLocaleString()}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>all-time total</span>
        </div>

        {/* This week */}
        <div style={{ background: 'var(--surface)', borderRadius: 14, padding: '20px 22px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--txt-muted)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>📅 This Week</span>
          <span style={{ fontSize: '2.6rem', fontWeight: 900, lineHeight: 1, color: 'var(--txt-h)' }}>{weekRuns}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>{todayRuns} run{todayRuns !== 1 ? 's' : ''} today</span>
        </div>

        {/* Avg test duration */}
        <div style={{ background: 'var(--surface)', borderRadius: 14, padding: '20px 22px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--txt-muted)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>⚡ Avg Run Time</span>
          <span style={{ fontSize: '2.6rem', fontWeight: 900, lineHeight: 1, color: 'var(--txt-h)' }}>{fmtDuration(avgDurationSecs)}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>vs {manualMinsPerRun}m manual</span>
        </div>
      </div>

      {/* Savings efficiency bar + sparkline */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, padding: '20px 24px' }}>

        {/* Efficiency bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--txt-h)' }}>Manual Time Eliminated</span>
            <span style={{
              fontSize: '1.1rem', fontWeight: 900,
              color: savingsPct >= 60 ? '#059669' : savingsPct >= 30 ? '#f59e0b' : '#dc2626'
            }}>{savingsPct}%</span>
          </div>
          <div style={{ position: 'relative', height: 20, borderRadius: 10, background: 'var(--border)', overflow: 'hidden' }}>
            <div style={{
              width: `${Math.min(savingsPct, 100)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #059669, #10b981)',
              borderRadius: 10,
              transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
              boxShadow: '2px 0 8px rgba(5,150,105,0.4)'
            }} />
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--txt-muted)', margin: 0, lineHeight: 1.5 }}>
            AutoPilot ran <strong>{totalRuns}</strong> tests automatically, saving an estimated
            {' '}<strong style={{ color: '#059669' }}>{fmtHours(hoursSaved)}</strong> of manual QA time
            — worth <strong style={{ color: '#7c3aed' }}>${dollarsSaved.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong> in engineering hours.
          </p>
          {/* Assumption note */}
          <div style={{
            fontSize: '0.7rem', color: 'var(--txt-muted)', background: 'var(--surface)',
            border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px',
            display: 'flex', gap: 6, alignItems: 'flex-start'
          }}>
            <span style={{ color: '#f59e0b', flexShrink: 0 }}>ℹ</span>
            <span>Estimates based on {manualMinsPerRun} min manual run time &amp; ${hourlyRate}/hr QA engineer cost. Adjust in settings for precise ROI.</span>
          </div>
        </div>

        {/* 14-day sparkline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--txt-h)' }}>Minutes Saved / Day (14d)</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--txt-muted)' }}>Last 2 weeks</span>
          </div>
          {dailyBreakdown.length > 0 && maxSaved > 0 ? (
            <svg width="100%" height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="none"
              style={{ borderRadius: 8, overflow: 'visible' }}>
              <defs>
                <linearGradient id="roiAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.03" />
                </linearGradient>
              </defs>
              <path d={areaPath} fill="url(#roiAreaGrad)" />
              <path d={linePath} fill="none" stroke="#059669" strokeWidth="2.5"
                strokeLinejoin="round" strokeLinecap="round" />
              {dailyBreakdown.map((d, i) => {
                const x = pad + (i / Math.max(dailyBreakdown.length - 1, 1)) * (svgW - pad * 2);
                const y = svgH - pad - (d.savedMins / maxSaved) * (svgH - pad * 2);
                return d.runs > 0 ? (
                  <circle key={i} cx={x} cy={y} r={3.5} fill="#059669" stroke="var(--bg)" strokeWidth={1.5} />
                ) : null;
              })}
            </svg>
          ) : (
            <div style={{ height: svgH, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--txt-muted)', fontSize: '0.8rem', border: '1px dashed var(--border)', borderRadius: 8 }}>
              No data yet — run some tests!
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--txt-muted)' }}>
            {dailyBreakdown.filter((_, i) => i === 0 || i === 6 || i === 13).map((d, i) => (
              <span key={i}>{new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────
   DASHBOARD VIEW
─────────────────────────────────────── */
export default function DashboardView() {
  const [execs, setExecs] = useState([]);
  const [flakySuites, setFlakySuites] = useState([]);
  const [flakyLoading, setFlakyLoading] = useState(true);
  const [fleetHealth, setFleetHealth] = useState(null);
  const [fleetLoading, setFleetLoading] = useState(true);
  const [suitePerf, setSuitePerf] = useState([]);
  const [suitePerfLoading, setSuitePerfLoading] = useState(true);
  const [roiData, setRoiData] = useState(null);
  const [roiLoading, setRoiLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [entries, setEntries] = useState(10);
  const [page, setPage] = useState(0);
  const { user, setShowOnboarding } = useAuth();
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(() => {
    Promise.all([
      api('/api/executions').then(r => r.json()),
      api('/api/agents').then(r => r.json())
    ]).then(([dExecs, dAgents]) => {
      const execsList = dExecs || [];
      const agentsList = dAgents || [];
      setExecs(execsList);
      setLoading(false);
      
      const isFirstTimer = execsList.length === 0 && agentsList.length === 0;
      const hasDismissed = localStorage.getItem(`onboarding_dismissed_${user?.email}`) === 'true';
      
      if (isFirstTimer && !hasDismissed) {
        setShowOnboarding(true);
      }
      
      if (localStorage.getItem('ap_new_registration') === 'true') {
        localStorage.removeItem('ap_new_registration');
      }
    }).catch(() => setLoading(false));

    api('/api/analytics/flaky-suites?limit=5')
      .then(r => r.json())
      .then(data => { setFlakySuites(data || []); setFlakyLoading(false); })
      .catch(() => setFlakyLoading(false));

    api('/api/analytics/fleet-health')
      .then(r => r.json())
      .then(data => { setFleetHealth(data); setFleetLoading(false); })
      .catch(() => setFleetLoading(false));

    api('/api/analytics/suite-performance?limit=10')
      .then(r => r.json())
      .then(data => { setSuitePerf(data || []); setSuitePerfLoading(false); })
      .catch(() => setSuitePerfLoading(false));

    api('/api/analytics/time-saved-roi')
      .then(r => r.json())
      .then(data => { setRoiData(data); setRoiLoading(false); })
      .catch(() => setRoiLoading(false));
  }, [user, setShowOnboarding]);

  useEffect(() => {
    fetchDashboardData();
    const intervalId = setInterval(fetchDashboardData, 10000); // Auto-refresh every 10s
    return () => clearInterval(intervalId);
  }, [fetchDashboardData]);

  const getName = (e) => { try { return JSON.parse(e.environmentJson || '{}').referenceId || `Run #${e.orgExecutionId || e.id}`; } catch { return `Run #${e.orgExecutionId || e.id}`; } };
  const getBrowser = (e) => { try { return (JSON.parse(e.environmentJson || '{}').browserTypeName || 'chrome').toLowerCase(); } catch { return 'chrome'; } };

  const stopExecution = async (id) => {
    if (!window.confirm("Are you sure you want to stop this execution?")) return;
    try {
      const res = await api(`/api/executions/${id}/stop`, { method: 'POST' });
      if (res.ok) {
        setExecs(execs.map(e => e.id === id ? { ...e, status: 'aborted' } : e));
        toast('success', 'Stopped', 'Execution stopped successfully.');
      } else {
        toast('error', 'Error', 'Failed to stop execution.');
      }
    } catch {
      toast('error', 'Error', 'Error connecting to server.');
    }
  };

  const deleteExecution = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this execution?")) return;
    try {
      const res = await api(`/api/executions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setExecs(execs.filter(e => e.id !== id));
        toast('success', 'Deleted', 'Execution deleted successfully.');
      } else {
        toast('error', 'Error', 'Failed to delete execution.');
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
        setTimeout(fetchDashboardData, 1000);
      } else {
        toast('error', 'Error', 'Failed to re-run execution.');
      }
    } catch {
      toast('error', 'Error', 'Error connecting to server.');
    }
  };

  const sortedExecs = [...execs].sort((a, b) => b.id - a.id);
  const filtered = sortedExecs.filter(e => { const q = search.toLowerCase(); return getName(e).toLowerCase().includes(q) || e.status.toLowerCase().includes(q) || String(e.id).includes(q); });
  const paged = filtered.slice(page * entries, (page + 1) * entries);

  const total = execs.length;
  const passed = execs.filter(e => e.status?.toLowerCase() === 'success' || e.status?.toLowerCase() === 'completed').length;
  const failed = execs.filter(e => e.status?.toLowerCase() === 'failed').length;
  const running = execs.filter(e => e.status?.toLowerCase() === 'running').length;

  const donutData = [
    { label: 'Passed', value: passed, color: '#059669' },
    { label: 'Failed', value: failed, color: '#dc2626' },
    { label: 'Running', value: running, color: '#7c3aed' },
    { label: 'Other', value: total - passed - failed - running, color: '#4b5563' },
  ].filter(d => d.value > 0);

  const barData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      const count = execs.filter(e => e.createdAt && e.createdAt.slice(0, 10) === key).length;
      days.push({ label, value: count });
    }
    return days;
  }, [execs]);

  return (
    <div className="page-view">
      <PageHeader title="Dashboard" crumb="Overview" />

      {/* ── PRIORITY GRID LAYOUT ─────────────────────────────────────────────
          Row 1 (full width): KPI stat cards
          Row 2 (full width): Time Saved ROI — highest business value
          Row 3 (2 col):      Pass/Fail Donut  |  7-Day Bar Chart
          Row 4 (2 col):      Fleet Health     |  Flakiness Tracker
          Row 5 (full width): Suite Leaderboard
          Row 6 (full width): Recent Executions table
      ─────────────────────────────────────────────────────────────────────── */}
      <div className="dashboard-priority-grid">

        {/* ── ROW 1: KPI Stats (full width) ── */}
        <div style={{ gridColumn: '1 / -1' }}>
          <div className="stats-grid">
            {[
              { label: 'Total Runs', val: total,   icon: <Rocket size={24} />,       cls: 'blue',   trend: 'neu',              t: 'All time' },
              { label: 'Passed',     val: passed,  icon: <CheckCircle2 size={24} />, cls: 'green',  trend: 'up',               t: `${total ? Math.round(passed / total * 100) : 0}% pass rate` },
              { label: 'Failed',     val: failed,  icon: <XCircle size={24} />,      cls: 'yellow', trend: failed > 0 ? 'down' : 'neu', t: failed > 0 ? 'Needs attention' : 'All clear' },
              { label: 'Running',    val: running, icon: <Zap size={24} />,          cls: 'purple', trend: 'neu',              t: 'In progress' },
            ].map(s => (
              <div key={s.label} className={`stat-card ${s.cls}`}>
                <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
                <div className="stat-body">
                  <div className="stat-value">{s.val}</div>
                  <div className="stat-label">{s.label}</div>
                  <div className={`stat-trend ${s.trend}`}>{s.t}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── ROW 2: Recent Executions Table (full width) ── */}
        <div style={{ gridColumn: '1 / -1' }}>
          <TableCard title="Recent Test Executions" total={filtered.length} maxHeight="400px"
            search={search} onSearch={s => { setSearch(s); setPage(0); }}
            entries={entries} onEntries={n => { setEntries(n); setPage(0); }}
            page={page} onPage={setPage}
            headerRight={<button className="btn btn-ghost btn-sm" onClick={() => window.print()}><Download size={16} className="mr-2 inline" /> Export</button>}>
            <table className="data-table">
              <thead><tr><th>#</th><th>Test Suite Name</th><th>Browser</th><th>Started</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {loading ? <tr className="row-loading"><td colSpan={6}><div className="spinner" /></td></tr>
                : paged.length === 0 ? <tr className="row-empty"><td colSpan={6}><div className="empty-state"><div className="empty-state-icon"><Inbox size={48} /></div><h3>No executions found</h3><p>Run a test suite to see results here.</p></div></td></tr>
                : paged.map(e => (
                  <tr key={e.id}>
                    <td><span className="cell-bold">#{e.orgExecutionId || e.id}</span></td>
                    <td><span className="cell-bold">{getName(e)}</span></td>
                    <td><span className={`badge ${statusBadge(getBrowser(e))}`}>{getBrowser(e)}</span></td>
                    <td><span className="text-muted text-sm">{fmt(e.createdAt)}</span></td>
                    <td><span className={`badge ${statusBadge(e.status)}`}>{e.status}</span></td>
                    <td>
                      <div className="action-row">
                        {(e.status === 'running' || e.status === 'queued') && (
                          <button className="act-btn kill" title="Stop Execution" style={{color: '#dc2626'}} onClick={() => stopExecution(e.id)}><OctagonX size={18} /></button>
                        )}
                        {(e.status !== 'running' && e.status !== 'queued') && (
                          <button className="act-btn view" title="Re-run Execution" style={{color: '#059669'}} onClick={() => rerunExecution(e.id)}><Play size={18} /></button>
                        )}
                        <button className="act-btn view" title="View Report" onClick={() => navigate(`/executions/${e.id}`)}><Eye size={18} /></button>
                        <button className="act-btn delete" title="Delete Execution" onClick={() => deleteExecution(e.id)}><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableCard>
        </div>

        {/* ── ROW 3: Time Saved ROI — Wow Factor (full width) ── */}
        <div style={{ gridColumn: '1 / -1' }}>
          <TimeSavedWidget data={roiData} loading={roiLoading} />
        </div>

        {/* ── ROW 3: Charts side-by-side ── */}
        <div className="card chart-card" style={{ height: '100%' }}>
          <div className="card-header" style={{ display: 'flex', alignItems: 'center' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', margin: 0 }}>
              <PieChartIcon size={20} className="mr-2" /> Pass / Fail Distribution
            </h2>
          </div>
          <div className="chart-body">
            <DonutChart data={donutData} />
          </div>
        </div>

        <div className="card chart-card" style={{ height: '100%' }}>
          <div className="card-header" style={{ display: 'flex', alignItems: 'center' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', margin: 0 }}>
              <BarChart3 size={20} className="mr-2" /> Executions — Last 7 Days
            </h2>
          </div>
          <div className="chart-body">
            <BarChart data={barData} />
          </div>
        </div>

        {/* ── ROW 4: Fleet Health (full width) ── */}
        <div style={{ gridColumn: '1 / -1' }}>
          <FleetHealthWidget data={fleetHealth} loading={fleetLoading} />
        </div>

        {/* ── ROW 5: Flakiness Tracker (full width) ── */}
        <div style={{ gridColumn: '1 / -1' }}>
          <FlakinessWidget data={flakySuites} loading={flakyLoading} />
        </div>

        {/* ── ROW 5: Suite Performance Leaderboard (full width) ── */}
        <div style={{ gridColumn: '1 / -1' }}>
          <SuitePerformanceWidget data={suitePerf} loading={suitePerfLoading} />
        </div>

        {/* End of layout */}

      </div>
    </div>
  );
}
