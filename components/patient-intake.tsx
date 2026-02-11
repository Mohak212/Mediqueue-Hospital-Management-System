"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Patient, DepartmentType } from "@/lib/dsa"
import { generateRoomNo, SEVERITY_LEVELS, DEPARTMENTS, DEPARTMENT_COLORS } from "@/lib/dsa"

interface PatientIntakeProps {
  onAddPatient: (patient: Patient, type: "Regular" | "Emergency") => void
  availableRooms: Set<string>
  existingPatients?: Patient[]
}

export function PatientIntake({ onAddPatient, availableRooms, existingPatients = [] }: PatientIntakeProps) {
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [assignedRoom, setAssignedRoom] = useState<string | null>(null)
  const [patientType, setPatientType] = useState<"Regular" | "Emergency">("Regular")
  const [severity, setSeverity] = useState(5)
  const [department, setDepartment] = useState<DepartmentType>("General")
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = (type: "Regular" | "Emergency") => {
    if (!name.trim() || !age.trim()) return
    
    setErrorMessage("")

    // Check for duplicate patient (same name and age)
    const isDuplicate = existingPatients.some(
      (p) => p.name.toLowerCase() === name.trim().toLowerCase() && p.age === Number.parseInt(age)
    )

    if (isDuplicate) {
      setErrorMessage(`Patient "${name.trim()}" with age ${age} already exists in the system!`)
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      const roomNo = generateRoomNo(availableRooms, type === "Emergency")
      if (type === "Emergency") {
        setAssignedRoom(roomNo)
      }

      const newPatient: Patient = {
        id: `patient-${Date.now()}`,
        name: name.trim(),
        age: Number.parseInt(age),
        roomNo,
        notes: notes.trim(),
        timestamp: Date.now(),
        position: 0,
        type,
        ...(type === "Emergency" && { severity }),
        department,
      }

      onAddPatient(newPatient, type)
      setName("")
      setAge("")
      setNotes("")
      setSeverity(5)
      setIsLoading(false)

      if (type === "Emergency") {
        setTimeout(() => setAssignedRoom(null), 3000)
      }
    }, 300)
  }

  return (
    <div className="space-y-6">
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Patient Registration</h2>

        <form className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value as DepartmentType)}
              className="w-full px-3 py-2 bg-slate-800 border border-white/20 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept} className="bg-slate-800 text-white">
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">Patient Name</label>
              <Input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">Age</label>
              <Input
                type="number"
                placeholder="Age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">Notes (Optional)</label>
            <textarea
              placeholder="Additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white placeholder:text-white/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              rows={2}
            />
          </div>

          {patientType === "Emergency" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">
                Emergency Severity:{" "}
                <span className="text-orange-300 font-semibold">
                  {severity} - {SEVERITY_LEVELS[severity as keyof typeof SEVERITY_LEVELS].label}
                </span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={severity}
                onChange={(e) => setSeverity(Number.parseInt(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-orange-400"
              />
              <div className="flex justify-between text-xs text-white/60 px-1">
                <span>1 - Minimal</span>
                <span>10 - Critical</span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="bg-rose-500/20 border border-rose-400/30 rounded-lg p-3 text-center">
              <p className="text-rose-300 text-sm font-medium">{errorMessage}</p>
            </div>
          )}

          {assignedRoom && (
            <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-lg p-3 text-center">
              <p className="text-white/70 text-sm">Room Assigned</p>
              <p className="text-2xl font-bold text-emerald-300">{assignedRoom}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Button
              type="button"
              onClick={() => {
                setPatientType("Regular")
                handleSubmit("Regular")
              }}
              disabled={isLoading}
              className={`text-white font-semibold whitespace-nowrap ${
                patientType === "Regular"
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  : "bg-gradient-to-r from-blue-500 to-cyan-500 opacity-50"
              }`}
            >
              {isLoading ? "Adding..." : "Add Regular"}
            </Button>
            <Button
              type="button"
              onClick={() => {
                setPatientType("Emergency")
                handleSubmit("Emergency")
              }}
              disabled={isLoading}
              className={`text-white font-semibold whitespace-nowrap ${
                patientType === "Emergency"
                  ? "bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600"
                  : "bg-gradient-to-r from-rose-500 to-orange-500 opacity-50"
              }`}
            >
              {isLoading ? "Adding..." : "Add Emergency"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
