import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/apiClient';
import { toast } from '../../components/common/ToastContainer';
import { PageHeader } from '../../components/common/PageComponents';

const ACTIONS = ["AcceptCookies","AssertAttributeValue","AssertAudioComplete","AssertAudioData","AssertAudioError","AssertAudioIdle","AssertAudioLoad","AssertAudioMetrics","AssertAudioReady","AssertAudioRequest","AssertAudioResponse","AssertAudioState","AssertBluetoothComplete","AssertBluetoothData","AssertBluetoothError","AssertBluetoothIdle","AssertBluetoothLoad","AssertBluetoothMetrics","AssertBluetoothReady","AssertBluetoothRequest","AssertBluetoothResponse","AssertBluetoothState","AssertContains","AssertCookieComplete","AssertCookieData","AssertCookieError","AssertCookieIdle","AssertCookieLoad","AssertCookieMetrics","AssertCookieReady","AssertCookieRequest","AssertCookieResponse","AssertCookieState","AssertCryptoComplete","AssertCryptoData","AssertCryptoError","AssertCryptoIdle","AssertCryptoLoad","AssertCryptoMetrics","AssertCryptoReady","AssertCryptoRequest","AssertCryptoResponse","AssertCryptoState","AssertCSVComplete","AssertCSVData","AssertCSVError","AssertCSVIdle","AssertCSVLoad","AssertCSVMetrics","AssertCSVReady","AssertCSVRequest","AssertCSVResponse","AssertCSVState","AssertDatabaseComplete","AssertDatabaseData","AssertDatabaseError","AssertDatabaseIdle","AssertDatabaseLoad","AssertDatabaseMetrics","AssertDatabaseReady","AssertDatabaseRequest","AssertDatabaseResponse","AssertDatabaseState","AssertDisabled","AssertEnabled","AssertEquals","AssertExcelComplete","AssertExcelData","AssertExcelError","AssertExcelIdle","AssertExcelLoad","AssertExcelMetrics","AssertExcelReady","AssertExcelRequest","AssertExcelResponse","AssertExcelState","AssertGeoLocationComplete","AssertGeoLocationData","AssertGeoLocationError","AssertGeoLocationIdle","AssertGeoLocationLoad","AssertGeoLocationMetrics","AssertGeoLocationReady","AssertGeoLocationRequest","AssertGeoLocationResponse","AssertGeoLocationState","AssertIframeComplete","AssertIframeData","AssertIframeError","AssertIframeIdle","AssertIframeLoad","AssertIframeMetrics","AssertIframeReady","AssertIframeRequest","AssertIframeResponse","AssertIframeState","AssertLayoutComplete","AssertLayoutData","AssertLayoutError","AssertLayoutIdle","AssertLayoutLoad","AssertLayoutMetrics","AssertLayoutReady","AssertLayoutRequest","AssertLayoutResponse","AssertLayoutState","AssertMemoryComplete","AssertMemoryData","AssertMemoryError","AssertMemoryIdle","AssertMemoryLoad","AssertMemoryMetrics","AssertMemoryReady","AssertMemoryRequest","AssertMemoryResponse","AssertMemoryState","AssertMobileComplete","AssertMobileData","AssertMobileError","AssertMobileIdle","AssertMobileLoad","AssertMobileMetrics","AssertMobileReady","AssertMobileRequest","AssertMobileResponse","AssertMobileState","AssertNetworkComplete","AssertNetworkData","AssertNetworkError","AssertNetworkIdle","AssertNetworkLoad","AssertNetworkMetrics","AssertNetworkReady","AssertNetworkRequest","AssertNetworkResponse","AssertNetworkState","AssertNotVisible","AssertPDFComplete","AssertPDFData","AssertPDFError","AssertPDFIdle","AssertPDFLoad","AssertPDFMetrics","AssertPDFReady","AssertPDFRequest","AssertPDFResponse","AssertPDFState","AssertPerformanceComplete","AssertPerformanceData","AssertPerformanceError","AssertPerformanceIdle","AssertPerformanceLoad","AssertPerformanceMetrics","AssertPerformanceReady","AssertPerformanceRequest","AssertPerformanceResponse","AssertPerformanceState","AssertPixelComplete","AssertPixelData","AssertPixelError","AssertPixelIdle","AssertPixelLoad","AssertPixelMetrics","AssertPixelReady","AssertPixelRequest","AssertPixelResponse","AssertPixelState","AssertPopupComplete","AssertPopupData","AssertPopupError","AssertPopupIdle","AssertPopupLoad","AssertPopupMetrics","AssertPopupReady","AssertPopupRequest","AssertPopupResponse","AssertPopupState","AssertSecurityComplete","AssertSecurityData","AssertSecurityError","AssertSecurityIdle","AssertSecurityLoad","AssertSecurityMetrics","AssertSecurityReady","AssertSecurityRequest","AssertSecurityResponse","AssertSecurityState","AssertSelected","AssertSessionComplete","AssertSessionData","AssertSessionError","AssertSessionIdle","AssertSessionLoad","AssertSessionMetrics","AssertSessionReady","AssertSessionRequest","AssertSessionResponse","AssertSessionState","AssertShadowDOMComplete","AssertShadowDOMData","AssertShadowDOMError","AssertShadowDOMIdle","AssertShadowDOMLoad","AssertShadowDOMMetrics","AssertShadowDOMReady","AssertShadowDOMRequest","AssertShadowDOMResponse","AssertShadowDOMState","AssertSwipeComplete","AssertSwipeData","AssertSwipeError","AssertSwipeIdle","AssertSwipeLoad","AssertSwipeMetrics","AssertSwipeReady","AssertSwipeRequest","AssertSwipeResponse","AssertSwipeState","AssertTouchComplete","AssertTouchData","AssertTouchError","AssertTouchIdle","AssertTouchLoad","AssertTouchMetrics","AssertTouchReady","AssertTouchRequest","AssertTouchResponse","AssertTouchState","AssertVideoComplete","AssertVideoData","AssertVideoError","AssertVideoIdle","AssertVideoLoad","AssertVideoMetrics","AssertVideoReady","AssertVideoRequest","AssertVideoResponse","AssertVideoState","AssertVisible","AssertVisualComplete","AssertVisualData","AssertVisualError","AssertVisualIdle","AssertVisualLoad","AssertVisualMetrics","AssertVisualReady","AssertVisualRequest","AssertVisualResponse","AssertVisualState","ClearField","Click","ClickAlert","ClickAndHold","CloseTab","CopyText","DoubleClick","DragAndDrop","DragAndDropByOffset","ExecuteScript","ExecuteSQLQuery","GetAttribute","GetCssValue","GetCurrentURL","GetPageTitle","GetText","GoBack","Hover","KeyDown","KeyUp","MaximizeWindow","MinimizeWindow","MockNetworkResponse","Navigate","OpenNewTab","PasteText","PinchToZoom","PressEnter","PressTab","Refresh","Release","RightClick","ScrollDown","ScrollTo","ScrollToCoordinates","ScrollUp","SelectByIndex","SelectByValue","SelectDropdown","SendKeys","Set","SetCheckBoxStatus","SetWindowSize","SwitchDefaultContent","SwitchFrame","SwitchTab","TakeFullPageScreenshot","TouchSwipeLeft","UploadFile","Wait","WaitForTitle","WaitForURL","WaitUntilElementIsClickable","WaitUntilInvisible","WaitUntill","WaitUntillWithtimer","WaitUntilTextPresent"];
const LOCATORS = ['id','name','xpath','css','linkText','partialLinkText','className','tagName', 'accessibilityId', 'iosClassChain', 'androidUIAutomator'];

// Custom Dropdown Component for 300+ Actions
function SearchableActionSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value || '');

  // Keep search in sync if value changes externally
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setSearch(value || ''); }, [value]);

  const filtered = ACTIONS.filter(a => a.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="searchable-select" style={{ position: 'relative' }}>
      <input 
        className="form-input" 
        value={search} 
        onChange={e => { setSearch(e.target.value); setOpen(true); onChange(e.target.value); }} 
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        placeholder="Type action... e.g. web.click" 
        required 
      />
      {open && filtered.length > 0 && (
        <ul style={{ position: 'absolute', bottom: '100%', left: 0, marginBottom: '4px', zIndex: 100, width: '100%', maxHeight: '250px', overflowY: 'auto', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', margin: 0, padding: 0, listStyle: 'none', boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.1)' }}>
          {filtered.slice(0, 50).map(a => (
            <li 
              key={a} 
              onMouseDown={() => { setSearch(a); onChange(a); setOpen(false); }} 
              style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', color: '#0f172a', fontWeight: 500 }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {a}
            </li>
          ))}
          {filtered.length > 50 && <li style={{ padding: '10px 14px', color: '#64748b', fontStyle: 'italic', fontSize: '0.85rem' }}>...and {filtered.length - 50} more. Keep typing.</li>}
        </ul>
      )}
    </div>
  );
}

export default function TestCaseFormView() {
  const { id } = useParams(); const isEdit = !!id; const navigate = useNavigate();
  const [name, setName] = useState(''); const [desc, setDesc] = useState('');
  const [steps, setSteps] = useState([{ actionName: '', locatorType: '', locatorValue: '', testData: '', description: '' }]);
  const [saving, setSaving] = useState(false); const [loaded, setLoaded] = useState(!isEdit);

  useEffect(() => {
    if (isEdit) {
      api(`/api/test-cases/${id}`).then(r => r.json()).then(d => {
        setName(d.testCase.name); setDesc(d.testCase.description || '');
        if (d.steps && d.steps.length > 0) setSteps(d.steps.map(s => ({ actionName: s.actionName || '', locatorType: s.locatorType || '', locatorValue: s.locatorValue || '', testData: s.testData || '', description: s.description || '' })));
        setLoaded(true);
      });
    }
  }, [id, isEdit]);

  const addStep = () => setSteps(p => [...p, { actionName: '', locatorType: '', locatorValue: '', testData: '', description: '' }]);
  const removeStep = (i) => { if (steps.length > 1) setSteps(p => p.filter((_, j) => j !== i)); };
  const updateStep = (i, k, v) => setSteps(p => p.map((s, j) => j === i ? { ...s, [k]: v } : s));

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    const payload = { name, description: desc, steps: steps.map((s, i) => ({ ...s, stepOrder: i + 1 })) };
    const url = isEdit ? `/api/test-cases/${id}` : '/api/test-cases';
    const method = isEdit ? 'PUT' : 'POST';
    const r = await api(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (r.ok) { toast('success', isEdit ? 'Updated!' : 'Created!', `"${name}" with ${steps.length} step(s).`); setTimeout(() => navigate('/test-cases'), 900); }
    else { toast('error', 'Failed'); setSaving(false); }
  };

  if (!loaded) return <div className="page-view"><div className="spinner" style={{ marginTop: 80 }} /></div>;

  return (
    <div className="page-view">
      <PageHeader title={isEdit ? 'Edit Test Case' : 'Create Test Case'} actions={
        <>
          <Link
            to={isEdit ? `/test-cases/studio/edit/${id}` : '/test-cases/studio/create'}
            className="btn btn-primary"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', border: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            🎨 Open in Studio
          </Link>
          <Link to="/test-cases" className="btn btn-ghost">← Back</Link>
        </>
      } />
      <div className="card form-card-wide">
        <div className="card-header">
          <div>
            <h2>📝 {isEdit ? 'Edit' : 'New'} Test Case</h2>
            <p>Define the test scenario and its ordered steps, or use the visual drag-and-drop Studio.</p>
          </div>
          <Link
            to={isEdit ? `/test-cases/studio/edit/${id}` : '/test-cases/studio/create'}
            style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 18px', background:'linear-gradient(135deg,#7c3aed,#5b21b6)', borderRadius:10, color:'#fff', textDecoration:'none', fontSize:'0.84rem', fontWeight:600, boxShadow:'0 2px 10px rgba(124,58,237,0.35)', flexShrink:0 }}
          >
            🎨 Open Studio
          </Link>
        </div>
        <form onSubmit={save}>
          <div className="form-section"><div className="form-section-title">Basic Info</div><div className="form-grid">
            <div className="form-group"><label className="form-label">Test Case Name <span className="req">*</span></label><input className="form-input" placeholder="e.g. Login with valid credentials" value={name} onChange={e => setName(e.target.value)} required /></div>
            <div className="form-group"><label className="form-label">Description</label><input className="form-input" placeholder="What does this test verify?" value={desc} onChange={e => setDesc(e.target.value)} /></div>
          </div></div>

          <div className="step-builder">
            <div className="step-builder-header">
              <div className="step-builder-title">🔬 Test Steps <span className="step-count-pill">{steps.length}</span></div>
              <button type="button" className="btn btn-primary btn-sm" onClick={addStep}>➕ Add Step</button>
            </div>
            <div className="step-list">
              {steps.map((s, i) => (
                <div key={i} className="step-card">
                  <div className="step-num">{i + 1}</div>
                  <div className="step-body">
                    <div className="step-field"><span className="step-field-label">Action *</span><SearchableActionSelect value={s.actionName} onChange={val => updateStep(i, 'actionName', val)} /></div>
                    <div className="step-field"><span className="step-field-label">Locator</span><select value={s.locatorType} onChange={e => updateStep(i, 'locatorType', e.target.value)}><option value="">None</option>{LOCATORS.map(l => <option key={l} value={l}>{l}</option>)}</select></div>
                    <div className="step-field"><span className="step-field-label">Value</span><input placeholder="#submit-btn" value={s.locatorValue} onChange={e => updateStep(i, 'locatorValue', e.target.value)} /></div>
                    <div className="step-field"><span className="step-field-label">Data</span><input placeholder="admin@test.com" value={s.testData} onChange={e => updateStep(i, 'testData', e.target.value)} /></div>
                    <div className="step-field"><span className="step-field-label">Description</span><input placeholder="Step purpose" value={s.description} onChange={e => updateStep(i, 'description', e.target.value)} /></div>
                  </div>
                  <button type="button" className="step-remove-btn" onClick={() => removeStep(i)} disabled={steps.length <= 1}>✕</button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions"><Link to="/test-cases" className="btn btn-ghost">Cancel</Link>
            <button type="submit" className="btn btn-success" disabled={saving}>{saving ? '⏳ Saving…' : `💾 ${isEdit ? 'Update' : 'Save'} (${steps.length} steps)`}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
