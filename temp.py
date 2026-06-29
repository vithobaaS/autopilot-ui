import re

with open('src/pages/testcase/TestStudioView.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace imports
code = code.replace(
    "import { Save, Plus, FileText, Settings, Search, Compass, MousePointer2, Keyboard, CheckCircle, ArrowUpDown, Hourglass, Code } from 'lucide-react';",
    "import { Save, Plus, FileText, Settings, Search, Compass, MousePointer2, Keyboard, CheckCircle, ArrowUpDown, Hourglass, Code, X, GripVertical, ArrowLeft } from 'lucide-react';\nimport { Input } from '@/components/ui/input';\nimport { Button } from '@/components/ui/button';\nimport { Badge } from '@/components/ui/badge';\nimport { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';\nimport { ScrollArea } from '@/components/ui/scroll-area';"
)
code = code.replace("import './TestStudio.css';\n", "")

# Replace styles
code = code.replace('className="ts-root"', 'className="fixed inset-0 flex flex-col bg-background font-sans text-sm text-foreground z-[9999]"')

# topbar
code = code.replace('className="ts-topbar"', 'className="flex items-center gap-3 px-4 h-14 min-h-[56px] bg-background/80 backdrop-blur-md border-b z-10 shrink-0"')
code = code.replace('className="ts-logo"', 'className="flex items-center gap-2 pr-3 border-r mr-1 shrink-0"')
code = code.replace('className="ts-logo-text"', 'className="text-xs font-extrabold tracking-wider text-purple-600 uppercase"')
code = code.replace("<span style={{color:'var(--txt-h)'}}>Pilot</span>", '<span className="text-foreground">Pilot</span>')
code = code.replace('className="ts-badge"', 'className="text-[0.68rem] font-bold tracking-widest uppercase text-purple-600 bg-purple-100 border border-purple-300 rounded-md px-2 py-0.5 shrink-0"')
code = code.replace('className="ts-exit-btn"', 'className="flex items-center px-3 py-1.5 bg-muted hover:bg-muted/80 border rounded-md text-muted-foreground hover:text-foreground text-xs font-medium no-underline cursor-pointer transition-colors shrink-0"')
code = code.replace('className="ts-name-input"', 'className="flex-1 min-w-[180px] bg-background border rounded-md px-3 py-1.5 text-foreground font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"')
code = code.replace('className="ts-desc-input"', 'className="w-[220px] bg-background border rounded-md px-3 py-1.5 text-foreground text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"')
code = code.replace('className="ts-step-counter"', 'className="text-[0.78rem] font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full shrink-0"')
code = code.replace('className="ts-save-btn"', 'className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 border-none rounded-md text-white text-sm font-semibold cursor-pointer transition-transform hover:-translate-y-[1px] shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed shrink-0"')

# body
code = code.replace('className="ts-body"', 'className="flex flex-1 overflow-hidden min-h-0"')

# sidebar
code = code.replace('className="ts-sidebar"', 'className="w-[272px] min-w-[272px] bg-card border-r flex flex-col overflow-hidden"')
code = code.replace('className="ts-sidebar-search-wrap"', 'className="relative p-3 bg-card border-b shrink-0"')
code = code.replace('className="ts-sidebar-search-icon"', 'className="absolute left-6 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none"')
code = code.replace('className="ts-sidebar-search"', 'className="w-full bg-background border rounded-md py-1.5 pr-3 pl-8 text-foreground text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"')
code = code.replace('className="ts-sidebar-scroll"', 'className="flex-1 overflow-y-auto pb-4"')
code = code.replace('className="ts-category"', 'className="px-2.5 pb-1"')
code = code.replace('className="ts-category-label"', 'className="text-[0.66rem] font-bold tracking-widest uppercase text-muted-foreground px-0.5 pt-2.5 pb-1"')

# action block
code = code.replace('className="ts-action-block"', 'className="flex items-center gap-2 px-2.5 py-1.5 mb-0.5 bg-background border rounded-md cursor-grab select-none transition-all hover:bg-muted hover:border-primary hover:shadow-[0_0_12px_rgba(124,58,237,0.15)] hover:-translate-y-[1px] active:opacity-80 active:cursor-grabbing group"')
code = code.replace('className="ts-action-grip"', 'className="text-muted-foreground/40 group-hover:text-primary text-base shrink-0 transition-colors"')
code = re.sub(r'className=	s-action-icon \$\{cat\.color\}', 'className={w-6 h-6 rounded-md flex items-center justify-center text-[0.82rem] shrink-0 }', code)
code = code.replace('className="ts-action-name"', 'className="flex-1 text-xs font-medium text-foreground group-hover:text-primary overflow-hidden text-ellipsis whitespace-nowrap"')
code = code.replace('className="ts-action-tag"', 'className="text-[0.62rem] font-bold tracking-wider px-1.5 py-0.5 rounded shrink-0"')

# canvas
code = code.replace('className="ts-canvas"', 'className="flex-1 flex flex-col overflow-hidden bg-muted/10 min-w-0"')
code = code.replace('className="ts-canvas-toolbar"', 'className="flex items-center gap-2.5 px-4 py-2.5 bg-card border-b shrink-0"')
code = code.replace('className="ts-canvas-title"', 'className="text-[0.76rem] font-bold tracking-wider uppercase text-muted-foreground"')
code = code.replace('className="ts-canvas-count"', 'className="bg-muted text-primary text-xs font-bold px-2 py-0.5 rounded-full"')
code = code.replace('className="ts-add-btn"', 'className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-card border rounded-md text-foreground text-sm font-semibold cursor-pointer transition-all hover:bg-muted hover:border-primary hover:text-primary"')

code = re.sub(r'className=	s-canvas-body\$\{isDragOver \? \' drag-active\' : \'\'\}', 'className={lex-1 overflow-y-auto p-4 min-h-0 transition-colors }', code)

code = code.replace('className="ts-empty-canvas"', 'className="flex flex-col items-center justify-center min-h-[260px] border-2 border-dashed rounded-xl bg-card text-muted-foreground text-center p-10 transition-all"')
code = code.replace('className="ts-empty-icon"', 'className="text-4xl mb-2 opacity-50"')
code = code.replace('className="ts-empty-title"', 'className="text-sm font-semibold mb-1"')
code = code.replace('className="ts-empty-sub"', 'className="text-xs opacity-70"')

# step card
code = re.sub(r'className=	s-step-card\$\{selected \? \' selected\' : \'\'\}\$\{dragHandlers.isDragOver \? \' drag-over\' : \'\'\}', 'className={lex items-center gap-2.5 px-3.5 py-2.5 bg-card border rounded-xl cursor-pointer transition-all mb-1.5 relative shadow-sm hover:border-primary hover:shadow-[0_2px_8px_rgba(124,58,237,0.1)] group  }', code)

code = code.replace('className="ts-step-grip"', 'className="text-muted-foreground/40 cursor-grab text-base shrink-0 group-hover:text-muted-foreground"')
code = code.replace('className="ts-step-num"', 'className="w-5 h-5 rounded-md bg-muted text-primary text-[0.68rem] font-bold flex items-center justify-center shrink-0"')
code = re.sub(r'className=	s-step-icon \$\{meta\.color\}', 'className={w-7 h-7 rounded-md flex items-center justify-center text-sm shrink-0 }', code)
code = code.replace('className="ts-step-info"', 'className="flex-1 min-w-0"')
code = code.replace('className="ts-step-action"', 'className="text-sm font-semibold text-foreground overflow-hidden text-ellipsis whitespace-nowrap"')
code = code.replace('className="ts-step-detail"', 'className="text-xs text-muted-foreground mt-px overflow-hidden text-ellipsis whitespace-nowrap"')
code = code.replace('className="ts-step-delete"', 'className="p-1.5 bg-transparent border-none text-muted-foreground/50 cursor-pointer rounded-md text-sm transition-all opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"')

code = re.sub(r'className=	s-drop-more\$\{isDragOver \? \' drag-active\' : \'\'\}', 'className={mt-1 p-3 border-2 border-dashed rounded-lg text-center text-muted-foreground text-xs transition-all }', code)

# config
code = code.replace('className="ts-config"', 'className="w-[300px] min-w-[300px] bg-card border-l flex flex-col overflow-hidden"')
code = code.replace('className="ts-config-header"', 'className="px-4 pt-3.5 pb-3 border-b bg-background shrink-0"')
code = code.replace('className="ts-config-label"', 'className="text-[0.68rem] font-bold tracking-widest uppercase text-muted-foreground mb-1 flex items-center gap-1.5"')
code = code.replace('className="ts-config-title"', 'className="text-sm font-bold text-foreground flex items-center gap-2"')
code = code.replace('className="ts-config-empty"', 'className="flex-1 flex flex-col items-center justify-center p-10 text-center"')
code = code.replace('className="ts-config-body"', 'className="flex-1 overflow-y-auto px-4 py-3.5 min-h-0 space-y-3.5"')
code = code.replace('className="ts-field"', 'className="space-y-1.5"')
code = code.replace('className="ts-field-label"', 'className="block text-[0.7rem] font-bold tracking-wider uppercase text-muted-foreground"')
code = code.replace('className="ts-divider"', 'className="border-0 border-t my-3.5"')

code = code.replace('className="ts-input"', 'className="w-full bg-background border rounded-md px-3 py-2 text-foreground text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50"')
code = code.replace('className="ts-dropdown"', 'className="absolute bottom-[calc(100%+4px)] left-0 right-0 bg-card border rounded-lg max-h-[220px] overflow-y-auto z-[100] shadow-lg py-1"')
code = code.replace('className="ts-dropdown-item"', 'className="px-3 py-2 text-sm text-foreground cursor-pointer border-b last:border-0 hover:bg-muted hover:text-primary"')
code = code.replace('className="ts-dropdown-more"', 'className="px-3 py-1.5 text-xs text-muted-foreground italic"')

# tags
code = re.sub(
    r'const ACTION_CATEGORIES = \[[\s\S]*?\];',
    '''const ACTION_CATEGORIES = [
  { label:'Navigation', color:'bg-blue-500/10 text-blue-600', icon:<Compass size={16}/>, tag:'NAV', tagStyle:{background:'#dbeafe',color:'#1d4ed8'}, actions:['Navigate','GoBack','Refresh','GetCurrentURL','GetPageTitle','OpenNewTab','CloseTab','SwitchTab'] },
  { label:'Interaction',color:'bg-emerald-500/10 text-emerald-600', icon:<MousePointer2 size={16}/>, tag:'ACT', tagStyle:{background:'#d1fae5',color:'#065f46'}, actions:['Click','DoubleClick','RightClick','ClickAndHold','Hover','DragAndDrop','DragAndDropByOffset','Release','ClickAlert','PinchToZoom','TouchSwipeLeft'] },
  { label:'Input',      color:'bg-amber-500/10 text-amber-600', icon:<Keyboard size={16}/>, tag:'INP', tagStyle:{background:'#fef3c7',color:'#92400e'}, actions:['Set','SendKeys','ClearField','PasteText','CopyText','PressEnter','PressTab','KeyDown','KeyUp','SelectDropdown','SelectByIndex','SelectByValue','SetCheckBoxStatus','UploadFile'] },
  { label:'Assertions', color:'bg-red-500/10 text-red-600',   icon:<CheckCircle size={16}/>, tag:'CHK', tagStyle:{background:'#fee2e2',color:'#991b1b'}, actions:['VerifyText','VerifyURL','VerifyElementExists','VerifyElementVisible','VerifyElementHidden','VerifyAttribute','VerifyTitle','AssertEquals','AssertContains','AssertVisible','AssertNotVisible','AssertEnabled','AssertDisabled','AssertSelected','AssertAttributeValue'] },
  { label:'Scroll',     color:'bg-cyan-500/10 text-cyan-600',   icon:<ArrowUpDown size={16}/>, tag:'SCR', tagStyle:{background:'#cffafe',color:'#155e75'}, actions:['ScrollDown','ScrollUp','ScrollTo','ScrollToCoordinates'] },
  { label:'Wait',       color:'bg-purple-500/10 text-purple-600', icon:<Hourglass size={16}/>, tag:'WAIT', tagStyle:{background:'#ede9fe',color:'#5b21b6'}, actions:['Wait','WaitUntill','WaitUntillWithtimer','WaitUntilElementIsClickable','WaitUntilInvisible','WaitUntilTextPresent','WaitForURL','WaitForTitle'] },
  { label:'Data & Script',color:'bg-pink-500/10 text-pink-600', icon:<Code size={16}/>, tag:'ADV', tagStyle:{background:'#fce7f3',color:'#9d174d'}, actions:['ExecuteScript','ExecuteSQLQuery','GetAttribute','GetText','GetCssValue','MockNetworkResponse','TakeFullPageScreenshot','SwitchFrame','SwitchDefaultContent','SetWindowSize','MaximizeWindow','MinimizeWindow','AcceptCookies'] },
];''',
    code
)

with open('src/pages/testcase/TestStudioView.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

