"use client";
import { useState, useEffect } from 'react';

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");


  useEffect(() => {
    fetch('/api/todos')
      .then(res => {
        if (!res.ok) throw new Error("Backend not reached");
        return res.json();
      })
      .then(data => setTodos(data))
      .catch(err => console.error("Fetch error:", err));
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
      setTodos([...todos, newTodo]);
      setInput("");
    } catch (err) {
      console.error("Add error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-10 flex justify-center">
      <div className="w-full max-w-md bg-white shadow-xl rounded-xl p-6 border border-neutral-100">
        <h1 className="text-3xl font-extrabold text-neutral-800 mb-6 text-center">Volo Tasks</h1>
        <div className="flex gap-2 mb-6">
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
            placeholder="What needs to be done?"
            className="flex-grow border border-neutral-300 rounded-lg p-3 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
          />
          <button 
            onClick={addTodo} 
            disabled={!input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Add
          </button>
        </div>
        <ul className="space-y-3">
          {todos.length === 0 ? (
            <p className="text-center text-neutral-500 py-4">No tasks yet. Add one above!</p>
          ) : (
            todos.map(todo => (
              <li key={todo._id} className="group flex items-center justify-between p-4 bg-neutral-50 border border-neutral-200 rounded-lg hover:shadow-sm transition-shadow">
                <span className="text-neutral-700 font-medium">{todo.task}</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}