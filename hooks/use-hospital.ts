"use client"

import { useEffect, useCallback, useState } from "react"
import { CircularQueue, TreatmentHistory, type Patient } from "@/lib/dsa"

export function useHospital() {
  const [regularPatients, setRegularPatients] = useState<Patient[]>([])
  const [emergencyPatients, setEmergencyPatients] = useState<Patient[]>([])
  const [treatmentHistory, setTreatmentHistory] = useState<TreatmentHistory>(() => new TreatmentHistory())
  const [opdQueue] = useState(() => new CircularQueue())

  useEffect(() => {
    const interval = setInterval(() => {
      const patient = opdQueue.peek()
      if (patient) {
        const elapsedSeconds = (Date.now() - patient.timestamp) / 1000
        const consultationDuration = 60 // 60 seconds per patient

        if (elapsedSeconds >= consultationDuration) {
          const treated = opdQueue.dequeue()
          if (treated) {
            // Update history
            treatmentHistory.addPatient(treated)
            // Update regular patients list
            setRegularPatients((prev) => prev.filter((p) => p.id !== treated.id))
          }
        }
      }
    }, 1000) // Check every 1 second

    return () => clearInterval(interval)
  }, [opdQueue, treatmentHistory])

  const addPatient = useCallback(
    (patient: Patient) => {
      if (patient.type === "Regular") {
        opdQueue.enqueue(patient)
        setRegularPatients((prev) => [...prev, patient])
      } else {
        setEmergencyPatients((prev) => {
          const updated = [...prev, patient]
          // Sort by severity descending
          return updated.sort((a, b) => (b.severity || 1) - (a.severity || 1))
        })
      }
    },
    [opdQueue],
  )

  const treatEmergency = useCallback(() => {
    if (emergencyPatients.length > 0) {
      const treated = emergencyPatients[0]
      treatmentHistory.addPatient(treated)
      setEmergencyPatients((prev) => prev.slice(1))
    }
  }, [emergencyPatients, treatmentHistory])

  const treatRegular = useCallback(() => {
    const patient = opdQueue.dequeue()
    if (patient) {
      treatmentHistory.addPatient(patient)
      setRegularPatients((prev) => prev.filter((p) => p.id !== patient.id))
    }
  }, [opdQueue, treatmentHistory])

  return {
    regularPatients,
    emergencyPatients,
    treatmentHistory: treatmentHistory.getHistory(),
    addPatient,
    treatEmergency,
    treatRegular,
    setRegularPatients,
    setEmergencyPatients,
  }
}
