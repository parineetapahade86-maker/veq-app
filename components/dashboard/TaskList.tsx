"use client";

import { useTransition } from "react";
import { Sparkles, Circle, CircleDot, CheckCircle2 } from "lucide-react";
import { toggleTaskStatus } from "@/app/dashboard/tasks/actions";

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "open" | "in_progress" | "done";
  ai_generated: boolean;
  created_at: string;
};

const nextStatus: Record<Task["status"], Task["status"]> = {
  open: "in_progress",
  in_progress: "done",
  done: "open",
};

const statusIcon = {
  open: Circle,
  in_progress: CircleDot,
  done: CheckCircle2,
};

export default function TaskList({
  tasks,
  disabled,
}: {
  tasks: Task[];
  disabled?: boolean;
}) {
  const [, startTransition] = useTransition();

  if (tasks.length === 0) {
    return (
      <p className="text-sm text-muted text-center py-10">
        No tasks yet — add one above.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {tasks.map((task) => {
        const Icon = statusIcon[task.status];
        return (
          <li
            key={task.id}
            className="flex items-start gap-3 rounded-xl border hairline bg-cream p-4"
          >
            <button
              type="button"
              disabled={disabled}
              onClick={() =>
                startTransition(() => {
                  toggleTaskStatus(task.id, nextStatus[task.status]);
                })
              }
              className="mt-0.5 text-muted hover:text-gold-deep transition-colors disabled:opacity-50"
              aria-label="Change status"
            >
              <Icon
                size={18}
                className={task.status === "done" ? "text-gold-deep" : ""}
              />
            </button>
            <div className="min-w-0 flex-1">
              <p
                className={`text-sm font-medium text-brown ${
                  task.status === "done" ? "line-through opacity-50" : ""
                }`}
              >
                {task.title}
              </p>
              {task.description && (
                <p className="text-xs text-muted mt-0.5">{task.description}</p>
              )}
            </div>
            {task.ai_generated && (
              <span className="shrink-0 inline-flex items-center gap-1 text-[10px] text-gold-deep font-mono uppercase tracking-wide">
                <Sparkles size={10} />
                AI
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
