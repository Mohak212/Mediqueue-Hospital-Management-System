"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { motion } from "framer-motion"
import { Sidebar } from "@/components/sidebar"
import { PatientIntake } from "@/components/patient-intake"
import { SearchAnalytics } from "@/components/search-analytics"
import { HistoryView } from "@/components/history-view"
import { DashboardHeader } from "@/components/dashboard-header"
import { WaitingList } from "@/components/waiting-list"
import { Stack, PatientHashSet, TreatmentHistory, type Patient, DEPARTMENTS, type DepartmentType, exportToCSV } from "@/lib/dsa"

export default function MediQueueDashboard() {
  const [activeTab, setActiveTab] = useState<"queue" | "search" | "history">("queue")
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentType>("General")
  const [showClearAlert, setShowClearAlert] = useState(false)
  
  // Initialize department queues from localStorage
  const [departmentQueues, setDepartmentQueues] = useState<Map<DepartmentType, { emergency: Patient[]; regular: Patient[] }>>(() => {
    if (typeof window === "undefined") {
      const map = new Map()
      DEPARTMENTS.forEach((dept) => {
        map.set(dept, { emergency: [], regular: [] })
      })
      return map
    }

    const stored = localStorage.getItem("mediqueue-departments")
    if (stored) {
      try {
        const data = JSON.parse(stored) as Record<string, { emergency: Patient[]; regular: Patient[] }>
        const map = new Map(Object.entries(data))
        return map
      } catch {
        const map = new Map()
        DEPARTMENTS.forEach((dept) => {
          map.set(dept, { emergency: [], regular: [] })
        })
        return map
      }
    }

    const map = new Map()
    DEPARTMENTS.forEach((dept) => {
      map.set(dept, { emergency: [], regular: [] })
    })
    return map
  })
  
  const [usedRooms, setUsedRooms] = useState<Set<string>>(new Set())
  const [undoStack] = useState(() => new Stack())
  const [treatmentHistory, setTreatmentHistory] = useState<TreatmentHistory>(() => {
    if (typeof window === "undefined") return new TreatmentHistory()
    
    const stored = localStorage.getItem("mediqueue-history")
    const history = new TreatmentHistory()
    if (stored) {
      try {
        const data = JSON.parse(stored) as Patient[]
        data.forEach((p) => history.addPatient(p))
      } catch {
        // Continue with empty history
      }
    }
    return history
  })
  const [showConfetti, setShowConfetti] = useState(false)
  const [historyRefresh, setHistoryRefresh] = useState(0)
  const [treatedPatientIds, setTreatedPatientIds] = useState<Set<string>>(new Set())

  const [emergencyPatients, setEmergencyPatients] = useState<Patient[]>([])
  const [regularPatients, setRegularPatients] = useState<Patient[]>([])

  // Save department queues to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      const data = Object.fromEntries(departmentQueues)
      localStorage.setItem("mediqueue-departments", JSON.stringify(data))
    }
  }, [departmentQueues])

  // Save treatment history to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("mediqueue-history", JSON.stringify(treatmentHistory.getHistory()))
    }
  }, [historyRefresh])

  const handleAddPatient = useCallback(
    (patient: Patient, type: "Regular" | "Emergency") => {
      const patientWithType = { ...patient, type }

      setDepartmentQueues((prev) => {
        const newMap = new Map(prev)
        const deptQueue = newMap.get(patient.department) || { emergency: [], regular: [] }

        if (type === "Emergency") {
          const updated = [...deptQueue.emergency, patientWithType]
          // Sort Emergency patients by severity (higher first)
          updated.sort((a, b) => (b.severity || 1) - (a.severity || 1))
          newMap.set(patient.department, { ...deptQueue, emergency: updated })
        } else {
          newMap.set(patient.department, { ...deptQueue, regular: [...deptQueue.regular, patientWithType] })
        }

        return newMap
      })

      undoStack.push(patientWithType)
      if (type === "Emergency") {
        setUsedRooms((prev) => new Set([...prev, patient.roomNo]))
      }
    },
    [undoStack],
  )

  const handleUpdatePatient = useCallback(
    (updatedPatient: Patient) => {
      setDepartmentQueues((prev) => {
        const newMap = new Map(prev)
        const deptQueue = newMap.get(updatedPatient.department)
        if (!deptQueue) return newMap

        if (updatedPatient.type === "Emergency") {
          const updated = deptQueue.emergency.map((p) => (p.id === updatedPatient.id ? updatedPatient : p))
          updated.sort((a, b) => (b.severity || 1) - (a.severity || 1))
          newMap.set(updatedPatient.department, { ...deptQueue, emergency: updated })
        } else {
          const updated = deptQueue.regular.map((p) => (p.id === updatedPatient.id ? updatedPatient : p))
          newMap.set(updatedPatient.department, { ...deptQueue, regular: updated })
        }

        return newMap
      })

      setUsedRooms((prev) => {
        const rooms = new Set(prev)
        let oldPatient: Patient | undefined
        departmentQueues.forEach((queue) => {
          const found = [...queue.emergency, ...queue.regular].find((p) => p.id === updatedPatient.id)
          if (found) oldPatient = found
        })
        if (oldPatient && oldPatient.roomNo !== updatedPatient.roomNo) {
          rooms.delete(oldPatient.roomNo)
          rooms.add(updatedPatient.roomNo)
        }
        return rooms
      })
    },
    [departmentQueues],
  )

  const handleTreatEmergency = useCallback(() => {
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 2000)
    setDepartmentQueues((prev) => {
      const newMap = new Map(prev)
      const deptQueue = newMap.get(selectedDepartment)
      if (deptQueue && deptQueue.emergency.length > 0) {
        const treated = deptQueue.emergency[0]
        treatmentHistory.addPatient(treated)
        setHistoryRefresh((prev) => prev + 1)
        newMap.set(selectedDepartment, { ...deptQueue, emergency: deptQueue.emergency.slice(1) })
      }
      return newMap
    })
  }, [selectedDepartment, treatmentHistory])

  const handleTreatRegular = useCallback(() => {
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 2000)
    setDepartmentQueues((prev) => {
      const newMap = new Map(prev)
      const deptQueue = newMap.get(selectedDepartment)
      if (deptQueue && deptQueue.regular.length > 0) {
        const treated = deptQueue.regular[0]
        treatmentHistory.addPatient(treated)
        setHistoryRefresh((prev) => prev + 1)
        newMap.set(selectedDepartment, { ...deptQueue, regular: deptQueue.regular.slice(1) })
      }
      return newMap
    })
  }, [selectedDepartment, treatmentHistory])

  const handleCleanDuplicates = useCallback(() => {
    setDepartmentQueues((prev) => {
      const newMap = new Map(prev)
      newMap.forEach((deptQueue, dept) => {
        const allPatients = [...deptQueue.emergency, ...deptQueue.regular]
        const hashSet = new PatientHashSet()
        const unique = allPatients.filter((patient) => hashSet.add(patient))

        const uniqueEmergency = unique.filter((p) => p.type === "Emergency")
        const uniqueRegular = unique.filter((p) => p.type === "Regular")

        newMap.set(dept, { emergency: [...uniqueEmergency], regular: [...uniqueRegular] })
      })
      return newMap
    })
  }, [])

  const handleExportCSV = useCallback(() => {
    const allPatients: Patient[] = []
    departmentQueues.forEach((queue) => {
      allPatients.push(...queue.emergency, ...queue.regular)
    })
    const csv = exportToCSV(allPatients)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `mediqueue-${Date.now()}.csv`)
    link.click()
  }, [departmentQueues])

  const handleUndo = useCallback(() => {
    const lastPatient = undoStack.pop()
    if (lastPatient) {
      setDepartmentQueues((prev) => {
        const newMap = new Map(prev)
        const deptQueue = newMap.get(lastPatient.department)
        if (!deptQueue) return newMap

        if (lastPatient.type === "Emergency") {
          newMap.set(lastPatient.department, {
            ...deptQueue,
            emergency: deptQueue.emergency.filter((p) => p.id !== lastPatient.id),
          })
        } else {
          newMap.set(lastPatient.department, {
            ...deptQueue,
            regular: deptQueue.regular.filter((p) => p.id !== lastPatient.id),
          })
        }

        return newMap
      })

      setUsedRooms((prev) => {
        const rooms = new Set(prev)
        if (lastPatient.type === "Emergency") {
          rooms.delete(lastPatient.roomNo)
        }
        return rooms
      })
      // Unmark patient as treated
      setTreatedPatientIds((prevIds) => new Set([...prevIds].filter((id) => id !== lastPatient.id)))
    }
  }, [])

  const handleClearHistory = useCallback(() => {
    setShowClearAlert(true)
  }, [])

  const handleConfirmClear = useCallback(() => {
    treatmentHistory.clear()
    setHistoryRefresh((prev) => prev + 1)
    setTreatedPatientIds(new Set())
    if (typeof window !== "undefined") {
      localStorage.setItem("mediqueue-history", JSON.stringify([]))
    }
    setShowClearAlert(false)
  }, [treatmentHistory])

  const stats = useMemo(() => {
    let total = 0
    let emergency = 0
    departmentQueues.forEach((queue) => {
      total += queue.emergency.length + queue.regular.length
      emergency += queue.emergency.length
    })
    return { total, emergency }
  }, [departmentQueues])

  const allPatients: Patient[] = []
  departmentQueues.forEach((queue) => {
    allPatients.push(...queue.emergency, ...queue.regular)
  })

  const currentDeptQueue = departmentQueues.get(selectedDepartment) || { emergency: [], regular: [] }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader totalPatients={stats.total} emergencyCases={stats.emergency} patients={allPatients} />

        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === "queue" && (
            <div className="flex flex-col gap-8">
              <PatientIntake onAddPatient={handleAddPatient} availableRooms={usedRooms} existingPatients={allPatients} />

              <div className="flex gap-4 mb-4">
                <label className="text-sm font-medium text-white">Select Department:</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value as DepartmentType)}
                  className="px-4 py-2 bg-slate-800 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept} className="bg-slate-800 text-white">
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <WaitingList
                emergencyPatients={currentDeptQueue.emergency}
                regularPatients={currentDeptQueue.regular}
                onTreatEmergency={handleTreatEmergency}
                onTreatRegular={handleTreatRegular}
                canUndo={!undoStack.isEmpty()}
                onUndo={handleUndo}
                onUpdatePatient={handleUpdatePatient}
                department={selectedDepartment}
              />
            </div>
          )}

          {activeTab === "search" && (
            <SearchAnalytics
              patients={allPatients}
              onCleanDuplicates={handleCleanDuplicates}
              onExportCSV={handleExportCSV}
            />
          )}

          {activeTab === "history" && (
            <HistoryView
              history={treatmentHistory.getHistory()}
              onClearHistory={handleClearHistory}
              refreshTrigger={historyRefresh}
            />
          )}
        </div>

        {showConfetti && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="fixed inset-0 pointer-events-none flex items-center justify-center"
          >
            <div className="text-6xl">🎉</div>
          </motion.div>
        )}

        {showClearAlert && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 border border-white/20 rounded-xl p-6 max-w-sm mx-4"
            >
              <h3 className="text-xl font-bold text-white mb-2">Clear Treatment History</h3>
              <p className="text-white/70 mb-6">Are you sure you want to clear all treatment history? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearAlert(false)}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmClear}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                >
                  Clear History
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
