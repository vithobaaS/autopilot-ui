import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download } from 'lucide-react';
import { api } from '../../api/apiClient';
import { fmt, statusBadge } from '../../utils/helpers';
import { diagnose } from '../../utils/errorDiagnostics';
import './ExecutionDetails.css';

function PageHeader({ title, crumb, actions }) {
  return (
    <div className="page-header">
      <div className="page-header-left">
        <h1>{title}</h1>
        <div className="breadcrumbs">
          <Link to="/dashboard">Home</Link>
          <span className="sep">›</span>
          <Link to="/dashboard">Executions</Link>
          <span className="sep">›</span>
          <span>{crumb}</span>
        </div>
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  );
}

function ErrorDiagnosticPanel({ rawError, step }) {
  const [expanded, setExpanded] = useState(false);
  const diag = diagnose(rawError, step);
  if (!diag) return null;

  return (
    <div className="error-diagnostic-panel">
      <div className="diag-header">
        <span className="diag-icon">{diag.icon}</span>
        <div className="diag-title-group">
          <span className="diag-title">{diag.title}</span>
          <span className="diag-cause">{diag.cause}</span>
        </div>
      </div>

      {diag.locatorHint && (
        <div className="diag-locator-hint">
          <span className="diag-locator-label">🎯 Target:</span>
          <code>{diag.locatorHint}</code>
        </div>
      )}

      <div className="diag-tips">
        <div className="diag-tips-label">💡 Possible Causes &amp; Fixes</div>
        <ul className="diag-tips-list">
          {diag.tips.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      </div>

      <button className="diag-raw-toggle" onClick={() => setExpanded(p => !p)}>
        {expanded ? '▲ Hide' : '▼ Show'} raw error message
      </button>
      {expanded && (
        <pre className="diag-raw-error">{diag.raw}</pre>
      )}
    </div>
  );
}

export default function ExecutionDetailsView() {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);
  const timelineEndRef = useRef(null);

  const fetchExecution = () => {
    api(`/api/executions/${id}`)
      .then(r => r.json())
      .then(d => { setDetail(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchExecution();
    const interval = setInterval(() => {
      setDetail(prev => {
        if (prev && prev.execution) {
          const status = prev.execution.status?.toLowerCase();
          if (status === 'running' || status === 'queued' || status === 'assigned') {
            fetchExecution();
          }
        }
        return prev;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (timelineEndRef.current && detail?.execution?.status?.toLowerCase() === 'running') {
      timelineEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [detail]);

  const handleExportCSV = () => {
    if (!detail) return;
    const { execution, steps } = detail;
    const rows = [
      ['Step', 'Action', 'Locator', 'Data', 'Status', 'Error']
    ];
    steps.forEach((s, i) => {
      const stepIndex = s.stepIndex || i + 1;
      const status = s.resultStatus === 2 ? 'Failed' : s.resultStatus === 1 ? 'Passed' : 'Skipped';
      rows.push([
        stepIndex, 
        s.actionName || '', 
        s.locatorName ? `${s.locatorName}: ${s.objectDetail}` : '', 
        s.testData || '', 
        status, 
        s.errorJson ? 'Error occurred' : ''
      ]);
    });
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `execution_${execution.id}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getName = (e) => {
    try { return JSON.parse(e.environmentJson || '{}').referenceId || `Run #${e.orgExecutionId || e.id}`; }
    catch { return `Run #${e.orgExecutionId || e.id}`; }
  };

  const getBrowser = (e) => {
    try { return (JSON.parse(e.environmentJson || '{}').browserTypeName || 'chrome').toLowerCase(); }
    catch { return 'chrome'; }
  };

  if (loading) {
    return (
      <div className="page-view">
        <PageHeader title="Execution Details" crumb="Loading..." />
        <div style={{ textAlign: 'center', padding: 48 }}><div className="spinner" /></div>
      </div>
    );
  }

  if (!detail || !detail.execution) {
    return (
      <div className="page-view">
        <PageHeader title="Execution Not Found" crumb="Error" />
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <h3>Execution not found</h3>
          <p>The execution you are looking for does not exist or has been deleted.</p>
        </div>
      </div>
    );
  }

  const { execution, steps, screenshots } = detail;
  const isSuccess = execution.status?.toLowerCase() === 'success' || execution.status?.toLowerCase() === 'completed';
  const isFailed = execution.status?.toLowerCase() === 'failed';
  const isRunning = execution.status?.toLowerCase() === 'running';
  const headerIcon = isSuccess ? '✅' : isFailed ? '❌' : isRunning ? '⚡' : '⏸️';

  const durationStr = () => {
    if (!execution.createdAt || !execution.finishedAt) return '—';
    const ms = new Date(execution.finishedAt) - new Date(execution.createdAt);
    if (ms < 0) return '—';
    const s = Math.floor(ms / 1000);
    return `${s}s`;
  };

  const failedCount = steps.filter(s => s.resultStatus === 2 || (s.errorJson && s.errorJson !== '')).length;
  const passedCount = steps.filter(s => s.resultStatus === 1 && s.executedStatus === 1).length;
  const skippedCount = steps.length - failedCount - passedCount;

  return (
    <div className="page-view execution-details-page">
      <PageHeader
        title={`Execution #${execution.orgExecutionId || execution.id}`}
        crumb={getName(execution)}
        actions={
          <button className="btn btn-secondary" onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download size={16} /> Export Report
          </button>
        }
      />

      {/* Progress Bar for Live Tracking */}
      {isRunning && (
        <div style={{ marginBottom: '20px', background: 'var(--surface)', padding: '16px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--txt-h)' }}>
            <span>Execution Progress</span>
            <span>{passedCount + failedCount} / {steps.length} Steps</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, ((passedCount + failedCount) / (steps.length || 1)) * 100)}%`, height: '100%', background: 'var(--brand)', transition: 'width 0.3s ease' }} />
          </div>
        </div>
      )}

      {/* Meta Bar */}
      <div className="exec-meta-bar">
        <div className="meta-left">
          <div className="meta-icon">{headerIcon}</div>
          <div className="meta-info">
            <h2>{getName(execution)}</h2>
            <div className="meta-badges">
              <span className={`badge ${statusBadge(execution.status)}`}>{execution.status}</span>
              <span className={`badge ${statusBadge(getBrowser(execution))}`}>{getBrowser(execution)}</span>
            </div>
          </div>
        </div>
        <div className="meta-right">
          <div className="meta-stat">
            <span className="stat-lbl">Started</span>
            <span className="stat-val">{fmt(execution.createdAt)}</span>
          </div>
          <div className="meta-stat">
            <span className="stat-lbl">Duration</span>
            <span className="stat-val">{durationStr()}</span>
          </div>
          <div className="meta-stat">
            <span className="stat-lbl">Steps</span>
            <span className="stat-val">{steps.length}</span>
          </div>
          {failedCount > 0 && (
            <div className="meta-stat">
              <span className="stat-lbl">Failed</span>
              <span className="stat-val" style={{ color: '#ef4444' }}>{failedCount}</span>
            </div>
          )}
          {passedCount > 0 && (
            <div className="meta-stat">
              <span className="stat-lbl">Passed</span>
              <span className="stat-val" style={{ color: '#22c55e' }}>{passedCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Failed Steps Summary Banner */}
      {isFailed && failedCount > 0 && (
        <div className="exec-failure-summary">
          <span className="failure-summary-icon">🔴</span>
          <div>
            <strong>Execution Failed</strong>
            <span> — {failedCount} step{failedCount > 1 ? 's' : ''} failed
              {skippedCount > 0 ? `, ${skippedCount} step${skippedCount > 1 ? 's' : ''} skipped` : ''}.
              &nbsp;See the timeline below for detailed error analysis.
            </span>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="timeline-container">
        <h3>🔬 Execution Timeline</h3>
        {steps.length === 0 ? (
          <div className="empty-state">No steps recorded for this execution.</div>
        ) : (
          <div className="timeline">
            {steps.map((step, idx) => {
              const ss = screenshots.find(sc => sc.stepResultId === step.id);
              const stepFailed = step.resultStatus === 2 || step.executedStatus === 2 || (step.errorJson && step.errorJson !== '');
              const stepSkipped = !stepFailed && (step.executedStatus !== 1);
              const stepPassed = !stepFailed && !stepSkipped;
              const stepStatusIcon = stepFailed ? '🔴' : stepPassed ? '🟢' : '⚪';

              return (
                <div key={step.id} className={`timeline-item ${stepFailed ? 'failed' : stepPassed ? 'passed' : 'skipped'}`}>
                  <div className="timeline-connector"></div>
                  <div className="timeline-icon">{stepStatusIcon}</div>
                  <div className="timeline-content">
                    <div className="step-header">
                      <span className="step-index">Step {step.stepIndex || idx + 1}</span>
                      <span className="action-tag">{step.actionName}</span>
                      {step.locatorName && (
                        <span className="step-locator text-muted">
                          {step.locatorName}: {step.objectDetail || '—'}
                        </span>
                      )}
                      {step.testData && step.testData !== step.objectDetail && (
                        <span className="step-data text-muted">→ {step.testData}</span>
                      )}
                      {stepSkipped && <span className="skipped-tag">⏭ Skipped (previous step failed)</span>}
                    </div>

                    {/* Smart Error Diagnostic Panel */}
                    {stepFailed && step.errorJson && (
                      <ErrorDiagnosticPanel rawError={step.errorJson} step={step} />
                    )}

                    {/* Screenshot */}
                    {ss && (
                      <div className="step-screenshot" onClick={() => setLightbox(ss.storagePath)}>
                        <img src={ss.storagePath} alt={`Step ${step.stepIndex}`} />
                        <div className="screenshot-overlay">🔍 View Full Screenshot</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={timelineEndRef} />
          </div>
        )}
      </div>

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <div className="lightbox-close" onClick={() => setLightbox(null)}>✕</div>
          <img src={lightbox} className="lightbox-img" alt="Screenshot Full" />
        </div>
      )}
    </div>
  );
}
