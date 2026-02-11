// Data Structures and Algorithms implementations for MediQueue

export interface Patient {
  id: string
  name: string
  age: number
  roomNo: string
  notes: string
  timestamp: number
  position: number // For animation purposes
  type: "Regular" | "Emergency"
  severity?: number // Optional, only used for Emergency type (1-10)
  department: "Cardiology" | "Orthopedics" | "General" // Department assignment
}

export const DEPARTMENTS = ["Cardiology", "Orthopedics", "General"] as const
export type DepartmentType = typeof DEPARTMENTS[number]

export const DEPARTMENT_COLORS = {
  Cardiology: { bg: "bg-red-950/40", border: "border-red-400/30", text: "text-red-300", icon: "❤️" },
  Orthopedics: { bg: "bg-purple-950/40", border: "border-purple-400/30", text: "text-purple-300", icon: "🦴" },
  General: { bg: "bg-cyan-950/40", border: "border-cyan-400/30", text: "text-cyan-300", icon: "🏥" },
}

export const SEVERITY_LEVELS = {
  10: { label: "Critical", color: "bg-red-900", textColor: "text-red-300", borderColor: "border-red-500" },
  9: { label: "Severe", color: "bg-red-800", textColor: "text-red-300", borderColor: "border-red-500" },
  8: { label: "High", color: "bg-orange-700", textColor: "text-orange-300", borderColor: "border-orange-500" },
  7: { label: "Urgent", color: "bg-orange-600", textColor: "text-orange-300", borderColor: "border-orange-500" },
  6: { label: "Moderate-High", color: "bg-yellow-700", textColor: "text-yellow-300", borderColor: "border-yellow-500" },
  5: { label: "Moderate", color: "bg-yellow-600", textColor: "text-yellow-300", borderColor: "border-yellow-500" },
  4: { label: "Fair", color: "bg-blue-700", textColor: "text-blue-300", borderColor: "border-blue-500" },
  3: { label: "Low", color: "bg-blue-600", textColor: "text-blue-300", borderColor: "border-blue-500" },
  2: { label: "Minor", color: "bg-green-700", textColor: "text-green-300", borderColor: "border-green-500" },
  1: { label: "Minimal", color: "bg-green-600", textColor: "text-green-300", borderColor: "border-green-500" },
}

export class PatientHashSet {
  private entries: Map<string, Patient> = new Map()

  add(patient: Patient): boolean {
    const key = `${patient.name.toLowerCase()}|${patient.age}`
    if (this.entries.has(key)) {
      return false
    }
    this.entries.set(key, patient)
    return true
  }

  has(name: string, age: number): boolean {
    const key = `${name.toLowerCase()}|${age}`
    return this.entries.has(key)
  }

  clear(): void {
    this.entries.clear()
  }

  getAll(): Patient[] {
    return Array.from(this.entries.values())
  }
}

export class PriorityQueue {
  private items: Patient[] = []

  enqueue(patient: Patient): void {
    this.items.push(patient)
    this.bubbleUp(this.items.length - 1)
  }

  dequeue(): Patient | undefined {
    if (this.items.length === 0) return undefined
    if (this.items.length === 1) return this.items.pop()

    const max = this.items[0]
    this.items[0] = this.items.pop()!
    this.bubbleDown(0)
    return max
  }

  peek(): Patient | undefined {
    return this.items[0]
  }

  getAll(): Patient[] {
    return [...this.items]
  }

  size(): number {
    return this.items.length
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2)
      if (this.compare(this.items[index], this.items[parentIndex]) > 0) {
        ;[this.items[index], this.items[parentIndex]] = [this.items[parentIndex], this.items[index]]
        index = parentIndex
      } else {
        break
      }
    }
  }

  private bubbleDown(index: number): void {
    while (true) {
      let smallest = index
      const leftChild = 2 * index + 1
      const rightChild = 2 * index + 2

      if (leftChild < this.items.length && this.compare(this.items[leftChild], this.items[smallest]) > 0) {
        smallest = leftChild
      }

      if (rightChild < this.items.length && this.compare(this.items[rightChild], this.items[smallest]) > 0) {
        smallest = rightChild
      }

      if (smallest !== index) {
        ;[this.items[index], this.items[smallest]] = [this.items[smallest], this.items[index]]
        index = smallest
      } else {
        break
      }
    }
  }

  private compare(a: Patient, b: Patient): number {
    // Emergency patients always come before Regular patients
    if (a.type === "Emergency" && b.type !== "Emergency") return 1
    if (a.type !== "Emergency" && b.type === "Emergency") return -1

    // If both are Emergency, sort by severity (higher severity first = 10 > 1)
    if (a.type === "Emergency" && b.type === "Emergency") {
      const aSeverity = a.severity || 1
      const bSeverity = b.severity || 1
      if (aSeverity !== bSeverity) {
        return bSeverity - aSeverity // Higher severity first
      }
    }

    // Same type and severity: by timestamp (FIFO)
    return b.timestamp - a.timestamp
  }
}

export class CircularQueue {
  private items: Patient[] = []
  private front = 0
  private rear = -1
  private size = 0
  private maxSize = 1000

  enqueue(patient: Patient): void {
    if (this.size === this.maxSize) {
      throw new Error("Queue is full")
    }
    this.rear = (this.rear + 1) % this.maxSize
    this.items[this.rear] = patient
    this.size++
  }

  dequeue(): Patient | undefined {
    if (this.size === 0) return undefined
    const patient = this.items[this.front]
    this.front = (this.front + 1) % this.maxSize
    this.size--
    return patient
  }

  peek(): Patient | undefined {
    return this.size > 0 ? this.items[this.front] : undefined
  }

  getAll(): Patient[] {
    const result: Patient[] = []
    if (this.size > 0) {
      for (let i = 0; i < this.size; i++) {
        result.push(this.items[(this.front + i) % this.maxSize])
      }
    }
    return result
  }

  isEmpty(): boolean {
    return this.size === 0
  }

  getSize(): number {
    return this.size
  }
}

export class Stack {
  private items: Patient[] = []

  push(patient: Patient): void {
    this.items.push(patient)
  }

  pop(): Patient | undefined {
    return this.items.pop()
  }

  peek(): Patient | undefined {
    return this.items[this.items.length - 1]
  }

  isEmpty(): boolean {
    return this.items.length === 0
  }

  size(): number {
    return this.items.length
  }
}

export class TreatmentHistory {
  private history: Patient[] = []
  private maxSize = 10
  private treatedIds: Set<string> = new Set() // Track treated patient IDs to prevent duplicates

  addPatient(patient: Patient): boolean {
    if (this.treatedIds.has(patient.id)) {
      return false
    }
    this.treatedIds.add(patient.id)
    this.history.unshift(patient)
    if (this.history.length > this.maxSize) {
      const removed = this.history.pop()
      if (removed) {
        this.treatedIds.delete(removed.id)
      }
    }
    return true
  }

  getHistory(): Patient[] {
    return [...this.history]
  }

  clear(): void {
    this.history = []
    this.treatedIds.clear() // Clear the tracking set
  }
}

export function searchPatients(patients: Patient[], query: string, ageMin?: number, ageMax?: number): Patient[] {
  return patients.filter((patient) => {
    const nameMatch = patient.name.toLowerCase().includes(query.toLowerCase())
    const roomMatch = patient.roomNo.toLowerCase().includes(query.toLowerCase())
    const ageMatch = ageMin === undefined || ageMax === undefined || (patient.age >= ageMin && patient.age <= ageMax)
    return (nameMatch || roomMatch) && ageMatch
  })
}

// Utility function to calculate average wait time
export function calculateAverageWaitTime(patients: Patient[]): number {
  if (patients.length === 0) return 0
  const now = Date.now()
  const totalWaitTime = patients.reduce((sum, patient) => {
    return sum + (now - patient.timestamp)
  }, 0)
  return Math.round(totalWaitTime / patients.length / 1000 / 60) // Convert to minutes
}

export function calculateAverageSeverity(patients: Patient[]): number {
  if (patients.length === 0) return 0
  const totalSeverity = patients.reduce((sum, patient) => {
    return sum + (patient.type === "Emergency" ? patient.severity || 1 : 0)
  }, 0)
  const emergencyCount = patients.filter((p) => p.type === "Emergency").length
  return emergencyCount > 0 ? Math.round(totalSeverity / emergencyCount) : 0
}

export function exportToCSV(patients: Patient[]): string {
  const headers = ["Patient ID", "Name", "Age", "Room No", "Type", "Wait Time (min)", "Severity"]
  const now = Date.now()
  const rows = patients.map((patient) => [
    patient.id,
    patient.name,
    patient.age.toString(),
    patient.roomNo,
    patient.type,
    Math.round((now - patient.timestamp) / 1000 / 60).toString(),
    patient.type === "Emergency" ? (patient.severity || 1).toString() : "",
  ])

  const csv = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => (cell.includes(",") ? `"${cell}"` : cell)).join(",")),
  ].join("\n")

  return csv
}

export function generateRoomNo(usedRooms: Set<string>, isEmergency: boolean): string {
  if (!isEmergency) {
    return "" // No room assignment for regular patients
  }
  let roomNo = ""
  do {
    roomNo = String(Math.floor(Math.random() * 100) + 100)
  } while (usedRooms.has(roomNo))
  return roomNo
}
