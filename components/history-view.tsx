"use client"

import { Button } from "@/components/ui/button"
import type { Patient } from "@/lib/dsa"
import { DEPARTMENT_COLORS } from "@/lib/dsa"

interface HistoryViewProps {
  history: Patient[]
  onClearHistory: () => void
  refreshTrigger?: number
}

export function HistoryView({ history, onClearHistory, refreshTrigger }: HistoryViewProps) {
  const TYPE_COLORS = {
    Regular: { text: "text-cyan-300", badge: "bg-cyan-500/30 text-cyan-100" },
    Emergency: { text: "text-rose-300", badge: "bg-rose-500/30 text-rose-100" },
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Treatment History</h2>
            <p className="text-white/70 text-sm mt-2">Last {history.length} treated patients</p>
          </div>
          {history.length > 0 && (
            <Button
              onClick={onClearHistory}
              className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-semibold"
            >
              Clear History
            </Button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/50 text-lg">No treatment history yet</p>
            <p className="text-white/40 text-sm mt-2">Treated patients will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((patient, index) => (
              <div
                key={`${patient.id}-${patient.timestamp}-${index}`}
                className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-white/50 font-semibold text-sm">#{history.length - index}</span>
                      <p
                        className={`font-semibold text-lg ${TYPE_COLORS[patient.type as keyof typeof TYPE_COLORS]?.text || "text-white"}`}
                      >
                        {patient.name}
                      </p>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <p className="text-white/60">
                        Age: <span className="text-white/80 font-medium">{patient.age}</span>
                      </p>
                      {patient.type === "Emergency" && (
                        <p className="text-white/60">
                          Room: <span className="text-white/80 font-medium">{patient.roomNo}</span>
                        </p>
                      )}
                      <p className="text-white/60">
                        Type: <span className="text-white/80 font-medium">{patient.type}</span>
                      </p>
                      <p className="text-white/60">
                        Department: <span className={`font-medium ${DEPARTMENT_COLORS[patient.department]?.text || "text-white"}`}>{patient.department}</span>
                      </p>
                      <p className="text-white/60">
                        Time: <span className="text-white/80 font-medium">{formatTime(patient.timestamp)}</span>
                      </p>
                    </div>
                    {patient.notes && <p className="mt-2 text-sm text-white/60 italic">{patient.notes}</p>}
                  </div>
                  <span
                    className={`text-sm font-bold px-3 py-1 rounded-full flex-shrink-0 ml-4 ${
                      TYPE_COLORS[patient.type as keyof typeof TYPE_COLORS]?.badge || "bg-white/10 text-white"
                    }`}
                  >
                    {patient.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
