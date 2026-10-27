
import { useEffect, useState } from "react";
import "./App.css";

const starterTasks = [
  { id: 1, text: "Build my first TODO app", completed: true },
  { id: 2, text: "Deploy my app to GitHub", completed: false },
  { id: 3, text: "Running in github", completed: false },
];

function Header({ remaining }) {
  return (
    <header className="header">
      <div className="brand">
        <span className="brand-icon">✓</span>
        <span>TaskFlow</span>
      </div>
      <div className="date-label">
        {new Date().toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })}
      </div>
      <p className="subtitle">
        A little progress every day adds up.
      </p>
      <div className="progress-label">
        {remaining === 0
          ? "Everything is done. Great work!"
          : `${remaining} task${remaining === 1 ? "" : "s"} left to complete`}
      </div>
    </header>
  );
}

function TaskForm({ onAdd }) {
  const [text, setText] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = text.trim();

    if (!trimmed) return;

    onAdd(trimmed);
    setText("");
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="What needs to get done?"
        aria-label="New task"
        maxLength={200}
      />
      <button type="submit" className="add-button">
        <span>+</span> Add task
      </button>
    </form>
  );
}

function TaskItem({ task, onToggle, onDelete }) {
  return (
    <li className={`task-item ${task.completed ? "completed" : ""}`}>
      <label className="task-label">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
        />
        <span className="custom-checkbox">
          {task.completed ? "✓" : ""}
        </span>
        <span className="task-text">{task.text}</span>
      </label>

      <button
        className="delete-button"
        onClick={() => onDelete(task.id)}
        aria-label={`Delete ${task.text}`}
        title="Delete task"
      >
        ×
      </button>
    </li>
  );
}

function TaskList({ tasks, onToggle, onDelete }) {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">✦</div>
        <h3>No tasks here</h3>
        <p>Add a task or choose another filter.</p>
      </div>
    );
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}

function TaskFilters({ filter, setFilter, tasks, onClearCompleted }) {
  const filters = ["all", "active", "completed"];

  return (
    <footer className="task-footer">
      <span className="task-count">
        {tasks.filter((task) => !task.completed).length} left
      </span>

      <div className="filters">
        {filters.map((item) => (
          <button
            key={item}
            className={filter === item ? "filter active-filter" : "filter"}
            onClick={() => setFilter(item)}
          >
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>

      <button
        className="clear-button"
        onClick={onClearCompleted}
        disabled={!tasks.some((task) => task.completed)}
      >
        Clear done
      </button>
    </footer>
  );
}

export default function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem("taskflow-tasks");
      return saved === null ? starterTasks : JSON.parse(saved);
    } catch {
      return starterTasks;
    }
  });

  const [filter, setFilter] = useState("all");

  useEffect(() => {
    localStorage.setItem("taskflow-tasks", JSON.stringify(tasks));
  }, [tasks]);

  function addTask(text) {
    setTasks((current) => [
      ...current,
      { id: crypto.randomUUID(), text, completed: false },
    ]);
  }

  function toggleTask(id) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  }

  function deleteTask(id) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  function clearCompleted() {
    setTasks((current) => current.filter((task) => !task.completed));
  }

  const visibleTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  const remaining = tasks.filter((task) => !task.completed).length;

  return (
    <main className="app-shell">
      <section className="todo-card">
        <Header remaining={remaining} />
        <TaskForm onAdd={addTask} />
        <TaskList
          tasks={visibleTasks}
          onToggle={toggleTask}
          onDelete={deleteTask}
        />
        <TaskFilters
          filter={filter}
          setFilter={setFilter}
          tasks={tasks}
          onClearCompleted={clearCompleted}
        />
      </section>
      <p className="page-note">
        Made with React · One task at a time
      </p>
    </main>
  );
}
