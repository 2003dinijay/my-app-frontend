"use client";
import { useState, useEffect } from 'react';

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");

  // Fetch todos from your Backend API
  useEffect(() => {
    fetch('/api/todos')
      .then(res => res.json())
      .then(data => setTodos(data));
  }, []);

  const addTodo = async () => {
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task: input })
    });
    const newTodo = await res.json();
    setTodos([...todos, newTodo]);
    setInput("");
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">Volo Todo List</h1>
      <input 
        value={input} 
        onChange={(e) => setInput(e.target.value)}
        className="border p-2 mr-2 text-black"
      />
      <button onClick={addTodo} className="bg-blue-500 text-white p-2">Add</button>
      <ul>
        {todos.map(todo => (
          <li key={todo._id} className="mt-2">{todo.task}</li>
        ))}
      </ul>
    </div>
  );
}