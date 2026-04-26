"use client";
import { useState, useEffect, useRef } from 'react';

const FILTERS = ['All', 'Active', 'Done', 'Scheduled'];
const MOTIVATIONAL_QUOTES = [
  "Small steps every day.",
  "Done is better than perfect.",
  "One task at a time.",
  "You've got this 💪",
  "Focus. Flow. Finish.",
  "Plan it. Do it. Done.",
];
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function getMontDays(y, m) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDay(y, m) { return new Date(y, m, 1).getDay(); }

function formatDate(date) {
  if (!date) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const tom = new Date(today); tom.setDate(tom.getDate() + 1);
  const d = new Date(date); d.setHours(0,0,0,0);
  if (d.getTime() === today.getTime()) return 'Today';
  if (d.getTime() === tom.getTime()) return 'Tomorrow';
  return `${MONTHS[d.getMonth()].slice(0,3)} ${d.getDate()}`;
}
function formatTime(t) {
  if (!t) return null;
  const [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${ap}`;
}

/* ── Mini Calendar ─────────────────────────────────────── */
function MiniCalendar({ selected, onSelect, onClose }) {
  const today = new Date();
  const initYear = selected ? new Date(selected).getFullYear() : today.getFullYear();
  const initMonth = selected ? new Date(selected).getMonth() : today.getMonth();
  const [vy, setVy] = useState(initYear);
  const [vm, setVm] = useState(initMonth);

  const days = getMontDays(vy, vm);
  const first = getFirstDay(vy, vm);
  const cells = [...Array(first).fill(null), ...Array.from({length: days}, (_, i) => i + 1)];

  const prev = () => { const d = new Date(vy, vm - 1); setVy(d.getFullYear()); setVm(d.getMonth()); };
  const next = () => { const d = new Date(vy, vm + 1); setVy(d.getFullYear()); setVm(d.getMonth()); };

  const selDate = selected ? new Date(selected) : null;
  const isSel = (day) => selDate && selDate.getFullYear()===vy && selDate.getMonth()===vm && selDate.getDate()===day;
  const isToday = (day) => today.getFullYear()===vy && today.getMonth()===vm && today.getDate()===day;

  return (
    <div className="cal-popup">
      {/* Header */}
      <div className="cp-head">
        <button className="cp-nav" onClick={prev}>‹</button>
        <span className="cp-title">{MONTHS[vm]} {vy}</span>
        <button className="cp-nav" onClick={next}>›</button>
      </div>
      {/* Day labels */}
      <div className="cp-daynames">
        {DAYS.map(d => <span key={d}>{d}</span>)}
      </div>
      {/* Grid */}
      <div className="cp-grid">
        {cells.map((day, i) => (
          <button
            key={i}
            disabled={!day}
            onClick={() => { onSelect(new Date(vy, vm, day)); }}
            className={[
              'cp-cell',
              !day ? 'cp-empty' : '',
              isToday(day) ? 'cp-today' : '',
              isSel(day) ? 'cp-sel' : '',
            ].join(' ')}
          >{day || ''}</button>
        ))}
      </div>
      {/* Footer */}
      <div className="cp-foot">
        <button className="cp-btn-today" onClick={() => { onSelect(new Date()); }}>Today</button>
        <button className="cp-btn-clear" onClick={() => { onSelect(null); onClose(); }}>Clear</button>
      </div>
    </div>
  );
}

/* ── Time Picker ───────────────────────────────────────── */
function TimePicker({ value, onChange, onClose }) {
  const parseH = (v) => { if (!v) return 9; const h = parseInt(v); return h > 12 ? h - 12 : h === 0 ? 12 : h; };
  const parseM = (v) => v ? parseInt(v.split(':')[1]) : 0;
  const parseAP = (v) => { if (!v) return 'AM'; return parseInt(v) >= 12 ? 'PM' : 'AM'; };

  const [hour, setHour] = useState(() => parseH(value));
  const [min, setMin] = useState(() => parseM(value));
  const [ampm, setAmpm] = useState(() => parseAP(value));

  const emit = (h, m, ap) => {
    let h24 = h;
    if (ap === 'PM' && h !== 12) h24 = h + 12;
    if (ap === 'AM' && h === 12) h24 = 0;
    onChange(`${String(h24).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
  };

  const incH = () => { const h = hour === 12 ? 1 : hour + 1; setHour(h); emit(h, min, ampm); };
  const decH = () => { const h = hour === 1 ? 12 : hour - 1; setHour(h); emit(h, min, ampm); };
  const incM = () => { const m = (min + 5) % 60; setMin(m); emit(hour, m, ampm); };
  const decM = () => { const m = (min - 5 + 60) % 60; setMin(m); emit(hour, m, ampm); };
  const toggleAP = (ap) => { setAmpm(ap); emit(hour, min, ap); };

  return (
    <div className="tp-popup">
      <p className="tp-label">Set a time</p>
      <div className="tp-body">
        {/* Hour */}
        <div className="tp-col">
          <button className="tp-arr" onClick={incH}>▲</button>
          <span className="tp-num">{String(hour).padStart(2,'0')}</span>
          <button className="tp-arr" onClick={decH}>▼</button>
        </div>
        <span className="tp-colon">:</span>
        {/* Minute */}
        <div className="tp-col">
          <button className="tp-arr" onClick={incM}>▲</button>
          <span className="tp-num">{String(min).padStart(2,'0')}</span>
          <button className="tp-arr" onClick={decM}>▼</button>
        </div>
        {/* AM/PM */}
        <div className="tp-ampm">
          {['AM','PM'].map(ap => (
            <button key={ap} onClick={() => toggleAP(ap)} className={`tp-ap ${ampm === ap ? 'active' : ''}`}>{ap}</button>
          ))}
        </div>
      </div>
      <button className="tp-done" onClick={onClose}>Done</button>
    </div>
  );
}

/* ── Main App ──────────────────────────────────────────── */
export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [quote] = useState(() => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  const [deletingId, setDeletingId] = useState(null);

  // scheduling
  const [selDate, setSelDate] = useState(null);   // Date object or null
  const [selTime, setSelTime] = useState(null);   // "HH:MM" string or null
  const [showCal, setShowCal] = useState(false);
  const [showTime, setShowTime] = useState(false);

  // views
  const [activeTab, setActiveTab] = useState('tasks');
  const [calNav, setCalNav] = useState(new Date());

  const scheduleRef = useRef(null);

  // Close popups on outside click
  useEffect(() => {
    const fn = (e) => {
      if (scheduleRef.current && !scheduleRef.current.contains(e.target)) {
        setShowCal(false);
        setShowTime(false);
      }
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  useEffect(() => {
    fetch('/api/todos')
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => setTodos(d))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const addTodo = async () => {
    if (!input.trim()) return;
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: input, dueDate: selDate ? selDate.toISOString() : null, dueTime: selTime || null }),
      });
      const t = await res.json();
      setTodos(p => [t, ...p]);
      setInput(''); setSelDate(null); setSelTime(null);
      setShowCal(false); setShowTime(false);
    } catch (e) { console.error(e); }
  };

  const deleteTodo = async (id) => {
    setDeletingId(id);
    try { await fetch(`/api/todos/${id}`, { method: 'DELETE' }); setTodos(p => p.filter(t => t._id !== id)); }
    catch (e) { console.error(e); } finally { setDeletingId(null); }
  };

  const toggleTodo = async (todo) => {
    try {
      const res = await fetch(`/api/todos/${todo._id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed }),
      });
      const updated = res.ok ? await res.json() : { ...todo, completed: !todo.completed };
      setTodos(p => p.map(t => t._id === todo._id ? updated : t));
    } catch { setTodos(p => p.map(t => t._id === todo._id ? { ...t, completed: !t.completed } : t)); }
  };

  const clearCompleted = () => todos.filter(t => t.completed).forEach(t => deleteTodo(t._id));

  const isOverdue = (t) => {
    if (!t.dueDate || t.completed) return false;
    const due = new Date(t.dueDate);
    if (t.dueTime) { const [h,m] = t.dueTime.split(':').map(Number); due.setHours(h,m,0,0); } else due.setHours(23,59,59);
    return due < new Date();
  };

  const filtered = todos.filter(t => {
    if (filter === 'Active') return !t.completed;
    if (filter === 'Done') return t.completed;
    if (filter === 'Scheduled') return !!t.dueDate;
    return true;
  });

  const doneCount = todos.filter(t => t.completed).length;
  const schedCount = todos.filter(t => t.dueDate).length;
  const total = todos.length;
  const progress = total === 0 ? 0 : Math.round((doneCount / total) * 100);
  const today = new Date();

  // Calendar full view helpers
  const cvY = calNav.getFullYear(), cvM = calNav.getMonth();
  const cvCells = [...Array(getFirstDay(cvY, cvM)).fill(null), ...Array.from({length: getMontDays(cvY, cvM)}, (_,i) => i+1)];
  const todosOn = (y, m, d) => todos.filter(t => { if (!t.dueDate) return false; const dt = new Date(t.dueDate); return dt.getFullYear()===y && dt.getMonth()===m && dt.getDate()===d; });

  return (
    <div className="root">
      <div className="card">

        {/* ── Header ── */}
        <div className="hdr">
          <div className="hdr-top">
            <span className="hdr-star">✦</span>
            <h1 className="hdr-title">to do.</h1>
            <div className="view-toggle">
              <button className={`vt-btn ${activeTab==='tasks'?'vt-active':''}`} onClick={()=>setActiveTab('tasks')}>Tasks</button>
              <button className={`vt-btn ${activeTab==='calendar'?'vt-active':''}`} onClick={()=>setActiveTab('calendar')}>
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><rect x=".5" y="1.5" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M.5 4.5h10M3.5 0v3M7.5 0v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                Calendar
              </button>
            </div>
          </div>
          <p className="hdr-quote">{quote}</p>
        </div>

        {/* ── Progress (tasks view only) ── */}
        {total > 0 && activeTab === 'tasks' && (
          <div className="prog-wrap">
            <div className="prog-row"><span>{doneCount} of {total} done</span><span className="prog-pct">{progress}%</span></div>
            <div className="prog-track"><div className="prog-bar" style={{width:`${progress}%`}} /></div>
          </div>
        )}

        {/* ════════ TASKS VIEW ════════ */}
        {activeTab === 'tasks' && (<>

          {/* Input + schedule */}
          <div className="inp-section">
            {/* Text input row */}
            <div className="inp-row">
              <input
                value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addTodo()}
                placeholder="Add a new task…" className="inp"
              />
              <button onClick={addTodo} disabled={!input.trim()} className="inp-btn" aria-label="Add">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>
              </button>
            </div>

            {/* Schedule chips — all popups anchor from this div */}
            <div className="sched-wrap" ref={scheduleRef}>
              <div className="sched-chips">
                {/* Date chip */}
                <button
                  className={`chip ${selDate?'chip-on':''}`}
                  onClick={() => { setShowCal(v=>!v); setShowTime(false); }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x=".5" y="1.5" width="11" height="9.5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M.5 5h11M4 0v3M8 0v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  {selDate ? formatDate(selDate) : 'Set date'}
                </button>

                {/* Time chip — only visible when date is set */}
                {selDate && (
                  <button
                    className={`chip ${selTime?'chip-on':''}`}
                    onClick={() => { setShowTime(v=>!v); setShowCal(false); }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5.5" stroke="currentColor" strokeWidth="1.2"/><path d="M6 3v3l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                    {selTime ? formatTime(selTime) : 'Set time'}
                  </button>
                )}

                {/* Clear chip */}
                {selDate && (
                  <button className="chip chip-x" onClick={()=>{ setSelDate(null); setSelTime(null); setShowCal(false); setShowTime(false); }}>✕ Clear</button>
                )}
              </div>

              {/* Floating calendar popup */}
              {showCal && (
                <MiniCalendar
                  selected={selDate}
                  onSelect={(d) => { setSelDate(d); setShowCal(false); }}
                  onClose={() => setShowCal(false)}
                />
              )}

              {/* Floating time picker */}
              {showTime && (
                <TimePicker
                  value={selTime}
                  onChange={(t) => setSelTime(t)}
                  onClose={() => setShowTime(false)}
                />
              )}
            </div>
          </div>

          {/* Filter tabs */}
          <div className="filters">
            {FILTERS.map(f => (
              <button key={f} onClick={()=>setFilter(f)} className={`ftab ${filter===f?'ftab-on':''}`}>
                {f}
                {f==='All' && total>0 && <span className="badge">{total}</span>}
                {f==='Active' && <span className="badge">{todos.filter(t=>!t.completed).length}</span>}
                {f==='Done' && doneCount>0 && <span className="badge badge-g">{doneCount}</span>}
                {f==='Scheduled' && schedCount>0 && <span className="badge badge-b">{schedCount}</span>}
              </button>
            ))}
          </div>

          {/* Todo list */}
          <ul className="list">
            {loading ? (
              <li className="empty"><span className="spinner"/><span>Loading…</span></li>
            ) : filtered.length === 0 ? (
              <li className="empty">
                <span style={{fontSize:'1.7rem'}}>{filter==='Done'?'🎉':filter==='Scheduled'?'📅':'🌿'}</span>
                <span>{filter==='Done'?'Nothing completed yet.':filter==='Scheduled'?'No scheduled tasks.':'Add a task above!'}</span>
              </li>
            ) : filtered.map(todo => (
              <li key={todo._id} className={`item ${todo.completed?'item-done':''} ${isOverdue(todo)?'item-od':''} ${deletingId===todo._id?'item-del':''}`}>
                <button className={`cb ${todo.completed?'cb-on':''}`} onClick={()=>toggleTodo(todo)}>
                  {todo.completed && <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1.5 5.5l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </button>
                <div className="item-body">
                  <span className="item-text">{todo.task}</span>
                  {(todo.dueDate || todo.dueTime) && (
                    <div className={`item-meta ${isOverdue(todo)?'item-meta-od':''}`}>
                      {todo.dueDate && (
                        <span className="meta-chip">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x=".5" y="1" width="9" height="8.5" rx="1.2" stroke="currentColor" strokeWidth="1"/><path d="M.5 3.5h9M3 0v2M7 0v2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>
                          {formatDate(new Date(todo.dueDate))}
                        </span>
                      )}
                      {todo.dueTime && (
                        <span className="meta-chip">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="4.5" stroke="currentColor" strokeWidth="1"/><path d="M5 2.5v2.5l1.5 1" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>
                          {formatTime(todo.dueTime)}
                        </span>
                      )}
                      {isOverdue(todo) && <span className="od-pill">Overdue</span>}
                    </div>
                  )}
                </div>
                <button className="del-btn" onClick={()=>deleteTodo(todo._id)} disabled={deletingId===todo._id}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 1.5l10 10M11.5 1.5l-10 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                </button>
              </li>
            ))}
          </ul>

          {doneCount > 0 && (
            <div className="footer">
              <button className="clear-btn" onClick={clearCompleted}>Clear completed ({doneCount})</button>
            </div>
          )}
        </>)}

        {/* ════════ CALENDAR VIEW ════════ */}
        {activeTab === 'calendar' && (
          <div className="cv">
            <div className="cv-nav">
              <button className="cp-nav" onClick={()=>setCalNav(d=>{ const n=new Date(d); n.setMonth(n.getMonth()-1); return n; })}>‹</button>
              <span className="cv-month">{MONTHS[cvM]} {cvY}</span>
              <button className="cp-nav" onClick={()=>setCalNav(d=>{ const n=new Date(d); n.setMonth(n.getMonth()+1); return n; })}>›</button>
            </div>
            <div className="cv-dayrow">{DAYS.map(d=><span key={d}>{d}</span>)}</div>
            <div className="cv-grid">
              {cvCells.map((day, i) => {
                if (!day) return <div key={i} className="cv-cell cv-empty"/>;
                const dt = todosOn(cvY, cvM, day);
                const isToday = today.getFullYear()===cvY && today.getMonth()===cvM && today.getDate()===day;
                return (
                  <div key={i} className={`cv-cell ${isToday?'cv-today':''} ${dt.length>0?'cv-has':''}`}>
                    <span className={`cv-num ${isToday?'cv-num-today':''}`}>{day}</span>
                    {dt.slice(0,2).map(t=>(
                      <div key={t._id} className={`cv-dot ${t.completed?'cv-dot-g':''}${isOverdue(t)?' cv-dot-r':''}`} title={t.task}>
                        {t.task.length>8?t.task.slice(0,8)+'…':t.task}
                      </div>
                    ))}
                    {dt.length>2 && <div className="cv-more">+{dt.length-2}</div>}
                  </div>
                );
              })}
            </div>

            {/* Upcoming section */}
            <div className="upcoming">
              <p className="up-label">Upcoming</p>
              {todos.filter(t=>t.dueDate&&!t.completed).sort((a,b)=>new Date(a.dueDate)-new Date(b.dueDate)).slice(0,5).map(t=>(
                <div key={t._id} className={`up-item ${isOverdue(t)?'up-od':''}`}>
                  <div className={`up-dot ${isOverdue(t)?'up-dot-r':''}`}/>
                  <div className="up-info">
                    <span className="up-task">{t.task}</span>
                    <span className="up-date">{formatDate(new Date(t.dueDate))}{t.dueTime&&` · ${formatTime(t.dueTime)}`}</span>
                  </div>
                  {isOverdue(t) && <span className="od-pill">Late</span>}
                </div>
              ))}
              {todos.filter(t=>t.dueDate&&!t.completed).length===0 && (
                <p className="up-empty">No upcoming scheduled tasks.</p>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}