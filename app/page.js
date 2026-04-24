"use client";
import { useState, useEffect, useRef } from 'react';

const FILTERS = ['All', 'Active', 'Done', 'Scheduled'];

const MOTIVATIONAL_QUOTES = [
  "Small steps every day.",
  "Done is better than perfect.",
  "One task at a time.",
  "You've got this.",
  "Focus. Flow. Finish.",
  "Plan it. Do it. Done.",
];

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function getMontDays(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDay(year, month) {
  return new Date(year, month, 1).getDay();
}

function MiniCalendar({ selected, onSelect, onClose }) {
  const today = new Date();
  const [view, setView] = useState({
    year: selected ? selected.getFullYear() : today.getFullYear(),
    month: selected ? selected.getMonth() : today.getMonth(),
  });
  const totalDays = getMontDays(view.year, view.month);
  const firstDay = getFirstDay(view.year, view.month);
  const cells = Array(firstDay).fill(null).concat(
    Array.from({ length: totalDays }, (_, i) => i + 1)
  );
  const prev = () => setView(v => { const d = new Date(v.year, v.month - 1); return { year: d.getFullYear(), month: d.getMonth() }; });
  const next = () => setView(v => { const d = new Date(v.year, v.month + 1); return { year: d.getFullYear(), month: d.getMonth() }; });
  const isSelected = (day) => selected && selected.getFullYear() === view.year && selected.getMonth() === view.month && selected.getDate() === day;
  const isToday = (day) => today.getFullYear() === view.year && today.getMonth() === view.month && today.getDate() === day;
  return (
    <div className="cal-popup" onClick={e => e.stopPropagation()}>
      <div className="cal-header">
        <button className="cal-nav" onClick={prev}>‹</button>
        <span className="cal-month-label">{MONTHS[view.month]} {view.year}</span>
        <button className="cal-nav" onClick={next}>›</button>
      </div>
      <div className="cal-grid-head">{DAYS.map(d => <span key={d}>{d}</span>)}</div>
      <div className="cal-grid">
        {cells.map((day, i) => (
          <button key={i} className={`cal-day ${!day ? 'empty' : ''} ${isToday(day) ? 'today' : ''} ${isSelected(day) ? 'selected' : ''}`}
            onClick={() => { if (!day) return; onSelect(new Date(view.year, view.month, day)); }} disabled={!day}>
            {day || ''}
          </button>
        ))}
      </div>
      <div className="cal-footer">
        <button className="cal-today-btn" onClick={() => { onSelect(today); setView({ year: today.getFullYear(), month: today.getMonth() }); }}>Today</button>
        <button className="cal-clear-btn" onClick={() => { onSelect(null); onClose(); }}>Clear</button>
      </div>
    </div>
  );
}

function TimePicker({ value, onChange }) {
  const initH = value ? parseInt(value.split(':')[0]) : 9;
  const initM = value ? parseInt(value.split(':')[1]) : 0;
  const [hour, setHour] = useState(initH > 12 ? initH - 12 : initH === 0 ? 12 : initH);
  const [min, setMin] = useState(initM);
  const [ampm, setAmpm] = useState(initH >= 12 ? 'PM' : 'AM');
  const update = (h, m, ap) => {
    let h24 = h;
    if (ap === 'PM' && h !== 12) h24 = h + 12;
    if (ap === 'AM' && h === 12) h24 = 0;
    onChange(`${String(h24).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
  };
  return (
    <div className="time-picker">
      <div className="time-col">
        <button className="time-arr" onClick={() => { const h = hour === 12 ? 1 : hour + 1; setHour(h); update(h, min, ampm); }}>▲</button>
        <span className="time-val">{String(hour).padStart(2,'0')}</span>
        <button className="time-arr" onClick={() => { const h = hour === 1 ? 12 : hour - 1; setHour(h); update(h, min, ampm); }}>▼</button>
      </div>
      <span className="time-sep">:</span>
      <div className="time-col">
        <button className="time-arr" onClick={() => { const m = (min + 5) % 60; setMin(m); update(hour, m, ampm); }}>▲</button>
        <span className="time-val">{String(min).padStart(2,'0')}</span>
        <button className="time-arr" onClick={() => { const m = (min - 5 + 60) % 60; setMin(m); update(hour, m, ampm); }}>▼</button>
      </div>
      <div className="ampm-toggle">
        {['AM','PM'].map(a => (
          <button key={a} className={`ampm-btn ${ampm === a ? 'active' : ''}`} onClick={() => { setAmpm(a); update(hour, min, a); }}>{a}</button>
        ))}
      </div>
    </div>
  );
}

function formatDate(date) {
  if (!date) return null;
  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return `${MONTHS[date.getMonth()].slice(0,3)} ${date.getDate()}`;
}
function formatTime(t) {
  if (!t) return null;
  const [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2,'0')} ${ap}`;
}

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [quote] = useState(() => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  const [deletingId, setDeletingId] = useState(null);
  const [showCal, setShowCal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks');
  const [calViewDate, setCalViewDate] = useState(new Date());
  const calRef = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (calRef.current && !calRef.current.contains(e.target)) {
        setShowCal(false); setShowTimePicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    fetch('/api/todos')
      .then(res => { if (!res.ok) throw new Error("Backend not reached"); return res.json(); })
      .then(data => setTodos(data))
      .catch(err => console.error("Fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  const addTodo = async () => {
    if (!input.trim()) return;
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: input, dueDate: selectedDate ? selectedDate.toISOString() : null, dueTime: selectedTime || null })
      });
      const newTodo = await res.json();
      setTodos(prev => [newTodo, ...prev]);
      setInput(""); setSelectedDate(null); setSelectedTime(null);
      setShowCal(false); setShowTimePicker(false);
    } catch (err) { console.error("Add error:", err); }
  };

  const deleteTodo = async (id) => {
    setDeletingId(id);
    try { await fetch(`/api/todos/${id}`, { method: 'DELETE' }); setTodos(prev => prev.filter(t => t._id !== id)); }
    catch (err) { console.error("Delete error:", err); }
    finally { setDeletingId(null); }
  };

  const toggleTodo = async (todo) => {
    try {
      const res = await fetch(`/api/todos/${todo._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ completed: !todo.completed }) });
      if (res.ok) { const updated = await res.json(); setTodos(prev => prev.map(t => t._id === todo._id ? updated : t)); }
      else { setTodos(prev => prev.map(t => t._id === todo._id ? { ...t, completed: !t.completed } : t)); }
    } catch { setTodos(prev => prev.map(t => t._id === todo._id ? { ...t, completed: !t.completed } : t)); }
  };

  const clearCompleted = () => todos.filter(t => t.completed).forEach(t => deleteTodo(t._id));

  const isOverdue = (todo) => {
    if (!todo.dueDate || todo.completed) return false;
    const due = new Date(todo.dueDate);
    const now = new Date();
    if (todo.dueTime) { const [h, m] = todo.dueTime.split(':').map(Number); due.setHours(h, m, 0, 0); return due < now; }
    due.setHours(23, 59, 59); return due < now;
  };

  const filtered = todos.filter(t => {
    if (filter === 'Active') return !t.completed;
    if (filter === 'Done') return t.completed;
    if (filter === 'Scheduled') return !!t.dueDate;
    return true;
  });

  const doneCount = todos.filter(t => t.completed).length;
  const scheduledCount = todos.filter(t => t.dueDate).length;
  const totalCount = todos.length;
  const progress = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);
  const today = new Date();

  const todosOnDay = (year, month, day) => todos.filter(t => {
    if (!t.dueDate) return false;
    const d = new Date(t.dueDate);
    return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
  });

  const calTotalDays = getMontDays(calViewDate.getFullYear(), calViewDate.getMonth());
  const calFirstDay = getFirstDay(calViewDate.getFullYear(), calViewDate.getMonth());
  const calCells = Array(calFirstDay).fill(null).concat(Array.from({ length: calTotalDays }, (_, i) => i + 1));

  return (
    <div className="todo-root">
      <div className="todo-card">

        {/* Header */}
        <div className="todo-header">
          <div className="todo-header-top">
            <span className="todo-icon">✦</span>
            <h1 className="todo-title">to do.</h1>
            <div className="todo-tab-switcher">
              <button className={`tab-pill ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>Tasks</button>
              <button className={`tab-pill ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style={{marginRight:'4px',verticalAlign:'middle'}}>
                  <rect x=".5" y="1.5" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M.5 4.5h10M3.5 0v3M7.5 0v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                Calendar
              </button>
            </div>
          </div>
          <p className="todo-quote">{quote}</p>
        </div>

        {/* Progress */}
        {totalCount > 0 && activeTab === 'tasks' && (
          <div className="todo-progress-wrap">
            <div className="todo-progress-label">
              <span>{doneCount} of {totalCount} done</span>
              <span className="todo-progress-pct">{progress}%</span>
            </div>
            <div className="todo-progress-track">
              <div className="todo-progress-bar" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* ═══ TASKS VIEW ═══ */}
        {activeTab === 'tasks' && (<>
          <div className="todo-input-section">
            <div className="todo-input-row">
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTodo()}
                placeholder="Add a new task…" className="todo-input" />
              <button onClick={addTodo} disabled={!input.trim()} className="todo-add-btn" aria-label="Add task">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="schedule-row" ref={calRef}>
              <button className={`schedule-chip ${selectedDate ? 'active' : ''}`} onClick={() => { setShowCal(v => !v); setShowTimePicker(false); }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <rect x="1" y="2.5" width="11" height="9.5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M1 5.5h11M4.5 1v3M8.5 1v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                {selectedDate ? formatDate(selectedDate) : 'Set date'}
              </button>
              {selectedDate && (
                <button className={`schedule-chip ${selectedTime ? 'active' : ''}`} onClick={() => { setShowTimePicker(v => !v); setShowCal(false); }}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M6.5 3.5v3l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  {selectedTime ? formatTime(selectedTime) : 'Set time'}
                </button>
              )}
              {selectedDate && (
                <button className="schedule-chip clear" onClick={() => { setSelectedDate(null); setSelectedTime(null); setShowCal(false); setShowTimePicker(false); }}>✕</button>
              )}
              {showCal && <MiniCalendar selected={selectedDate} onSelect={(d) => { setSelectedDate(d); if (d) setShowCal(false); }} onClose={() => setShowCal(false)} />}
              {showTimePicker && (
                <div className="time-popup" onClick={e => e.stopPropagation()}>
                  <p className="time-popup-label">Pick a time</p>
                  <TimePicker value={selectedTime} onChange={(t) => setSelectedTime(t)} />
                  <button className="time-done-btn" onClick={() => setShowTimePicker(false)}>Done</button>
                </div>
              )}
            </div>
          </div>

          <div className="todo-filters">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`todo-filter-btn ${filter === f ? 'active' : ''}`}>
                {f}
                {f === 'All' && totalCount > 0 && <span className="todo-badge">{totalCount}</span>}
                {f === 'Active' && <span className="todo-badge">{todos.filter(t => !t.completed).length}</span>}
                {f === 'Done' && doneCount > 0 && <span className="todo-badge done">{doneCount}</span>}
                {f === 'Scheduled' && scheduledCount > 0 && <span className="todo-badge sched">{scheduledCount}</span>}
              </button>
            ))}
          </div>

          <ul className="todo-list">
            {loading ? (
              <li className="todo-empty"><span className="todo-spinner" /><span>Loading tasks…</span></li>
            ) : filtered.length === 0 ? (
              <li className="todo-empty">
                <span className="todo-empty-icon">{filter === 'Done' ? '🎉' : filter === 'Scheduled' ? '📅' : '🌿'}</span>
                <span>{filter === 'Done' ? 'Nothing completed yet.' : filter === 'Scheduled' ? 'No scheduled tasks.' : 'All clear! Add a task above.'}</span>
              </li>
            ) : (
              filtered.map(todo => (
                <li key={todo._id} className={`todo-item ${todo.completed ? 'completed' : ''} ${isOverdue(todo) ? 'overdue' : ''} ${deletingId === todo._id ? 'deleting' : ''}`}>
                  <button className={`todo-checkbox ${todo.completed ? 'checked' : ''}`} onClick={() => toggleTodo(todo)} aria-label="Toggle complete">
                    {todo.completed && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </button>
                  <div className="todo-task-body">
                    <span className="todo-task-text">{todo.task}</span>
                    {(todo.dueDate || todo.dueTime) && (
                      <div className={`todo-due ${isOverdue(todo) ? 'overdue-label' : ''}`}>
                        {todo.dueDate && <span>
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{marginRight:'3px',verticalAlign:'middle'}}>
                            <rect x=".5" y="1.5" width="9" height="8" rx="1.2" stroke="currentColor" strokeWidth="1"/>
                            <path d="M.5 4h9M3 .5v2M7 .5v2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                          </svg>
                          {formatDate(new Date(todo.dueDate))}
                        </span>}
                        {todo.dueTime && <span>
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{marginRight:'3px',verticalAlign:'middle'}}>
                            <circle cx="5" cy="5" r="4.5" stroke="currentColor" strokeWidth="1"/>
                            <path d="M5 2.5v2.5l1.5 1" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                          </svg>
                          {formatTime(todo.dueTime)}
                        </span>}
                        {isOverdue(todo) && <span className="overdue-pill">Overdue</span>}
                      </div>
                    )}
                  </div>
                  <button className="todo-delete-btn" onClick={() => deleteTodo(todo._id)} disabled={deletingId === todo._id} aria-label="Delete">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </li>
              ))
            )}
          </ul>

          {doneCount > 0 && (
            <div className="todo-footer">
              <button className="todo-clear-btn" onClick={clearCompleted}>Clear completed ({doneCount})</button>
            </div>
          )}
        </>)}

        {/* ═══ CALENDAR VIEW ═══ */}
        {activeTab === 'calendar' && (
          <div className="cal-view">
            <div className="cal-view-nav">
              <button className="cal-nav" onClick={() => setCalViewDate(d => { const n = new Date(d); n.setMonth(n.getMonth()-1); return n; })}>‹</button>
              <span className="cal-view-month">{MONTHS[calViewDate.getMonth()]} {calViewDate.getFullYear()}</span>
              <button className="cal-nav" onClick={() => setCalViewDate(d => { const n = new Date(d); n.setMonth(n.getMonth()+1); return n; })}>›</button>
            </div>
            <div className="cal-view-days-head">{DAYS.map(d => <span key={d}>{d}</span>)}</div>
            <div className="cal-view-grid">
              {calCells.map((day, i) => {
                if (!day) return <div key={i} className="cal-view-cell empty" />;
                const dayTodos = todosOnDay(calViewDate.getFullYear(), calViewDate.getMonth(), day);
                const isToday = today.getFullYear() === calViewDate.getFullYear() && today.getMonth() === calViewDate.getMonth() && today.getDate() === day;
                return (
                  <div key={i} className={`cal-view-cell ${isToday ? 'today' : ''} ${dayTodos.length > 0 ? 'has-tasks' : ''}`}>
                    <span className="cal-view-daynum">{day}</span>
                    {dayTodos.slice(0, 2).map(t => (
                      <div key={t._id} className={`cal-task-dot ${t.completed ? 'done' : ''} ${isOverdue(t) ? 'od' : ''}`} title={t.task}>
                        {t.task.length > 9 ? t.task.slice(0,9)+'…' : t.task}
                      </div>
                    ))}
                    {dayTodos.length > 2 && <div className="cal-more">+{dayTodos.length - 2}</div>}
                  </div>
                );
              })}
            </div>
            <div className="cal-upcoming">
              <p className="cal-upcoming-label">Upcoming</p>
              {todos.filter(t => t.dueDate && !t.completed).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 5).map(t => (
                <div key={t._id} className={`cal-upcoming-item ${isOverdue(t) ? 'overdue' : ''}`}>
                  <div className="cal-upcoming-dot" />
                  <div className="cal-upcoming-info">
                    <span className="cal-upcoming-task">{t.task}</span>
                    <span className="cal-upcoming-date">
                      {formatDate(new Date(t.dueDate))}{t.dueTime && ` · ${formatTime(t.dueTime)}`}
                    </span>
                  </div>
                  {isOverdue(t) && <span className="overdue-pill">Late</span>}
                </div>
              ))}
              {todos.filter(t => t.dueDate && !t.completed).length === 0 && (
                <p className="cal-no-upcoming">No upcoming tasks scheduled.</p>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}