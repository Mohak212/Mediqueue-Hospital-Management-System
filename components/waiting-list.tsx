"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import type { Patient, DepartmentType } from "@/lib/dsa"
import { SEVERITY_LEVELS, DEPARTMENT_COLORS } from "@/lib/dsa"

interface WaitingListProps {
  emergencyPatients: Patient[]
  regularPatients: Patient[]
  onTreatEmergency: () => void
  onTreatRegular: () => void
  canUndo: boolean
  onUndo: () => void
  onUpdatePatient?: (patient: Patient) => void
  department: DepartmentType
}

export function WaitingList({
  emergencyPatients,
  regularPatients,
  onTreatEmergency,
  onTreatRegular,
  canUndo,
  onUndo,
  onUpdatePatient,
  department,
}: WaitingListProps) {
  const deptColors = DEPARTMENT_COLORS[department]
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editRoom, setEditRoom] = useState("")
  const [, setRefresh] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setRefresh((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleEdit = (patient: Patient) => {
    setEditingId(patient.id)
    setEditName(patient.name)
    setEditRoom(patient.roomNo)
  }

  const handleSaveEdit = (patient: Patient) => {
    if (editName.trim() && editRoom.trim()) {
      onUpdatePatient?.({ ...patient, name: editName.trim(), roomNo: editRoom.trim() })
    }
    setEditingId(null)
  }

  return (
    <div className="h-full grid grid-cols-2 gap-6">
      {/* Department Header */}
      <div className="col-span-2 backdrop-blur-xl rounded-xl p-4 flex items-center gap-3" style={{ background: `linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))`, borderColor: `${deptColors.text}40`, borderWidth: '1px' }}>
        <span className="text-2xl">{deptColors.icon}</span>
        <h3 className={`text-2xl font-bold ${deptColors.text}`}>{department} Department</h3>
        <span className="ml-auto text-sm text-white/60">Total Patients: {emergencyPatients.length + regularPatients.length}</span>
      </div>

      {/* Emergency Column - Left (Red Theme) */}
      <div className="flex flex-col">
        <div className="backdrop-blur-xl bg-gradient-to-br from-rose-950/40 to-rose-900/20 border border-rose-400/30 rounded-xl p-6 flex flex-col h-full">
          <h2 className="text-lg font-bold text-rose-300 mb-4 flex items-center gap-2">
            <span className="text-xl">🚨</span> Emergency Queue ({emergencyPatients.length})
          </h2>

          <Button
            onClick={onTreatEmergency}
            disabled={emergencyPatients.length === 0}
            className="w-full bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 text-white font-semibold mb-4 disabled:opacity-50"
          >
            {emergencyPatients.length > 0 ? "Treat Emergency" : "No Emergencies"}
          </Button>

          <div className="flex-1 overflow-y-auto space-y-3">
            {emergencyPatients.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <p className="text-white/50">No emergency patients</p>
              </div>
            ) : (
              <AnimatePresence>
                {emergencyPatients.map((patient, index) => {
                  const severity = patient.severity || 5
                  const severityInfo = SEVERITY_LEVELS[severity as keyof typeof SEVERITY_LEVELS]
                  const waitingMinutes = Math.round((Date.now() - patient.timestamp) / 1000 / 60)

                  return (
                    <motion.div
                      key={patient.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      className={`backdrop-blur-xl ${severityInfo.color} border ${severityInfo.borderColor} rounded-lg p-4`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-white">{index + 1}</span>
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded-full ${severityInfo.textColor} ${severityInfo.color}`}
                          >
                            {severity} - {severityInfo.label}
                          </span>
                        </div>

                        {editingId === patient.id ? (
                          <div className="space-y-2 border-t border-white/10 pt-3">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              placeholder="Patient name"
                              className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 rounded px-2 py-1 text-sm"
                            />
                            <input
                              type="text"
                              value={editRoom}
                              onChange={(e) => setEditRoom(e.target.value)}
                              placeholder="Room number"
                              className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 rounded px-2 py-1 text-sm"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSaveEdit(patient)}
                                className="flex-1 bg-emerald-500/50 hover:bg-emerald-500/70 text-white text-xs font-semibold py-1 rounded"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="flex-1 bg-slate-600/50 hover:bg-slate-600/70 text-white text-xs font-semibold py-1 rounded"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="font-semibold text-white">{patient.name}</p>
                            <div className="grid grid-cols-3 gap-2 text-xs text-white/70">
                              <div>
                                <p className="text-white/50">Age</p>
                                <p className="font-semibold text-white">{patient.age}</p>
                              </div>
                              <div>
                                <p className="text-white/50">Room</p>
                                <p className="font-semibold text-white">{patient.roomNo}</p>
                              </div>
                              <div>
                                <p className="text-white/50">Waiting</p>
                                <p className="font-semibold text-white">{waitingMinutes}m</p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* Regular Column - Right (Blue Theme) */}
      <div className="flex flex-col">
        <div className="backdrop-blur-xl bg-gradient-to-br from-blue-950/40 to-blue-900/20 border border-blue-400/30 rounded-xl p-6 flex flex-col h-full">
          <h2 className="text-lg font-bold text-blue-300 mb-4 flex items-center gap-2">
            <span className="text-xl">📋</span> Regular Queue ({regularPatients.length})
          </h2>

          <Button
            onClick={onTreatRegular}
            disabled={regularPatients.length === 0}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold mb-4 disabled:opacity-50"
          >
            {regularPatients.length > 0 ? "Call Next OPD" : "No Patients"}
          </Button>

          <div className="flex-1 overflow-y-auto space-y-3">
            {regularPatients.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <p className="text-white/50">No regular patients</p>
              </div>
            ) : (
              <AnimatePresence>
                {regularPatients.map((patient, index) => {
                  const waitingMinutes = Math.round((Date.now() - patient.timestamp) / 1000 / 60)

                  return (
                    <motion.div
                      key={patient.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      className={`backdrop-blur-xl bg-gradient-to-br from-blue-500/15 to-blue-500/5 border border-blue-400/20 rounded-lg p-4 relative overflow-hidden`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-white">{index + 1}</span>
                          <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-500/30 text-blue-200">
                            Regular
                          </span>
                        </div>

                        {editingId === patient.id ? (
                          <div className="space-y-2 border-t border-white/10 pt-3">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              placeholder="Patient name"
                              className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 rounded px-2 py-1 text-sm"
                            />
                            <input
                              type="text"
                              value={editRoom}
                              onChange={(e) => setEditRoom(e.target.value)}
                              placeholder="Room number"
                              className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 rounded px-2 py-1 text-sm"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSaveEdit(patient)}
                                className="flex-1 bg-emerald-500/50 hover:bg-emerald-500/70 text-white text-xs font-semibold py-1 rounded"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="flex-1 bg-slate-600/50 hover:bg-slate-600/70 text-white text-xs font-semibold py-1 rounded"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="font-semibold text-white">{patient.name}</p>
                            <div className="grid grid-cols-3 gap-2 text-xs text-white/70">
                              <div>
                                <p className="text-white/50">Age</p>
                                <p className="font-semibold text-white">{patient.age}</p>
                              </div>
                              <div>
                                <p className="text-white/50">Status</p>
                                <p className="font-semibold text-white">In Queue</p>
                              </div>
                              <div>
                                <p className="text-white/50">Waiting</p>
                                <p className="font-semibold text-white">{waitingMinutes}m</p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* Undo Button - Bottom */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <Button
          onClick={onUndo}
          disabled={!canUndo}
          className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-semibold disabled:opacity-50"
        >
          ↶ Undo Last Entry
        </Button>
      </div>
    </div>
  )
}
