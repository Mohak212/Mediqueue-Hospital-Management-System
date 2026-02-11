"use client"

interface SidebarProps {
  activeTab: "queue" | "search" | "history"
  onTabChange: (tab: "queue" | "search" | "history") => void
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <div className="w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white p-6 flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
          MediQueue
        </h1>
        <p className="text-xs text-slate-400 mt-1">Hospital Management System</p>
      </div>

      <nav className="flex flex-col gap-3 flex-1">
        <button
          onClick={() => onTabChange("queue")}
          className={`w-full px-4 py-3 rounded-lg text-left text-sm font-medium transition-all ${
            activeTab === "queue"
              ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg"
              : "text-slate-300 hover:bg-slate-700"
          }`}
        >
          📋 Queue
        </button>
        <button
          onClick={() => onTabChange("search")}
          className={`w-full px-4 py-3 rounded-lg text-left text-sm font-medium transition-all ${
            activeTab === "search"
              ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg"
              : "text-slate-300 hover:bg-slate-700"
          }`}
        >
          🔍 Search & Analytics
        </button>
        <button
          onClick={() => onTabChange("history")}
          className={`w-full px-4 py-3 rounded-lg text-left text-sm font-medium transition-all ${
            activeTab === "history"
              ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg"
              : "text-slate-300 hover:bg-slate-700"
          }`}
        >
          📊 History
        </button>
      </nav>

      <div className="pt-4 border-t border-slate-700 text-xs text-slate-400">
        <p>v1.0.0 • Advanced Queue Management</p>
      </div>
    </div>
  )
}
