import { useState, useEffect } from 'react';
import { api } from '../../api/apiClient';

const TABS = ['GitHub Actions', 'GitLab CI', 'Jenkins', 'cURL'];

const ICONS = {
  'GitHub Actions': '🐙',
  'GitLab CI': '🦊',
  'Jenkins': '🤖',
  'cURL': '⚡',
};

function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ position: 'relative', background: '#0d1117', borderRadius: 12, overflow: 'hidden', border: '1px solid #30363d' }}>
      <button
        onClick={copy}
        style={{
          position: 'absolute', top: 12, right: 12,
          background: copied ? '#238636' : '#21262d',
          color: '#fff', border: '1px solid #30363d',
          borderRadius: 6, padding: '4px 10px', fontSize: 12,
          cursor: 'pointer', zIndex: 1, transition: 'background 0.2s',
        }}
      >
        {copied ? '✓ Copied' : 'Copy'}
      </button>
      <pre style={{
        margin: 0, padding: '20px 24px', color: '#e6edf3',
        fontSize: 13, lineHeight: 1.6, overflowX: 'auto',
        fontFamily: "'Fira Code', 'Cascadia Code', monospace",
      }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function SuiteSelector({ suites, selected, onSelect }) {
  return (
    <select
      value={selected}
      onChange={e => onSelect(e.target.value)}
      style={{
        background: 'var(--surface)', color: 'var(--txt-h)',
        border: '1px solid var(--border)', borderRadius: 8,
        padding: '8px 12px', fontSize: 14, cursor: 'pointer',
        minWidth: 220,
      }}
    >
      <option value="">— Select a Test Suite —</option>
      {suites.map(s => (
        <option key={s.id} value={s.id}>{s.name}</option>
      ))}
    </select>
  );
}

function generateSnippet(tab, suite, apiKey, baseUrl) {
  const name = suite?.name || 'Your Suite Name';
  const id = suite?.id || '{suite_id}';
  const key = apiKey || 'ap_live_your_api_key_here';
  const url = baseUrl || 'https://your-autopilot-domain.com';

  if (tab === 'GitHub Actions') return `# .github/workflows/autopilot.yml
name: AutoPilot Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger AutoPilot Suite
        id: trigger
        run: |
          RESPONSE=$(curl -s -X POST \\
            -H "Authorization: Bearer ${key}" \\
            -H "Content-Type: application/json" \\
            -d '{"suiteName": "${name}", "browser": "chrome"}' \\
            ${url}/api/v1/suites/trigger-by-name)
          echo "SCHEDULER_ID=$(echo $RESPONSE | jq -r '.schedulerId')" >> $GITHUB_ENV

      - name: Wait for results
        run: |
          for i in {1..30}; do
            STATUS=$(curl -s \\
              -H "Authorization: Bearer ${key}" \\
              ${url}/api/v1/schedulers/$SCHEDULER_ID/execution-status | jq -r '.status')
            echo "Status: $STATUS"
            if [ "$STATUS" == "completed" ]; then break; fi
            sleep 10
          done

      - name: Check pass/fail
        run: |
          RESULT=$(curl -s \\
            -H "Authorization: Bearer ${key}" \\
            ${url}/api/v1/schedulers/$SCHEDULER_ID/execution-status)
          EXIT_CODE=$(echo $RESULT | jq -r '.exitCode')
          echo "Pass: $(echo $RESULT | jq '.passedCount'), Fail: $(echo $RESULT | jq '.failedCount')"
          exit $EXIT_CODE`;

  if (tab === 'GitLab CI') return `# .gitlab-ci.yml
stages:
  - test

autopilot_tests:
  stage: test
  image: alpine
  before_script:
    - apk add --no-cache curl jq
  script:
    - |
      RESPONSE=$(curl -s -X POST \\
        -H "Authorization: Bearer ${key}" \\
        -H "Content-Type: application/json" \\
        -d '{"suiteName": "${name}", "browser": "chrome"}' \\
        ${url}/api/v1/suites/trigger-by-name)
      SCHEDULER_ID=$(echo $RESPONSE | jq -r '.schedulerId')

      for i in $(seq 1 30); do
        STATUS=$(curl -s \\
          -H "Authorization: Bearer ${key}" \\
          ${url}/api/v1/schedulers/$SCHEDULER_ID/execution-status | jq -r '.status')
        echo "Status: $STATUS"
        [ "$STATUS" = "completed" ] && break
        sleep 10
      done

      RESULT=$(curl -s \\
        -H "Authorization: Bearer ${key}" \\
        ${url}/api/v1/schedulers/$SCHEDULER_ID/execution-status)
      EXIT_CODE=$(echo $RESULT | jq -r '.exitCode')
      echo "Pass: $(echo $RESULT | jq '.passedCount'), Fail: $(echo $RESULT | jq '.failedCount')"
      exit $EXIT_CODE`;

  if (tab === 'Jenkins') return `// Jenkinsfile (Declarative Pipeline)
pipeline {
    agent any

    environment {
        AUTOPILOT_API_KEY = credentials('autopilot-api-key')
        AUTOPILOT_URL = '${url}'
        SUITE_NAME = '${name}'
    }

    stages {
        stage('Trigger AutoPilot Tests') {
            steps {
                script {
                    def response = sh(
                        script: """curl -s -X POST \\
                            -H "Authorization: Bearer $AUTOPILOT_API_KEY" \\
                            -H "Content-Type: application/json" \\
                            -d '{"suiteName": "$SUITE_NAME", "browser": "chrome"}' \\
                            $AUTOPILOT_URL/api/v1/suites/trigger-by-name""",
                        returnStdout: true
                    ).trim()
                    env.SCHEDULER_ID = sh(script: "echo '${response}' | jq -r '.schedulerId'", returnStdout: true).trim()
                }
            }
        }

        stage('Wait for Results') {
            steps {
                script {
                    timeout(time: 10, unit: 'MINUTES') {
                        waitUntil {
                            def status = sh(
                                script: """curl -s \\
                                    -H "Authorization: Bearer $AUTOPILOT_API_KEY" \\
                                    $AUTOPILOT_URL/api/v1/schedulers/$SCHEDULER_ID/execution-status | jq -r '.status'""",
                                returnStdout: true
                            ).trim()
                            echo "AutoPilot status: ${status}"
                            return status == 'completed'
                        }
                    }
                }
            }
        }

        stage('Assert Results') {
            steps {
                script {
                    def result = sh(
                        script: """curl -s \\
                            -H "Authorization: Bearer $AUTOPILOT_API_KEY" \\
                            $AUTOPILOT_URL/api/v1/schedulers/$SCHEDULER_ID/execution-status""",
                        returnStdout: true
                    ).trim()
                    def exitCode = sh(script: "echo '${result}' | jq -r '.exitCode'", returnStdout: true).trim()
                    if (exitCode != '0') {
                        error("AutoPilot tests failed!")
                    }
                }
            }
        }
    }
}`;

  if (tab === 'cURL') return `# Trigger a suite by ID
curl -X POST \\
  -H "Authorization: Bearer ${key}" \\
  -H "Content-Type: application/json" \\
  -d '{"browser": "chrome", "environmentId": 1}' \\
  ${url}/api/v1/suites/${id}/trigger

# Or trigger by suite name
curl -X POST \\
  -H "Authorization: Bearer ${key}" \\
  -H "Content-Type: application/json" \\
  -d '{"suiteName": "${name}", "browser": "chrome"}' \\
  ${url}/api/v1/suites/trigger-by-name

# Poll for results (replace {schedulerId} with the ID from the response)
curl -H "Authorization: Bearer ${key}" \\
  ${url}/api/v1/schedulers/{schedulerId}/execution-status

# Response when completed:
# {
#   "executionId": 42,
#   "status": "completed",
#   "exitCode": 0,       <- 0 = all passed, 1 = failures, 2 = still running
#   "passedCount": 15,
#   "failedCount": 0,
#   "totalCount": 15,
#   "passPercentage": 100.0,
#   "durationMs": 38420
# }`;

  return '';
}

export default function CicdIntegrationView() {
  const [activeTab, setActiveTab] = useState('GitHub Actions');
  const [suites, setSuites] = useState([]);
  const [selectedSuiteId, setSelectedSuiteId] = useState('');
  const [apiKeys, setApiKeys] = useState([]);
  const [selectedKeyId, setSelectedKeyId] = useState('');
  const [baseUrl, setBaseUrl] = useState(window.location.origin);

  useEffect(() => {
    api.get('/api/test-suites').then(r => setSuites(r.data || [])).catch(() => {});
    api.get('/api/admin/api-keys').then(r => setApiKeys(r.data || [])).catch(() => {});
  }, []);

  const selectedSuite = suites.find(s => String(s.id) === String(selectedSuiteId));
  const selectedKey = apiKeys.find(k => String(k.id) === String(selectedKeyId));
  const snippet = generateSnippet(activeTab, selectedSuite, selectedKey?.token, baseUrl);

  return (
    <div style={{ padding: '32px', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
          }}>🔗</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--txt-h)' }}>CI/CD Integration</h1>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--txt-muted)' }}>
              Trigger AutoPilot test suites directly from your DevOps pipeline
            </p>
          </div>
        </div>
      </div>

      {/* Config Panel */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 14, padding: 24, marginBottom: 28,
      }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: 'var(--txt-h)' }}>
          Customize Your Snippet
        </h3>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--txt-muted)', marginBottom: 6 }}>Test Suite</label>
            <SuiteSelector suites={suites} selected={selectedSuiteId} onSelect={setSelectedSuiteId} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--txt-muted)', marginBottom: 6 }}>API Key</label>
            <select
              value={selectedKeyId}
              onChange={e => setSelectedKeyId(e.target.value)}
              style={{
                background: 'var(--surface)', color: 'var(--txt-h)',
                border: '1px solid var(--border)', borderRadius: 8,
                padding: '8px 12px', fontSize: 14, cursor: 'pointer', minWidth: 220,
              }}
            >
              <option value="">— Select an API Key —</option>
              {apiKeys.map(k => (
                <option key={k.id} value={k.id}>{k.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--txt-muted)', marginBottom: 6 }}>AutoPilot Base URL</label>
            <input
              type="text"
              value={baseUrl}
              onChange={e => setBaseUrl(e.target.value)}
              style={{
                background: 'var(--surface)', color: 'var(--txt-h)',
                border: '1px solid var(--border)', borderRadius: 8,
                padding: '8px 12px', fontSize: 14, minWidth: 260,
              }}
            />
          </div>
        </div>
        {apiKeys.length === 0 && (
          <p style={{ marginTop: 14, fontSize: 13, color: 'var(--amber)', background: 'rgba(245,158,11,0.08)', borderRadius: 8, padding: '8px 12px' }}>
            ⚠️ No API Keys found. Go to <strong>CI/CD & API Keys</strong> in Administration to create one first.
          </p>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'var(--surface)', borderRadius: 10, padding: 4, border: '1px solid var(--border)', width: 'fit-content' }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 18px', borderRadius: 7, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 500,
              background: activeTab === tab ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : 'transparent',
              color: activeTab === tab ? '#fff' : 'var(--txt-muted)',
              transition: 'all 0.2s',
            }}
          >
            {ICONS[tab]} {tab}
          </button>
        ))}
      </div>

      {/* Code Snippet */}
      <CodeBlock code={snippet} />

      {/* API Reference */}
      <div style={{
        marginTop: 32, background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 14, padding: 24,
      }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: 'var(--txt-h)' }}>
          📖 API Reference
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { method: 'POST', path: '/api/v1/suites/{id}/trigger', desc: 'Trigger a suite by numeric ID. Accepts optional browser, environmentId, targetGroupId in the request body.' },
            { method: 'POST', path: '/api/v1/suites/trigger-by-name', desc: 'Trigger a suite by name. Body: { "suiteName": "...", "browser": "chrome" }.' },
            { method: 'GET',  path: '/api/v1/schedulers/{id}/execution-status', desc: 'Poll the status of a triggered run. Returns exitCode (0=pass, 1=fail, 2=running).' },
            { method: 'GET',  path: '/api/v1/executions/{id}/status', desc: 'Get the full status of an execution by its execution ID.' },
          ].map(({ method, path, desc }) => (
            <div key={path} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{
                padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700,
                background: method === 'POST' ? 'rgba(99,102,241,0.15)' : 'rgba(16,185,129,0.15)',
                color: method === 'POST' ? '#818cf8' : '#34d399',
                flexShrink: 0, fontFamily: 'monospace',
              }}>{method}</span>
              <div>
                <code style={{ fontSize: 13, color: 'var(--txt-h)', display: 'block', marginBottom: 2 }}>{path}</code>
                <span style={{ fontSize: 12, color: 'var(--txt-muted)' }}>{desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
