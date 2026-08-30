import { FormEvent, useEffect, useState } from "react";
import { api } from "../services/api";
import { logout } from "../services/auth.service";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: string;
}

function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">(
    "MEDIUM"
  );
  const [dueDate, setDueDate] = useState("");

  const loadTasks = async () => {
    try {
      const data = await api("/tasks");
      setTasks(data.tasks);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load tasks"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreateTask = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    try {
      const data = await api("/tasks", {
        method: "POST",
        body: JSON.stringify({
          title,
          description: description || undefined,
          priority,
          dueDate: dueDate
            ? new Date(dueDate).toISOString()
            : undefined,
        }),
      });

      setTasks((currentTasks) => [data.task, ...currentTasks]);

      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setDueDate("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create task"
      );
    }
  };

  if (loading) {
    return <p>Loading tasks...</p>;
  }

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  return (
    <div>
      <div>
        <h1>TaskFlow-AI Dashboard</h1>

        <button onClick={handleLogout}>
          Logout
        </button>
      </div>
    
      <section>
        <h2>Create Task</h2>

        <form onSubmit={handleCreateTask}>
          <div>
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              maxLength={100}
            />
          </div>

          <div>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              maxLength={1000}
            />
          </div>

          <div>
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              value={priority}
              onChange={(event) =>
                setPriority(
                  event.target.value as "LOW" | "MEDIUM" | "HIGH"
                )
              }
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <div>
            <label htmlFor="dueDate">Due Date</label>
            <input
              id="dueDate"
              type="datetime-local"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </div>

          <button type="submit">Create Task</button>
        </form>
      </section>

      {error && <p>{error}</p>}

      <section>
        <h2>My Tasks</h2>

        {tasks.length === 0 ? (
          <p>No tasks yet.</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id}>
              <h3>{task.title}</h3>

              {task.description && <p>{task.description}</p>}

              <p>Status: {task.status}</p>
              <p>Priority: {task.priority}</p>

              {task.dueDate && (
                <p>
                  Due:{" "}
                  {new Date(task.dueDate).toLocaleString()}
                </p>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  );
}

const handleUpdateStatus = async (
    taskId: string,
    status: "TODO" | "IN_PROGRESS" | "COMPLETED"
  ) => {
    try {
      const data = await api(`/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify({
          status,
        }),
      });
  
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === taskId ? data.task : task
        )
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update task"
      );
    }
  };
  
  const handleDeleteTask = async (taskId: string) => {
    try {
      await api(`/tasks/${taskId}`, {
        method: "DELETE",
      });
  
      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== taskId)
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete task"
      );
    }
  };

export default Dashboard;