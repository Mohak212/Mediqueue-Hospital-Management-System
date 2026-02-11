"use client"

import { useEffect, useState } from "react"
import type { Patient } from "@/lib/dsa"
import { calculateAverageWaitTime } from "@/lib/dsa"

interface HeaderProps {
  totalPatients: number
  emergencyCases: number
  patients: Patient[]
}

export function DashboardHeader({ totalPatients, emergencyCases, patients }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>("")
  const [avgWaitTime, setAvgWaitTime] = useState<number>(0)

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      )
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const updateWaitTime = () => {
      setAvgWaitTime(calculateAverageWaitTime(patients))
    }

    updateWaitTime()
    const interval = setInterval(updateWaitTime, 1000)
    return () => clearInterval(interval)
  }, [patients])

  const systemHealthy = emergencyCases < 3

  return (
    <div className="backdrop-blur-xl bg-white/5 border-b border-white/10 px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">MediQueue Admin</h1>
          <p className="text-sm text-white/60">Advanced Hospital Patient Management</p>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-right">
            <p className="text-sm text-white/60">Current Time</p>
            <p className="text-2xl font-mono font-bold text-emerald-400">{currentTime}</p>
          </div>
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-sm border ${
              systemHealthy
                ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-300"
                : "bg-rose-500/20 border-rose-400/50 text-rose-300"
            }`}
          >
            <div className={`w-3 h-3 rounded-full animate-pulse ${systemHealthy ? "bg-emerald-400" : "bg-rose-400"}`} />
            <span className="text-sm font-medium">{systemHealthy ? "System Healthy" : "Alerts Active"}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-lg p-4">
          <p className="text-sm font-medium text-white/70">Total Queue</p>
          <p className="text-3xl font-bold text-white mt-2">{totalPatients}</p>
          <p className="text-xs text-white/50 mt-1">patients waiting</p>
        </div>
        <div className="backdrop-blur-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-400/30 rounded-lg p-4">
          <p className="text-sm font-medium text-emerald-300">Avg Wait Time</p>
          <p className="text-3xl font-bold text-emerald-400 mt-2">
            {avgWaitTime}
            <span className="text-sm ml-1">m</span>
          </p>
          <p className="text-xs text-emerald-300/70 mt-1">minutes</p>
        </div>
        <div className="backdrop-blur-xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-400/30 rounded-lg p-4">
          <p className="text-sm font-medium text-cyan-300">Emergency Cases</p>
          <p className="text-3xl font-bold text-cyan-400 mt-2">{emergencyCases}</p>
          <p className="text-xs text-cyan-300/70 mt-1">currently in queue</p>
        </div>
      </div>
    </div>
  )
}
