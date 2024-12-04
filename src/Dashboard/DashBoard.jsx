import { useState, useEffect, useMemo, useCallback, useReducer, useRef } from "react";
import { useTheme } from "./ThemeContext";
import "./index.css";

const taskReducer = (state, action) => {
  switch (action.type) {
    case "settask":
      return action.payload
    case "add":
      return [...state, action.payload]
    case "update":
      return state.map((task) =>
        task.id === action.payload.id ? { ...task, ...action.payload } : task
      );
    case "delete":
      return state.filter((task) => task.id !== action.payload)
    default:
      return state
  }
}

const Dashboard = () => {
  const [tasks, dispatch] = useReducer(taskReducer, [])
  const [filter, setFilter] = useState("")
  const [sortBy, setSortBy] = useState("title")
  const [error, setError] = useState(null)
  const [newTask, setNewTask] = useState({ title: "", description: "", status: "Pending" })
  const titleRef = useRef()

  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/posts")
      .then((response) => response.json())
      .then((data) => {
        const formattedTasks = data.slice(0, 10).map((task) => ({
          id: task.id,
          title: task.title,
          description: `Description for ${task.title}`,
          status: task.completed ? "Completed" : "Pending",
        }));
        dispatch({ type: "settask", payload: formattedTasks })
      })
      .catch(() => setError("Failed to load tasks."))
  }, [])

  const filteredTasks = useMemo(() => {
    return filter ? tasks.filter((task) => task.status === filter) : tasks;
  }, [tasks, filter])

  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => a[sortBy].localeCompare(b[sortBy]));
  }, [filteredTasks, sortBy])

  const handleAddTask = useCallback(() => {
    if (!newTask.title.trim()) {
      titleRef.current.focus()
      return
    }
    const newTaskData = { ...newTask, id: Date.now() }
    dispatch({ type: "add", payload: newTaskData })
    setNewTask({ title: "", description: "", status: "Pending" })
    titleRef.current.focus()
  }, [newTask])

  const handleEditTask = useCallback((id) => {
    const task = tasks.find((task) => task.id === id)
    const newTitle = prompt("Edit Task Title", task.title)
    const newDescription = prompt("Edit Task Description", task.description)

    if (newTitle && newTitle.trim() !== task.title) {
      if (newDescription && newDescription.trim() !== task.description) {
        dispatch({
          type: "update",
          payload: { id, title: newTitle, status: task.status, description: newDescription },
        })
      }
    }
  }, [tasks])

  const handleDeleteTask = useCallback((id) => {
    dispatch({ type: "delete", payload: id })
  }, [])

  const handleStatusChange = useCallback((id, newStatus) => {
    dispatch({
      type: "update",
      payload: { id, status: newStatus },
    })
  }, [])

  return (
    <div className={`dashboard-container ${theme}`}>
      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === "light" ? "Dark" : "Light"}
      </button>

     <p className="error">{error}</p>

      <div>
       <input  type="text"  placeholder="Title" ref={titleRef}
        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}/>
        <textarea placeholder="Description"
        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}/>
        <select value={newTask.status}
        onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        <button onClick={handleAddTask}>Add Task</button>
      </div>

      <div className="filters">
        <select onChange={(e) => setFilter(e.target.value)} value={filter}>
          <option value="">All</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        <select onChange={(e) => setSortBy(e.target.value)} value={sortBy}>
          <option value="title">Title</option>
          <option value="description">Description</option>
        </select>
      </div>

      <ul className="task-list">
        {sortedTasks.map((task) => (
          <li key={task.id} className="task-item">
            <h3> <strong>Title:</strong>{task.title}</h3>
            <p><strong>Description:</strong>{task.description}</p>
            <p> <strong>Status:</strong>{task.status}</p>

            <div className="status-buttons">
              <button onClick={() => handleStatusChange(task.id, "Pending")}>Pending</button>
              <button onClick={() => handleStatusChange(task.id, "In Progress")}>In Progress</button>
              <button onClick={() => handleStatusChange(task.id, "Completed")}>Completed</button>
            </div>
            <button onClick={() => handleEditTask(task.id)}>Edit</button>
            <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Dashboard;
