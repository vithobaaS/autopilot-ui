import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/apiClient';
import { toast } from '../../components/common/ToastContainer';
import { 
  Trash2, Key, Code, Cpu, Terminal, Copy, 
  ShieldAlert, CheckCircle, RefreshCw, AlertCircle, 
  Info, ExternalLink, Settings 
} from 'lucide-react';
import { fmt, copyToClipboard as copyUtil } from '../../utils/helpers';

export default function ApiKeysView() {
  // Tab states
  const [activeTab, setActiveTab] = useState('keys'); // 'keys', 'guides', 'ai-gating'
  const [activeGuideTab, setActiveGuideTab] = useState('bash'); // 'bash', 'github', 'gitlab', 'jenkins'

  // Keys states
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '' });
  const [newKey, setNewKey] = useState(null);

  // AI Gating states
  const [aiEnabled, setAiEnabled] = useState(true);
  const [qualityThreshold, setQualityThreshold] = useState(80);
  const [buildId, setBuildId] = useState('build-1024');
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const load = () => {
    setLoading(true);
    api('/api/apikeys')
      .then(r => r.json())
      .then(d => { setKeys(d || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm({ name: '' }); setNewKey(null); setShowForm(true); };

  const save = async () => {
    if (!form.name.trim()) { toast('error', 'Validation', 'Key name is required.'); return; }
    const r = await api('/api/apikeys', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(form) 
    });
    if (r.ok) { 
      const data = await r.json();
      toast('success', 'Created', `API Key "${form.name}" generated.`); 
      setNewKey(data.token);
      setShowForm(false);
      load(); 
    } else { 
      toast('error', 'Error', 'Failed to generate API key.'); 
    }
  };

  const del = async (id, name) => {
    if (!window.confirm(`Revoke API Key "${name}"? Any systems using this key will immediately stop working.`)) return;
    await api(`/api/apikeys/${id}`, { method: 'DELETE' });
    toast('success', 'Revoked', `"${name}" removed.`); 
    load();
  };

  const copyToClipboard = async (text) => {
    await copyUtil(text);
    toast('success', 'Copied to clipboard');
  };

  // Run AI gating check
  const testAiGating = async () => {
    if (!buildId.trim()) { toast('error', 'Validation', 'Build ID is required.'); return; }
    setAiLoading(true);
    try {
      const res = await api(`/api/ai-engine/predict-release-risk?buildId=${encodeURIComponent(buildId)}`);
      if (res.ok) {
        const data = await res.json();
        setAiResult(data);
      } else {
        toast('error', 'Error', 'Failed to consult AI Decision Engine.');
      }
    } catch {
      toast('error', 'Error', 'Connection error.');
    } finally {
      setAiLoading(false);
    }
  };

  // Host info helper
  const getBaseUrl = () => {
    return window.location.origin;
  };

  return (
    <div className="page-view">
      <div className="page-header">
        <div className="page-header-left">
          <h1>CI/CD & API Keys</h1>
          <div className="breadcrumbs">
            <Link to="/dashboard">Home</Link>
            <span className="sep">›</span>
            <span>CI/CD & API Keys</span>
          </div>
        </div>
        <div className="page-header-actions">
          {activeTab === 'keys' && (
            <button className="btn btn-primary" onClick={openCreate}>＋ Generate Key</button>
          )}
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="tab-menu" style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
        <button 
          style={{
            background: 'none', border: 'none',
            color: activeTab === 'keys' ? 'var(--brand)' : 'var(--txt-muted)',
            padding: '12px 16px', cursor: 'pointer',
            borderBottom: activeTab === 'keys' ? '2px solid var(--brand)' : '2px solid transparent',
            fontWeight: 600, fontSize: '14px', transition: 'var(--t)', display: 'flex', alignItems: 'center', gap: 8
          }}
          onClick={() => setActiveTab('keys')}
        >
          <Key size={16} /> API Access Keys
        </button>
        <button 
          style={{
            background: 'none', border: 'none',
            color: activeTab === 'guides' ? 'var(--brand)' : 'var(--txt-muted)',
            padding: '12px 16px', cursor: 'pointer',
            borderBottom: activeTab === 'guides' ? '2px solid var(--brand)' : '2px solid transparent',
            fontWeight: 600, fontSize: '14px', transition: 'var(--t)', display: 'flex', alignItems: 'center', gap: 8
          }}
          onClick={() => setActiveTab('guides')}
        >
          <Terminal size={16} /> DevOps Pipeline Guides
        </button>
        <button 
          style={{
            background: 'none', border: 'none',
            color: activeTab === 'ai-gating' ? 'var(--brand)' : 'var(--txt-muted)',
            padding: '12px 16px', cursor: 'pointer',
            borderBottom: activeTab === 'ai-gating' ? '2px solid var(--brand)' : '2px solid transparent',
            fontWeight: 600, fontSize: '14px', transition: 'var(--t)', display: 'flex', alignItems: 'center', gap: 8
          }}
          onClick={() => setActiveTab('ai-gating')}
        >
          <Cpu size={16} /> AI Release Gating
        </button>
      </div>

      {/* TAB 1: API KEYS MANAGER */}
      {activeTab === 'keys' && (
        <>
          {newKey && (
            <div className="card" style={{ marginBottom: 24, border: '1px solid var(--brand)', background: 'rgba(139, 92, 246, 0.05)' }}>
              <div className="card-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                <div>
                  <h2 style={{ color: 'var(--brand)' }}>🎉 Key Generated Successfully!</h2>
                  <p>Please copy your API key now. For security reasons, <strong>it will never be shown again</strong>.</p>
                </div>
              </div>
              <div style={{ padding: '0 24px 24px' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'var(--bg-body)', padding: '16px', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <code style={{ flex: 1, fontSize: '1.1rem', color: 'var(--txt-h)', wordBreak: 'break-all', fontFamily: 'monospace' }}>{newKey}</code>
                  <button className="btn btn-ghost" onClick={() => copyToClipboard(newKey)}>📋 Copy</button>
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <div>
                <h2>🔑 Active Tokens</h2>
                <p>Manage access tokens for CI/CD pipelines, CLI triggers, and custom integrations.</p>
              </div>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Token Prefix</th>
                    <th>Created</th>
                    <th>Last Used</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5}><div className="spinner" style={{ margin: '20px auto' }} /></td></tr>
                  ) : keys.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="empty-state">
                          <div className="empty-state-icon">🔑</div>
                          <h3>No API keys found</h3>
                          <p>Generate an API key to trigger deployments from your CI/CD pipelines.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    keys.map(k => (
                      <tr key={k.id}>
                        <td><span className="cell-bold">{k.name}</span></td>
                        <td><code style={{ color: 'var(--brand)', fontWeight: 700 }}>ap_live_••••••••••••••••••••</code></td>
                        <td><span className="text-muted text-sm">{fmt(k.createdAt)}</span></td>
                        <td>
                          <span className="text-muted text-sm">
                            {k.lastUsedAt ? fmt(k.lastUsedAt) : 'Never'}
                          </span>
                        </td>
                        <td>
                          <div className="action-row">
                            <button 
                              className="act-btn kill" 
                              style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }} 
                              onClick={() => del(k.id, k.name)} 
                              title="Revoke Token"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: DEVOPS PIPELINE GUIDES */}
      {activeTab === 'guides' && (
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }}>
          {/* Guide Selector Side Menu */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button 
              className={`btn ${activeGuideTab === 'bash' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ justifyContent: 'flex-start', textAlign: 'left' }}
              onClick={() => setActiveGuideTab('bash')}
            >
              🐚 cURL / Bash Script
            </button>
            <button 
              className={`btn ${activeGuideTab === 'github' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ justifyContent: 'flex-start', textAlign: 'left' }}
              onClick={() => setActiveGuideTab('github')}
            >
              🐙 GitHub Actions
            </button>
            <button 
              className={`btn ${activeGuideTab === 'gitlab' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ justifyContent: 'flex-start', textAlign: 'left' }}
              onClick={() => setActiveGuideTab('gitlab')}
            >
              🦊 GitLab CI/CD
            </button>
            <button 
              className={`btn ${activeGuideTab === 'jenkins' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ justifyContent: 'flex-start', textAlign: 'left' }}
              onClick={() => setActiveGuideTab('jenkins')}
            >
              👴 Jenkins Pipeline
            </button>

            <div style={{ marginTop: 20, padding: 12, borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, fontWeight: 600, fontSize: '0.85rem' }}>
                <Info size={14} className="text-brand" />
                <span>Blocking CLI Gating</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--txt-muted)', lineHeight: 1.4, margin: 0 }}>
                We host blocking scripts that poll the test execution in real-time. If tests fail, your pipeline fails automatically.
              </p>
            </div>
          </div>

          {/* Guide Display Area */}
          <div className="card" style={{ padding: 24 }}>
            {activeGuideTab === 'bash' && (
              <div>
                <h2>🐚 cURL / CLI Gating Guide</h2>
                <p style={{ color: 'var(--txt-muted)', marginBottom: 20 }}>
                  Execute automated test runs and gate deployments in Linux, Mac, or Windows.
                </p>

                <h3 style={{ fontSize: '1rem', marginTop: 24, marginBottom: 8 }}>Option 1: Blocking Gating Script (Recommended)</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--txt-muted)' }}>
                  Downloads our pre-configured bash script which triggers the suite and blocks until results are returned.
                </p>
                <div style={{ position: 'relative', background: '#1e1e1e', padding: 16, borderRadius: 8, border: '1px solid #333' }}>
                  <code style={{ color: '#d4d4d4', whiteSpace: 'pre-wrap', fontFamily: 'monospace', display: 'block', fontSize: '0.85rem', lineHeight: 1.5 }}>
                    # Download blocking script<br />
                    {`curl -sSL ${getBaseUrl()}/trigger-and-wait.sh -o trigger-and-wait.sh`}<br />
                    chmod +x trigger-and-wait.sh<br /><br />
                    # Run the gating check<br />
                    {`./trigger-and-wait.sh --suite <SUITE_ID> --token <API_KEY> --server "${getBaseUrl()}"`}
                  </code>
                  <button 
                    className="btn btn-ghost btn-sm" 
                    style={{ position: 'absolute', top: 12, right: 12, color: '#d4d4d4' }}
                    onClick={() => copyToClipboard(`curl -sSL ${getBaseUrl()}/trigger-and-wait.sh -o trigger-and-wait.sh\nchmod +x trigger-and-wait.sh\n./trigger-and-wait.sh --suite <SUITE_ID> --token <API_KEY> --server "${getBaseUrl()}"`)}
                  >
                    📋 Copy
                  </button>
                </div>

                <h3 style={{ fontSize: '1rem', marginTop: 24, marginBottom: 8 }}>Option 2: Fire-and-Forget Webhook</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--txt-muted)' }}>
                  Triggers the test run instantly. Your pipeline will proceed immediately without waiting for tests to finish.
                </p>
                <div style={{ position: 'relative', background: '#1e1e1e', padding: 16, borderRadius: 8, border: '1px solid #333' }}>
                  <code style={{ color: '#d4d4d4', whiteSpace: 'pre-wrap', fontFamily: 'monospace', display: 'block', fontSize: '0.85rem', lineHeight: 1.5 }}>
                    {`curl -X POST "${getBaseUrl()}/api/v1/suites/<SUITE_ID>/trigger" \\`}<br />
                    {"     "}-H "Authorization: Bearer &lt;API_KEY&gt;"
                  </code>
                  <button 
                    className="btn btn-ghost btn-sm" 
                    style={{ position: 'absolute', top: 12, right: 12, color: '#d4d4d4' }}
                    onClick={() => copyToClipboard(`curl -X POST "${getBaseUrl()}/api/v1/suites/<SUITE_ID>/trigger" \\\n     -H "Authorization: Bearer <API_KEY>"`)}
                  >
                    📋 Copy
                  </button>
                </div>
              </div>
            )}

            {activeGuideTab === 'github' && (
              <div>
                <h2>🐙 GitHub Actions Workflow Integration</h2>
                <p style={{ color: 'var(--txt-muted)', marginBottom: 20 }}>
                  Integrate AutoPilot directly into your GitHub Action pipeline.
                </p>

                <p style={{ fontSize: '0.9rem', color: 'var(--txt-muted)' }}>
                  Save your API key as a GitHub Repository Secret named <code>AUTOPILOT_API_KEY</code>, then add this step to your <code>.github/workflows/deploy.yml</code> workflow:
                </p>

                <div style={{ position: 'relative', background: '#1e1e1e', padding: 16, borderRadius: 8, border: '1px solid #333' }}>
                  <code style={{ color: '#9cdcfe', whiteSpace: 'pre', fontFamily: 'monospace', display: 'block', fontSize: '0.85rem', lineHeight: 1.5 }}>
                    <span style={{ color: '#569cd6' }}>jobs:</span><br />
                    <span style={{ color: '#569cd6' }}>  autopilot-gating:</span><br />
                    <span style={{ color: '#569cd6' }}>    runs-on:</span> ubuntu-latest<br />
                    <span style={{ color: '#569cd6' }}>    steps:</span><br />
                    <span style={{ color: '#569cd6' }}>      - name:</span> Trigger & Wait for AutoPilot Tests<br />
                    <span style={{ color: '#569cd6' }}>        run:</span> |<br />
                    <span style={{ color: '#ce9178' }}>{`          curl -sSL ${getBaseUrl()}/trigger-and-wait.sh -o trigger-and-wait.sh`}</span><br />
                    <span style={{ color: '#ce9178' }}>          chmod +x trigger-and-wait.sh</span><br />
                    <span style={{ color: '#ce9178' }}>{`          ./trigger-and-wait.sh --suite 5 --token "\${{ secrets.AUTOPILOT_API_KEY }}" --server "${getBaseUrl()}"`}</span>
                  </code>
                  <button 
                    className="btn btn-ghost btn-sm" 
                    style={{ position: 'absolute', top: 12, right: 12, color: '#d4d4d4' }}
                    onClick={() => copyToClipboard(`jobs:\n  autopilot-gating:\n    runs-on: ubuntu-latest\n    steps:\n      - name: Trigger & Wait for AutoPilot Tests\n        run: |\n          curl -sSL ${getBaseUrl()}/trigger-and-wait.sh -o trigger-and-wait.sh\n          chmod +x trigger-and-wait.sh\n          ./trigger-and-wait.sh --suite <SUITE_ID> --token "\${{ secrets.AUTOPILOT_API_KEY }}" --server "${getBaseUrl()}"`)}
                  >
                    📋 Copy
                  </button>
                </div>
              </div>
            )}

            {activeGuideTab === 'gitlab' && (
              <div>
                <h2>🦊 GitLab CI/CD Pipeline Integration</h2>
                <p style={{ color: 'var(--txt-muted)', marginBottom: 20 }}>
                  Inject test automation checks directly in your <code>.gitlab-ci.yml</code> workflow.
                </p>

                <p style={{ fontSize: '0.9rem', color: 'var(--txt-muted)' }}>
                  Define <code>AUTOPILOT_API_KEY</code> under CI/CD Variables in GitLab Settings, and paste this stage definition:
                </p>

                <div style={{ position: 'relative', background: '#1e1e1e', padding: 16, borderRadius: 8, border: '1px solid #333' }}>
                  <code style={{ color: '#d4d4d4', whiteSpace: 'pre', fontFamily: 'monospace', display: 'block', fontSize: '0.85rem', lineHeight: 1.5 }}>
                    <span style={{ color: '#569cd6' }}>stages:</span><br />
                    {"  "}- test<br /><br />
                    <span style={{ color: '#569cd6' }}>autopilot_tests:</span><br />
                    <span style={{ color: '#569cd6' }}>  stage:</span> test<br />
                    <span style={{ color: '#569cd6' }}>  image:</span> curlimages/curl:latest<br />
                    <span style={{ color: '#569cd6' }}>  script:</span><br />
                    {`    - curl -sSL ${getBaseUrl()}/trigger-and-wait.sh -o trigger-and-wait.sh`}<br />
                    {"    "}- chmod +x trigger-and-wait.sh<br />
                    {`    - ./trigger-and-wait.sh --suite 5 --token "$AUTOPILOT_API_KEY" --server "${getBaseUrl()}"`}
                  </code>
                  <button 
                    className="btn btn-ghost btn-sm" 
                    style={{ position: 'absolute', top: 12, right: 12, color: '#d4d4d4' }}
                    onClick={() => copyToClipboard(`stages:\n  - test\n\nautopilot_tests:\n  stage: test\n  image: curlimages/curl:latest\n  script:\n    - curl -sSL ${getBaseUrl()}/trigger-and-wait.sh -o trigger-and-wait.sh\n    - chmod +x trigger-and-wait.sh\n    - ./trigger-and-wait.sh --suite <SUITE_ID> --token "$AUTOPILOT_API_KEY" --server "${getBaseUrl()}"`)}
                  >
                    📋 Copy
                  </button>
                </div>
              </div>
            )}

            {activeGuideTab === 'jenkins' && (
              <div>
                <h2>👴 Jenkins Declarative Pipeline</h2>
                <p style={{ color: 'var(--txt-muted)', marginBottom: 20 }}>
                  Automate build gating inside a Jenkinsfile deployment stage.
                </p>

                <div style={{ position: 'relative', background: '#1e1e1e', padding: 16, borderRadius: 8, border: '1px solid #333' }}>
                  <code style={{ color: '#d4d4d4', whiteSpace: 'pre', fontFamily: 'monospace', display: 'block', fontSize: '0.85rem', lineHeight: 1.5 }}>
                    <span style={{ color: '#569cd6' }}>stage</span>(<span style={{ color: '#ce9178' }}>'AutoPilot Tests'</span>) &#123;<br />
                    {"    "}<span style={{ color: '#569cd6' }}>steps</span> &#123;<br />
                    {"        "}<span style={{ color: '#569cd6' }}>withCredentials</span>([string(credentialsId: <span style={{ color: '#ce9178' }}>'autopilot-api-key'</span>, variable: <span style={{ color: '#ce9178' }}>'API_KEY'</span>)]) &#123;<br />
                    {"            "}sh <span style={{ color: '#ce9178' }}>"""</span><br />
                    <span style={{ color: '#ce9178' }}>{`                curl -sSL ${getBaseUrl()}/trigger-and-wait.sh -o trigger-and-wait.sh`}</span><br />
                    <span style={{ color: '#ce9178' }}>                chmod +x trigger-and-wait.sh</span><br />
                    <span style={{ color: '#ce9178' }}>{`                ./trigger-and-wait.sh --suite 5 --token \${API_KEY} --server "${getBaseUrl()}"`}</span><br />
                    {"            "}<span style={{ color: '#ce9178' }}>"""</span><br />
                    {"        "}&#125;<br />
                    {"    "}&#125;<br />
                    &#125;
                  </code>
                  <button 
                    className="btn btn-ghost btn-sm" 
                    style={{ position: 'absolute', top: 12, right: 12, color: '#d4d4d4' }}
                    onClick={() => copyToClipboard(`stage('AutoPilot Tests') {\n    steps {\n        withCredentials([string(credentialsId: 'autopilot-api-key', variable: 'API_KEY')]) {\n            sh """\n                curl -sSL ${getBaseUrl()}/trigger-and-wait.sh -o trigger-and-wait.sh\n                chmod +x trigger-and-wait.sh\n                ./trigger-and-wait.sh --suite <SUITE_ID> --token \${API_KEY} --server "${getBaseUrl()}"\n            """\n        }\n    }\n}`)}
                  >
                    📋 Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: AI RELEASE GATING */}
      {activeTab === 'ai-gating' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>
          {/* Settings Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h2 style={{ margin: 0 }}>🤖 AI Gating Configurations</h2>
                  <p style={{ color: 'var(--txt-muted)', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
                    Control deploying thresholds based on quality forecasting models.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: aiEnabled ? 'var(--brand)' : 'var(--txt-muted)' }}>
                    {aiEnabled ? 'ENABLED' : 'DISABLED'}
                  </span>
                  <label className="switch" style={{ position: 'relative', display: 'inline-block', width: 44, height: 24 }}>
                    <input 
                      type="checkbox" 
                      checked={aiEnabled} 
                      onChange={(e) => setAiEnabled(e.target.checked)} 
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span 
                      style={{
                        position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: aiEnabled ? 'var(--brand)' : '#ccc',
                        borderRadius: 24, transition: '.3s'
                      }}
                    >
                      <span 
                        style={{
                          position: 'absolute', content: '""', height: 18, width: 18, left: 3, bottom: 3,
                          backgroundColor: 'white', borderRadius: '50%', transition: '.3s',
                          transform: aiEnabled ? 'translateX(20px)' : 'none'
                        }}
                      />
                    </span>
                  </label>
                </div>
              </div>

              <div style={{ opacity: aiEnabled ? 1 : 0.5, pointerEvents: aiEnabled ? 'auto' : 'none', transition: 'var(--t)' }}>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontWeight: 600 }}>
                    <span>Target Release Quality Score Threshold</span>
                    <span style={{ color: 'var(--brand)' }}>{qualityThreshold}%</span>
                  </label>
                  <input 
                    type="range" 
                    min="50" 
                    max="98" 
                    value={qualityThreshold} 
                    onChange={(e) => setQualityThreshold(parseInt(e.target.value))}
                    style={{ width: '100%', height: 6, borderRadius: 3, background: 'var(--border)', outline: 'none', appearance: 'none', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--txt-muted)', marginTop: 4 }}>
                    <span>50% (High Risk)</span>
                    <span>80% (Recommended)</span>
                    <span>98% (Ultra Strict)</span>
                  </div>
                </div>

                <div style={{ padding: 16, background: 'rgba(139, 92, 246, 0.05)', border: '1px solid var(--brand)', borderRadius: 8, display: 'flex', gap: 12 }}>
                  <div style={{ marginTop: 2 }}><Info size={16} className="text-brand" /></div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--txt-h)', lineHeight: 1.5 }}>
                    When enabled, the CLI gating script will request a release safety forecast from the AutoPilot ML Model. Builds scoring lower than <strong>{qualityThreshold}%</strong> will automatically fail deployments even if core test cases report passes.
                  </p>
                </div>
              </div>
            </div>

            {/* Test Console */}
            <div className="card" style={{ padding: 24 }}>
              <h2>🔬 Release Gating Simulation Console</h2>
              <p style={{ color: 'var(--txt-muted)', fontSize: '0.9rem', marginBottom: 20 }}>
                Query the decision engine manually to test how the gating logic evaluates a specific build ID.
              </p>

              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Build Reference / Tag</label>
                  <input 
                    className="field-input" 
                    placeholder="e.g. prod-v2.1.0-build45" 
                    value={buildId} 
                    onChange={e => setBuildId(e.target.value)}
                  />
                </div>
                <button 
                  className="btn btn-primary" 
                  style={{ height: 42, display: 'flex', gap: 8, alignItems: 'center' }}
                  onClick={testAiGating}
                  disabled={aiLoading}
                >
                  {aiLoading ? <RefreshCw size={16} className="spinner" /> : <RefreshCw size={16} />}
                  Evaluate Decision
                </button>
              </div>
            </div>
          </div>

          {/* Predict Side Output Card */}
          <div>
            <div className="card" style={{ padding: 24, height: '100%', minHeight: 300, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>🤖 ML Engine Predictions</h3>

              {!aiResult ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--txt-muted)', textAlign: 'center' }}>
                  <Cpu size={48} style={{ opacity: 0.2, marginBottom: 12 }} />
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>Run a simulation on the left to consult the release gating decision engine.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
                  <div style={{ textAlign: 'center', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--txt-muted)' }}>AI Gating Decision</div>
                    <div 
                      style={{ 
                        fontSize: '1.6rem', 
                        fontWeight: 800, 
                        marginTop: 8, 
                        color: aiResult.decision === 'PASSED' || (aiResult.qualityScore * 100) >= qualityThreshold ? 'var(--green)' : 'var(--red)'
                      }}
                    >
                      {aiResult.decision === 'PASSED' || (aiResult.qualityScore * 100) >= qualityThreshold ? '🚀 SAFE TO DEPLOY' : '🛑 BLOCK DEPLOYMENT'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>Quality Metric Score</span>
                    <span 
                      style={{ 
                        fontSize: '1.4rem', 
                        fontWeight: 700, 
                        color: (aiResult.qualityScore * 100) >= qualityThreshold ? 'var(--green)' : 'var(--brand)'
                      }}
                    >
                      {Math.round(aiResult.qualityScore * 100)}%
                    </span>
                  </div>

                  {/* Visual Bar */}
                  <div style={{ height: 10, width: '100%', background: 'var(--border)', borderRadius: 5, overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        width: `${aiResult.qualityScore * 100}%`,
                        background: (aiResult.qualityScore * 100) >= qualityThreshold ? 'var(--green)' : 'var(--brand)',
                        borderRadius: 5,
                        transition: 'width 0.5s ease-out'
                      }}
                    />
                  </div>

                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--txt-muted)', display: 'block', marginBottom: 8 }}>Detected Risk Factors</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {aiResult.riskFactors && aiResult.riskFactors.map((f, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.85rem', color: 'var(--txt-h)' }}>
                          <AlertCircle size={14} style={{ color: 'var(--brand)', flexShrink: 0 }} />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ flex: 1 }} />

                  <div style={{ fontSize: '0.75rem', color: 'var(--txt-muted)', background: 'var(--bg-body)', padding: 12, borderRadius: 6, display: 'flex', gap: 8 }}>
                    <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>Real-time decisions are evaluated based on recent git changes, visual layout diffs, and historical suite runtime regressions.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE DIALOG MODAL */}
      {showForm && (
        <div className="modal-overlay" onClick={() => { setShowForm(false); setNewKey(null); }}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h2>＋ Generate New API Key</h2>
              <button className="modal-close" onClick={() => { setShowForm(false); setNewKey(null); }}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="field-label">Token Name *</label>
                <input 
                  className="field-input" 
                  placeholder="e.g. Jenkins Production Server" 
                  value={form.name} 
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                  autoFocus 
                />
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 4 }}>A descriptive name to help you identify this token later.</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => { setShowForm(false); setNewKey(null); }}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>🚀 Generate Token</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
