
import { useState } from "react";
import type { FormEvent } from "react";
import { api } from "../services/api";

type Priority = "LOW" | "MEDIUM" | "HIGH";

interface AISuggestion {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  selected: boolean;
}

interface BreakdownResponse {
  tasks: Array<{
    title: string;
    description: string;
    priority: Priority;
  }>;
}

interface Props {
  onTasksSaved: () => Promise<void> | void;
}

function AITaskBreakdown({ onTasksSaved }: Props) {
  const [goal, setGoal] = useState("");
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const busy = generating || saving;

  const handleGenerate = async (event: FormEvent) => {
    event.preventDefault();

    if (busy) return;

    setError("");
    setMessage("");
    setGenerating(true);

    try {
      const data: BreakdownResponse = await api(
        "/ai/breakdown",
        {
          method: "POST",
          body: JSON.stringify({
            goal: goal.trim(),
          }),
        }
      );

      if (!Array.isArray(data.tasks)) {
        throw new Error("Invalid AI response");
      }

      setSuggestions(
        data.tasks.map((task, index) => ({
          id: index,
          title: task.title.slice(0, 100),
          description: task.description,
          priority: task.priority,
          selected: true,
        }))
      );

      setMessage(
        "Review and edit the suggestions before saving."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate tasks."
      );
    } finally {
      setGenerating(false);
    }
  };

  const updateSuggestion = (
    id: number,
    changes: Partial<AISuggestion>
  ) => {
    setSuggestions((current) =>
      current.map((task) =>
        task.id === id
          ? { ...task, ...changes }
          : task
      )
    );
  };

  const handleSave = async () => {
    if (busy) return;

    const selected = suggestions.filter(
      (task) => task.selected
    );

    if (selected.length === 0) {
      setError("Select at least one task.");
      return;
    }

    if (
      selected.some(
        (task) =>
          !task.title.trim() ||
          task.title.trim().length > 100
      )
    ) {
      setError(
        "Each selected task needs a title of 100 characters or fewer."
      );
      return;
    }

    setError("");
    setMessage("");
    setSaving(true);

    let savedCount = 0;
    let saveError = "";

    try {
      for (const task of selected) {
        try {
          await api("/tasks", {
            method: "POST",
            body: JSON.stringify({
              title: task.title.trim(),
              description:
                task.description.trim() || undefined,
              priority: task.priority,
            }),
          });

          savedCount++;
        } catch (err) {
          saveError =
            err instanceof Error
              ? err.message
              : "Failed to save a task.";
          break;
        }
      }

      if (savedCount > 0) {
        const savedIds = new Set(
          selected.slice(0, savedCount).map(
            (task) => task.id
          )
        );

        setSuggestions((current) =>
          current.filter(
            (task) => !savedIds.has(task.id)
          )
        );

        await onTasksSaved();

        setMessage(
          `${savedCount} task(s) saved to your Dashboard.`
        );
      }

      if (saveError) {
        setError(
          `Saving stopped: ${saveError}. Unsaved suggestions remain available.`
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not refresh your tasks."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="dashboard-section">
      <div className="section-heading">
        <h2>✨ AI Task Breakdown</h2>
        <p>
          Turn a big goal into smaller,
          actionable tasks.
        </p>
      </div>

      <form
        className="task-form"
        onSubmit={handleGenerate}
      >
        <div className="dashboard-field">
          <label htmlFor="ai-goal">
            What do you want to accomplish?
          </label>

          <textarea
            id="ai-goal"
            value={goal}
            onChange={(event) =>
              setGoal(event.target.value)
            }
            placeholder="Example: Build a portfolio website in two weeks"
            minLength={10}
            maxLength={500}
            required
            disabled={busy}
          />
        </div>

        <button
          className="primary-button"
          type="submit"
          disabled={busy}
        >
          {generating
            ? "Generating..."
            : "✨ Generate Tasks with AI"}
        </button>
      </form>

      {error && (
        <p className="dashboard-error" role="alert">
          {error}
        </p>
      )}

      {message && (
        <p role="status">{message}</p>
      )}

      {suggestions.length > 0 && (
        <div className="ai-suggestion-list">
          <h3>AI Suggestions</h3>

          {suggestions.map((task) => (
            <div
              className="ai-suggestion-card"
              key={task.id}
            >
              <label className="ai-select-label">
                <input
                  type="checkbox"
                  checked={task.selected}
                  disabled={busy}
                  onChange={(event) =>
                    updateSuggestion(task.id, {
                      selected: event.target.checked,
                    })
                  }
                />
                Include this task
              </label>

              <div className="dashboard-field">
                <label htmlFor={`ai-title-${task.id}`}>
                  Title
                </label>

                <input
                  id={`ai-title-${task.id}`}
                  type="text"
                  value={task.title}
                  maxLength={100}
                  disabled={busy}
                  onChange={(event) =>
                    updateSuggestion(task.id, {
                      title: event.target.value,
                    })
                  }
                />
              </div>

              <div className="dashboard-field">
                <label
                  htmlFor={`ai-description-${task.id}`}
                >
                  Description
                </label>

                <textarea
                  id={`ai-description-${task.id}`}
                  value={task.description}
                  maxLength={1000}
                  disabled={busy}
                  onChange={(event) =>
                    updateSuggestion(task.id, {
                      description: event.target.value,
                    })
                  }
                />
              </div>

              <div className="dashboard-field">
                <label
                  htmlFor={`ai-priority-${task.id}`}
                >
                  Priority
                </label>

                <select
                  id={`ai-priority-${task.id}`}
                  value={task.priority}
                  disabled={busy}
                  onChange={(event) =>
                    updateSuggestion(task.id, {
                      priority:
                        event.target.value as Priority,
                    })
                  }
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>
          ))}

          <button
            className="primary-button"
            type="button"
            disabled={
              busy ||
              !suggestions.some((task) => task.selected)
            }
            onClick={handleSave}
          >
            {saving
              ? "Saving Tasks..."
              : `Save Selected Tasks (${
                  suggestions.filter(
                    (task) => task.selected
                  ).length
                })`}
          </button>
        </div>
      )}
    </section>
  );
}

export default AITaskBreakdown;
