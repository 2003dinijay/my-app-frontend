"use client";
import { useState, useEffect } from 'react';

const FILTERS = ['All', 'Active', 'Done'];

const MOTIVATIONAL_QUOTES = [
  "Small steps every day.",
  "Done is better than perfect.",
  "One task at a time.",
  "You've got this.",
  "Focus. Flow. Finish.",
];

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [quote] = useState(() => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetch('/api/todos')
      .then(res => {
        if (!res.ok) throw new Error("Backend not reached");
        return res.json();
      })
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
        body: JSON.stringify({ task: input })
      });
      const newTodo = await res.json();
      setTodos(prev => [newTodo, ...prev]);
      setInput("");
    } catch (err) {
      console.error("Add error:", err);
    }
  };

  const deleteTodo = async (id) => {
    setDeletingId(id);
    try {
      await fetch(`/api/todos/${id}`, { method: 'DELETE' });
      setTodos(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const toggleTodo = async (todo) => {
    try {
      const res = await fetch(`/api/todos/${todo._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed })
      });
      if (res.ok) {
        const updated = await res.json();
        setTodos(prev => prev.map(t => t._id === todo._id ? updated : t));
      } else {
        // Optimistic update if backend doesn't have PATCH yet
        setTodos(prev => prev.map(t => t._id === todo._id ? { ...t, completed: !t.completed } : t));
      }
    } catch {
      setTodos(prev => prev.map(t => t._id === todo._id ? { ...t, completed: !t.completed } : t));
    }
  };

  const clearCompleted = () => {
    const completed = todos.filter(t => t.completed);
    completed.forEach(t => deleteTodo(t._id));
  };

  const filtered = todos.filter(t => {
    if (filter === 'Active') return !t.completed;
    if (filter === 'Done') return t.completed;
    return true;
  });

  const doneCount = todos.filter(t => t.completed).length;
  const totalCount = todos.length;
  const progress = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  return (
    <div className="todo-root">
      <div className="todo-card">

        {/* Header */}
        <div className="todo-header">
          <div className="todo-header-top">
            <span className="todo-icon">✦</span>
            <h1 className="todo-title">to do.</h1>
          </div>
          <p className="todo-quote">{quote}</p>
        </div>

        {/* Progress Bar */}
        {totalCount > 0 && (
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

        {/* Input */}
        <div className="todo-input-row">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTodo()}
            placeholder="Add a new task…"
            className="todo-input"
          />
          <button
            onClick={addTodo}
            disabled={!input.trim()}
            className="todo-add-btn"
            aria-label="Add task"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="todo-filters">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`todo-filter-btn ${filter === f ? 'active' : ''}`}
            >
              {f}
              {f === 'All' && totalCount > 0 && <span className="todo-badge">{totalCount}</span>}
              {f === 'Active' && <span className="todo-badge">{todos.filter(t => !t.completed).length}</span>}
              {f === 'Done' && doneCount > 0 && <span className="todo-badge done">{doneCount}</span>}
            </button>
          ))}
        </div>

        {/* List */}
        <ul className="todo-list">
          {loading ? (
            <li className="todo-empty">
              <span className="todo-spinner" />
              <span>Loading tasks…</span>
            </li>
          ) : filtered.length === 0 ? (
            <li className="todo-empty">
              <span className="todo-empty-icon">
                {filter === 'Done' ? '🎉' : '🌿'}
              </span>
              <span>{filter === 'Done' ? 'Nothing completed yet.' : 'All clear! Add a task above.'}</span>
            </li>
          ) : (
            filtered.map(todo => (
              <li
                key={todo._id}
                className={`todo-item ${todo.completed ? 'completed' : ''} ${deletingId === todo._id ? 'deleting' : ''}`}
              >
                <button
                  className={`todo-checkbox ${todo.completed ? 'checked' : ''}`}
                  onClick={() => toggleTodo(todo)}
                  aria-label="Toggle complete"
                >
                  {todo.completed && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
                <span className="todo-task-text">{todo.task}</span>
                <button
                  className="todo-delete-btn"
                  onClick={() => deleteTodo(todo._id)}
                  aria-label="Delete task"
                  disabled={deletingId === todo._id}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </li>
            ))
          )}
        </ul>

        {/* Footer */}
        {doneCount > 0 && (
          <div className="todo-footer">
            <button className="todo-clear-btn" onClick={clearCompleted}>
              Clear completed ({doneCount})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}