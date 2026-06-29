import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/apiClient';
import { toast } from '../../components/common/ToastContainer';
import { PageHeader } from '../../components/common/PageComponents';

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

export default function SchedulerFormView() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [suites, setSuites] = useState([]);
  const [form, setForm] = useState({
    testSuiteId: '',
    environmentId: '',
    targetGroupId: '',
    executionType: '',
    browserType: '',
    browserVersion: '',
    status: 'active',
    recurrenceType: 'once',
    scheduledDate: '',
    scheduledTime: '',
    recurrenceDays: [],
    recurrenceEndDate: '',
  });
  const [envs, setEnvs] = useState([]);
  const [pools, setPools] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(!isEdit);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    api('/api/test-suites').then(r => r.json()).then(setSuites).catch(() => {});
    api('/api/environments').then(r => r.json()).then(d => setEnvs(d || [])).catch(() => {});
    api('/api/groups').then(r => r.json()).then(d => setPools(d || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (isEdit) {
      api('/api/schedulers').then(r => r.json()).then(all => {
        const s = all.find(x => x.id === +id);
        if (s) {
          setForm({
            testSuiteId: s.testSuiteId || '',
            environmentId: s.environmentId || '',
            targetGroupId: s.targetGroupId || '',
            executionType: s.executionType || '',
            browserType: s.browserType || '',
            browserVersion: s.browserVersion || '',
            status: s.status || 'active',
            recurrenceType: s.recurrenceType || 'once',
            scheduledDate: s.scheduledDate || '',
            scheduledTime: s.scheduledTime ? s.scheduledTime.substring(0, 5) : '',
            recurrenceDays: s.recurrenceDays ? s.recurrenceDays.split(',').map(d => d.trim()) : [],
            recurrenceEndDate: s.recurrenceEndDate || '',
          });
        }
        setLoaded(true);
      });
    }
  }, [id, isEdit]);

  const toggleDay = (dayKey) => {
    setForm(p => {
      const days = p.recurrenceDays.includes(dayKey)
        ? p.recurrenceDays.filter(d => d !== dayKey)
        : [...p.recurrenceDays, dayKey];
      return { ...p, recurrenceDays: days };
    });
  };

  const buildSummary = () => {
    if (form.executionType === 'now') return '▶ Will run immediately when saved.';
    if (form.executionType !== 'scheduled') return '';
    const timeStr = form.scheduledTime ? formatTime12h(form.scheduledTime) : '—';
    const dateStr = form.scheduledDate ? new Date(form.scheduledDate + 'T00:00').toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) : '—';
    switch (form.recurrenceType) {
      case 'once':    return `📅 Runs once on ${dateStr} at ${timeStr}`;
      case 'daily':   return `🔁 Runs every day at ${timeStr}${form.scheduledDate ? ', starting ' + dateStr : ''}`;
      case 'weekly': {
        const daysLabel = form.recurrenceDays.length
          ? form.recurrenceDays.map(k => DAY_OPTIONS.find(d => d.key === k)?.label || k).join(', ')
          : 'no days selected';
        return `🔁 Runs every ${daysLabel} at ${timeStr}`;
      }
      case 'monthly': return `🔁 Runs monthly${form.scheduledDate ? ' on day ' + new Date(form.scheduledDate + 'T00:00').getDate() : ''} at ${timeStr}`;
      default: return '';
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const suite = suites.find(s => String(s.id) === String(form.testSuiteId));
    const payload = {
      testSuiteId: form.testSuiteId ? +form.testSuiteId : null,
      environmentId: form.environmentId ? +form.environmentId : null,
      targetGroupId: form.targetGroupId ? +form.targetGroupId : null,
      testSuiteName: suite?.name || '',
      executionType: form.executionType,
      browserType: form.browserType,
      browserVersion: form.browserVersion || null,
      status: form.status,
      recurrenceType: form.executionType === 'scheduled' ? form.recurrenceType : null,
      scheduledDate: form.executionType === 'scheduled' && form.scheduledDate ? form.scheduledDate : null,
      scheduledTime: form.executionType === 'scheduled' && form.scheduledTime ? form.scheduledTime + ':00' : null,
      recurrenceDays: form.executionType === 'scheduled' && form.recurrenceType === 'weekly' ? form.recurrenceDays.join(',') : null,
      recurrenceEndDate: form.executionType === 'scheduled' && form.recurrenceEndDate ? form.recurrenceEndDate : null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    const url = isEdit ? `/api/schedulers/${id}` : '/api/schedulers';
    const method = isEdit ? 'PUT' : 'POST';
    const r = await api(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (r.ok) {
      toast('success', isEdit ? 'Updated!' : 'Created!', 'Scheduler saved successfully.');
      setTimeout(() => navigate('/scheduler'), 800);
    } else {
      toast('error', 'Failed', 'Could not save scheduler.');
      setSaving(false);
    }
  };

  if (!loaded) return <div className="page-view"><div className="spinner" style={{ marginTop: 80 }} /></div>;

  return (
    <div className="page-view">
      <PageHeader
        title={isEdit ? 'Edit Scheduler' : 'New Scheduler'}
        crumb={isEdit ? 'Edit' : 'New Scheduler'}
        actions={<Link to="/scheduler" className="btn btn-ghost">← Back</Link>}
      />
      <div className="card form-card">
        <div className="card-header"><h2>📅 Schedule Configuration</h2><p>Configure when this test suite should run</p></div>
        <form onSubmit={save}>
          <div className="form-section">
            <div className="form-section-title">Test Suite &amp; Browser</div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Test Suite <span className="req">*</span></label>
                <select id="sched-suite" className="form-select" value={form.testSuiteId} onChange={e => set('testSuiteId', e.target.value)} required>
                  <option value="">Select a test suite…</option>
                  {suites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Environment</label>
                <select id="sched-env" className="form-select" value={form.environmentId} onChange={e => set('environmentId', e.target.value)}>
                  <option value="">Default (No Environment)</option>
                  {envs.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Browser <span className="req">*</span></label>
                <select id="sched-browser" className="form-select" value={form.browserType} onChange={e => set('browserType', e.target.value)} required>
                  <option value="">Select browser…</option>
                  <option value="chrome">🌐 Chrome</option>
                  <option value="firefox">🦊 Firefox</option>
                  <option value="edge">🔷 Edge</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Browser Version</label>
                <input type="text" id="sched-browser-ver" className="form-input" placeholder="e.g. 137" value={form.browserVersion} onChange={e => set('browserVersion', e.target.value)} />
                <div className="field-hint" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Require a specific major browser version.</div>
              </div>
              <div className="form-group">
                <label className="form-label">Agent Pool</label>
                <select id="sched-pool" className="form-select" value={form.targetGroupId} onChange={e => set('targetGroupId', e.target.value)}>
                  <option value="">Default (Any Available Agent)</option>
                  {pools.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select id="sched-status" className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="active">✅ Active</option>
                  <option value="inactive">⏸ Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">Execution Timing</div>
            <div className="exec-type-toggle">
              <button type="button" id="exec-now-btn" className={`exec-type-btn ${form.executionType === 'now' ? 'active' : ''}`} onClick={() => set('executionType', 'now')}>
                <span className="exec-type-icon">▶</span>
                <span className="exec-type-label">Run Now</span>
                <span className="exec-type-sub">Execute immediately</span>
              </button>
              <button type="button" id="exec-sched-btn" className={`exec-type-btn ${form.executionType === 'scheduled' ? 'active' : ''}`} onClick={() => set('executionType', 'scheduled')}>
                <span className="exec-type-icon">🕐</span>
                <span className="exec-type-label">Scheduled</span>
                <span className="exec-type-sub">Set date, time &amp; recurrence</span>
              </button>
            </div>

            {form.executionType === 'scheduled' && (
              <div className="schedule-panel">
                <div className="datetime-row">
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input id="sched-date" type="date" className="form-input" min={today} value={form.scheduledDate} onChange={e => set('scheduledDate', e.target.value)} required={form.recurrenceType === 'once' || form.recurrenceType === 'monthly'} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Time <span className="req">*</span></label>
                    <input id="sched-time" type="time" className="form-input" value={form.scheduledTime} onChange={e => set('scheduledTime', e.target.value)} required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Recurrence</label>
                  <div className="recurrence-cards">
                    {[
                      { key: 'once',    icon: '1️⃣', label: 'Once',    sub: 'Single execution' },
                      { key: 'daily',   icon: '📆', label: 'Daily',   sub: 'Every day' },
                      { key: 'weekly',  icon: '🗓️', label: 'Weekly',  sub: 'Choose days' },
                      { key: 'monthly', icon: '📅', label: 'Monthly', sub: 'Same date each month' },
                    ].map(opt => (
                      <button key={opt.key} type="button" id={`recur-${opt.key}`} className={`recurrence-card ${form.recurrenceType === opt.key ? 'active' : ''}`} onClick={() => set('recurrenceType', opt.key)}>
                        <span className="rc-icon">{opt.icon}</span>
                        <span className="rc-label">{opt.label}</span>
                        <span className="rc-sub">{opt.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {form.recurrenceType === 'weekly' && (
                  <div className="form-group">
                    <label className="form-label">Days of the Week <span className="req">*</span></label>
                    <div className="day-picker">
                      {DAY_OPTIONS.map(d => (
                        <button key={d.key} type="button" id={`day-${d.key}`} className={`day-pill ${form.recurrenceDays.includes(d.key) ? 'active' : ''}`} onClick={() => toggleDay(d.key)}>
                          {d.label}
                        </button>
                      ))}
                    </div>
                    {form.recurrenceDays.length === 0 && (
                      <small className="form-hint" style={{ color: '#ef4444' }}>Please select at least one day.</small>
                    )}
                  </div>
                )}

                {form.recurrenceType !== 'once' && (
                  <div className="form-group">
                    <label className="form-label">End Date <span className="form-hint-inline">(optional — leave blank to run indefinitely)</span></label>
                    <input id="sched-end-date" type="date" className="form-input" min={form.scheduledDate || today} value={form.recurrenceEndDate} onChange={e => set('recurrenceEndDate', e.target.value)} />
                  </div>
                )}

                {buildSummary() && (
                  <div className="schedule-summary">
                    <span className="schedule-summary-icon">📋</span>
                    <span className="schedule-summary-text">{buildSummary()}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="form-actions">
            <Link to="/scheduler" className="btn btn-ghost">Cancel</Link>
            <button
              type="submit"
              className="btn btn-success"
              disabled={saving || !form.testSuiteId || !form.executionType || !form.browserType || (form.executionType === 'scheduled' && form.recurrenceType === 'weekly' && form.recurrenceDays.length === 0)}
            >
              {saving ? '⏳ Saving…' : isEdit ? '💾 Update Scheduler' : '💾 Create Scheduler'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
