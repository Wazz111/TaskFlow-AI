import { FormEvent, useEffect, useState } from "react";
import { api } from "../services/api";
import { logout } from "../services/auth.service";

type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED";
type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
}

function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] =
    useState<TaskPriority>("MEDIUM");
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

      setTasks((currentTasks) => [
        data.task,
        ...currentTasks,
      ]);

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

  const handleUpdateStatus = async (
    taskId: string,
    status: TaskStatus
  ) => {
    setError("");

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
    setError("");

    try {
      await api(`/tasks/${taskId}`, {
        method: "DELETE",
      });

      setTasks((currentTasks) =>
        currentTasks.filter(
          (task) => task.id !== taskId
        )
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete task"
      );
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading tasks...
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>TaskFlow-AI</h1>
          <p>Manage your tasks and stay productive.</p>
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      <main className="dashboard-content">
        <section className="dashboard-section">
          <div className="section-heading">
            <h2>Create Task</h2>
            <p>Add something new to your workflow.</p>
          </div>

          <form
            className="task-form"
            onSubmit={handleCreateTask}
          >
            <div className="dashboard-field">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                required
                maxLength={100}
              />
            </div>

            <div className="dashboard-field">
              <label htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                maxLength={1000}
              />
            </div>

            <div className="task-form-row">
              <div className="dashboard-field">
                <label htmlFor="priority">
                  Priority
                </label>

                <select
                  id="priority"
                  value={priority}
                  onChange={(event) =>
                    setPriority(
                      event.target
                        .value as TaskPriority
                    )
                  }
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">
                    Medium
                  </option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div className="dashboard-field">
                <label htmlFor="dueDate">
                  Due Date
                </label>

                <input
                  id="dueDate"
                  type="datetime-local"
                  value={dueDate}
                  onChange={(event) =>
                    setDueDate(event.target.value)
                  }
                />
              </div>
            </div>

            <button
              className="primary-button"
              type="submit"
            >
              Create Task
            </button>
          </form>
        </section>

        {error && (
          <p className="dashboard-error">
            {error}
          </p>
        )}

        <section className="dashboard-section">
          <div className="section-heading">
            <h2>My Tasks</h2>
            <p>
              {tasks.length}{" "}
              {tasks.length === 1 ? "task" : "tasks"}
            </p>
          </div>

          {tasks.length === 0 ? (
            <div className="empty-state">
              <h3>No tasks yet</h3>
              <p>
                Create your first task above.
              </p>
            </div>
          ) : (
            <div className="task-grid">
              {tasks.map((task) => (
                <article
                  className="task-card"
                  key={task.id}
                >
                  <div className="task-card-header">
                    <div>
                      <h3>{task.title}</h3>

                      {task.description && (
                        <p>{task.description}</p>
                      )}
                    </div>

                    <span
                      className={`priority-badge priority-${task.priority.toLowerCase()}`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  <div className="task-meta">
                    <span
                      className={`status-badge status-${task.status.toLowerCase()}`}
                    >
                      {task.status.replace("_", " ")}
                    </span>

                    {task.dueDate && (
                      <span>
                        Due:{" "}
                        {new Date(
                          task.dueDate
                        ).toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="task-actions">
                    {task.status === "TODO" && (
                      <button
                        className="secondary-button"
                        onClick={() =>
                          handleUpdateStatus(
                            task.id,
                            "IN_PROGRESS"
                          )
                        }
                      >
                        Start
                      </button>
                    )}

                    {task.status !== "COMPLETED" && (
                      <button
                        className="primary-button"
                        onClick={() =>
                          handleUpdateStatus(
                            task.id,
                            "COMPLETED"
                          )
                        }
                      >
                        Complete
                      </button>
                    )}

                    {task.status === "COMPLETED" && (
                      <button
                        className="secondary-button"
                        onClick={() =>
                          handleUpdateStatus(
                            task.id,
                            "TODO"
                          )
                        }
                      >
                        Reopen
                      </button>
                    )}

                    <button
                      className="danger-button"
                      onClick={() =>
                        handleDeleteTask(task.id)
                      }
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;