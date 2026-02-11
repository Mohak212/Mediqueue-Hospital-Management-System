"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Patient } from "@/lib/dsa"

interface RegistrationFormProps {
  onAddPatient: (patient: Patient) => void
}

const SEVERITY_LEVELS = [
  { value: 1, label: "1 - Routine" },
  { value: 2, label: "2 - Minor" },
  { value: 3, label: "3 - Urgent" },
  { value: 4, label: "4 - Severe" },
  { value: 5, label: "5 - CRITICAL" },
]

export function RegistrationForm({ onAddPatient }: RegistrationFormProps) {
  const [name, setName] = useState("")
  const [severity, setSeverity] = useState("1")
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsLoading(true)
    setTimeout(() => {
      const newPatient: Patient = {
        id: `patient-${Date.now()}`,
        name: name.trim(),
        severity: Number.parseInt(severity),
        notes: notes.trim(),
        timestamp: Date.now(),
        position: 0,
      }

      onAddPatient(newPatient)
      setName("")
      setSeverity("1")
      setNotes("")
      setIsLoading(false)
    }, 300)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border-r border-slate-200 w-80 p-6 overflow-y-auto flex flex-col gap-4"
    >
      <h2 className="text-xl font-bold text-slate-900">Add Patient</h2>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Patient Name</label>
        <Input
          type="text"
          placeholder="Enter patient name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Severity Level</label>
        <Select value={severity} onValueChange={setSeverity}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SEVERITY_LEVELS.map((level) => (
              <SelectItem key={level.value} value={level.value.toString()}>
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Special Notes</label>
        <textarea
          placeholder="Additional notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          rows={3}
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
        {isLoading ? "Adding..." : "Add Patient"}
      </Button>
    </form>
  )
}
