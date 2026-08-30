"use client";

import { useState } from "react";

type Integration = {
  id: string;
  name: string;
  description: string;
  letter: string;
};

const integrations: Integration[] = [
  { id: "slack", name: "Slack", description: "Capture context from channels and threads", letter: "S" },
  { id: "gdrive", name: "Google Drive", description: "Pull in documents and files automatically", letter: "G" },
  { id: "notion", name: "Notion", description: "Sync pages, docs, and knowledge bases", letter: "N" },
  { id: "teams", name: "Microsoft Teams", description: "Capture meetings, chats, and calls", letter: "T" },
  { id: "github", name: "GitHub", description: "Track issues, PRs, and commit history", letter: "H" },
];

export default function PluginsList() {
  const [connected, setConnected] = useState<Record<string, boolean>>({});

  return (
    <div className="rounded-2xl border hairline divide-y divide-brown/10 overflow-hidden">
      {integrations.map((integration) => {
        const isConnected = !!connected[integration.id];
        return (
          <div
            key={integration.id}
            className="flex items-center justify-between gap-4 p-5 bg-cream"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-brown text-cream flex items-center justify-center font-display text-sm shrink-0">
                {integration.letter}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-brown">
                  {integration.name}
                </p>
                <p className="text-xs text-muted truncate">
                  {integration.description}
                </p>
              </div>
            </div>
            <button
              onClick={() =>
                setConnected((prev) => ({
                  ...prev,
                  [integration.id]: !prev[integration.id],
                }))
              }
              className={`shrink-0 text-xs font-medium px-4 py-2 rounded-full transition-colors ${
                isConnected
                  ? "bg-cream-deep text-brown border hairline hover:bg-brown/10"
                  : "bg-brown text-cream hover:bg-black-rich"
              }`}
            >
              {isConnected ? "Disconnect" : "Connect"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
