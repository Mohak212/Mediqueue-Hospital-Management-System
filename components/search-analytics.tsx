"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { searchPatients, DEPARTMENT_COLORS } from "@/lib/dsa"
import type { Patient } from "@/lib/dsa"

interface SearchAnalyticsProps {
  patients: Patient[]
  onCleanDuplicates: () => void
  onExportCSV: () => void
}

export function SearchAnalytics({ patients, onCleanDuplicates, onExportCSV }: SearchAnalyticsProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [ageMin, setAgeMin] = useState("")
  const [ageMax, setAgeMax] = useState("")

  const results = useMemo(() => {
    return searchPatients(
      patients,
      searchQuery,
      ageMin ? Number.parseInt(ageMin) : undefined,
      ageMax ? Number.parseInt(ageMax) : undefined,
    )
  }, [patients, searchQuery, ageMin, ageMax])

  const emergencyCount = patients.filter((p) => p.type === "Emergency").length

  const TYPE_COLORS = {
    Regular: {
      bg: "bg-blue-500/20",
      border: "border-blue-500/30",
      text: "text-blue-300",
      badge: "bg-blue-500/30 text-blue-100",
    },
    Emergency: {
      bg: "bg-rose-500/20",
      border: "border-rose-500/30",
      text: "text-rose-300",
      badge: "bg-rose-500/30 text-rose-100",
    },
  }

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
          <p className="text-white/70 text-sm">Total Queue</p>
          <p className="text-3xl font-bold text-emerald-400 mt-2">{patients.length}</p>
        </div>
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
          <p className="text-white/70 text-sm">Emergency Cases</p>
          <p className="text-3xl font-bold text-rose-400 mt-2">{emergencyCount}</p>
        </div>
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
          <p className="text-white/70 text-sm">Regular Patients</p>
          <p className="text-3xl font-bold text-blue-400 mt-2">{patients.length - emergencyCount}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Advanced Search</h3>
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Search by name or room number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              placeholder="Age Min"
              value={ageMin}
              onChange={(e) => setAgeMin(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
            <Input
              type="number"
              placeholder="Age Max"
              value={ageMax}
              onChange={(e) => setAgeMax(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={onCleanDuplicates}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold"
            >
              Clean Data
            </Button>
            <Button
              onClick={onExportCSV}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold"
            >
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">
          Results ({results.length} of {patients.length})
        </h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {results.length === 0 ? (
            <p className="text-white/50 text-base py-8 text-center">No patients match your criteria</p>
          ) : (
            results.map((patient) => (
              <div
                key={patient.id}
                className={`p-4 rounded-lg border ${TYPE_COLORS[patient.type].bg} ${TYPE_COLORS[patient.type].border}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className={`font-semibold text-lg ${TYPE_COLORS[patient.type].text}`}>{patient.name}</p>
                    <p className="text-sm text-white/60 mt-1">
                      Age: <span className="text-white/80 font-medium">{patient.age}</span> |
                      {patient.type === "Emergency" && (
                        <>
                          Room: <span className="text-white/80 font-medium">{patient.roomNo}</span> |{" "}
                        </>
                      )}
                      Type: <span className="text-white/80 font-medium">{patient.type}</span> |
                      Department: <span className={`font-medium ${DEPARTMENT_COLORS[patient.department]?.text || "text-white"}`}>{patient.department}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${TYPE_COLORS[patient.type].badge}`}>
                      {patient.type}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
