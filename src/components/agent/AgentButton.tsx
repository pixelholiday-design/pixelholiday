"use client";

import { useState, useEffect } from "react";
import { Sparkles, X } from "lucide-react";
import AgentChat from "./AgentChat";

type AgentButtonProps = {
  agentType: "photographer" | "company" | "admin";
  primaryColor?: string;
  userName: string;
  companyName?: string;
};

export default function AgentButton({
  agentType,
  primaryColor = "#0EA5A5",
  userName,
  companyName,
}: AgentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [taskCount, setTaskCount] = useState(0);

  // Fetch pending task count
  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch("/api/agent/tasks");
        if (res.ok) {
          const data = await res.json();
          setTaskCount(data.count ?? 0);
        }
      } catch {
        // Task count fetch failed silently
      }
    }
    fetchTasks();
  }, []);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200 hover:shadow-xl"
        style={{
          backgroundColor: primaryColor,
          animation: isOpen ? "none" : "agent-pulse 2s ease-in-out infinite",
        }}
        aria-label={isOpen ? "Close agent" : "Open agent"}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <Sparkles className="h-6 w-6 text-white" />
        )}

        {/* Badge */}
        {!isOpen && taskCount > 0 && (
          <span
            className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full px-1 text-xs font-bold text-white"
            style={{ backgroundColor: "#F97316", height: "20px" }}
          >
            {taskCount > 99 ? "99+" : taskCount}
          </span>
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <AgentChat
          agentType={agentType}
          primaryColor={primaryColor}
          userName={userName}
          companyName={companyName}
          onClose={() => setIsOpen(false)}
          onMinimize={() => setIsOpen(false)}
        />
      )}

      {/* Pulse animation */}
      <style jsx>{`
        @keyframes agent-pulse {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(14, 165, 165, 0.4);
          }
          50% {
            box-shadow: 0 0 0 12px rgba(14, 165, 165, 0);
          }
        }
      `}</style>
    </>
  );
}
