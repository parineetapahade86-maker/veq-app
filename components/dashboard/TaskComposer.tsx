"use client";

import { useRef, useState, useTransition } from "react";
import { Sparkles, Plus } from "lucide-react";
import { createTask, createTaskWithAI } from "@/app/dashboard/tasks/actions";

export default function TaskComposer({ disabled }: { disabled?: boolean }) {
  const [mode, setMode] = useState<"manual" | "ai">("manual");
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="rounded-2xl border hairline bg-cream-deep/30 p-5">
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setMode("manual")}
          className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
            mode === "manual"
              ? "bg-brown text-cream"
              : "text-muted hover:text-brown"
          }`}
        >
          Write it myself
        </button>
        <button
          type="button"
          onClick={() => setMode("ai")}
          className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-colors ${
            mode === "ai"
              ? "bg-brown text-cream"
              : "text-muted hover:text-brown"
          }`}
        >
          <Sparkles size={12} />
          Describe it, let AI write it
        </button>
      </div>

      {mode === "manual" ? (
        <form
          ref={formRef}
          action={(formData) =>
            startTransition(async () => {
              await createTask(formData);
              formRef.current?.reset();
            })
          }
          className="space-y-3"
        >
          <input
            name="title"
            placeholder="Task title"
            required
            disabled={disabled}
            className="w-full rounded-lg border hairline bg-cream px-3.5 py-2.5 text-sm text-brown placeholder:text-muted focus:outline-none focus:border-gold-deep disabled:opacity-50"
          />
          <textarea
            name="description"
            placeholder="Details (optional)"
            rows={2}
            disabled={disabled}
            className="w-full rounded-lg border hairline bg-cream px-3.5 py-2.5 text-sm text-brown placeholder:text-muted focus:outline-none focus:border-gold-deep disabled:opacity-50 resize-none"
          />
          <button
            type="submit"
            disabled={disabled || pending}
            className="inline-flex items-center gap-1.5 bg-brown text-cream text-xs font-medium px-4 py-2 rounded-full hover:bg-black-rich transition-colors disabled:opacity-50"
          >
            <Plus size={14} />
            {pending ? "Adding…" : "Add task"}
          </button>
        </form>
      ) : (
        <form
          ref={formRef}
          action={(formData) =>
            startTransition(async () => {
              await createTaskWithAI(formData);
              formRef.current?.reset();
            })
          }
          className="space-y-3"
        >
          <textarea
            name="spoken"
            placeholder='e.g. "kal client ko proposal bhejna hai" or "follow up with the design vendor about pricing"'
            rows={2}
            required
            disabled={disabled}
            className="w-full rounded-lg border hairline bg-cream px-3.5 py-2.5 text-sm text-brown placeholder:text-muted focus:outline-none focus:border-gold-deep disabled:opacity-50 resize-none"
          />
          <button
            type="submit"
            disabled={disabled || pending}
            className="inline-flex items-center gap-1.5 bg-brown text-cream text-xs font-medium px-4 py-2 rounded-full hover:bg-black-rich transition-colors disabled:opacity-50"
          >
            <Sparkles size={14} />
            {pending ? "VEQ is writing it…" : "Let VEQ write it"}
          </button>
        </form>
      )}
    </div>
  );
}
