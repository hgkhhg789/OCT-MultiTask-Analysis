"use client"

import { useState } from "react"
import { useAppState } from "@/lib/store"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { UserPlus } from "lucide-react"

export function NewPatientModal() {
  const { newPatientModalOpen, setNewPatientModalOpen, addNewPatient } = useAppState()

  const [name, setName] = useState("")
  const [dob, setDob] = useState("")
  const [gender, setGender] = useState("Male")
  const [contact, setContact] = useState("")
  const [medicalNotes, setMedicalNotes] = useState("")

  const computeAge = (dateStr: string) => {
    if (!dateStr) return 0
    const today = new Date()
    const birth = new Date(dateStr)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age
  }

  const handleSave = () => {
    if (!name.trim()) return
    addNewPatient({
      name: name.trim(),
      age: computeAge(dob),
      dob,
      gender,
      contact,
      medicalNotes,
      lastVisit: new Date().toISOString().split("T")[0],
      medicalHistory: [],
    })
    setNewPatientModalOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setName("")
    setDob("")
    setGender("Male")
    setContact("")
    setMedicalNotes("")
  }

  return (
    <Dialog open={newPatientModalOpen} onOpenChange={setNewPatientModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            New Patient
          </DialogTitle>
          <DialogDescription>
            Fill in the patient details below. An ID will be auto-generated.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="np-name" className="text-xs font-medium text-muted-foreground">
              Full Name <span className="text-destructive">*</span>
            </label>
            <input
              id="np-name"
              type="text"
              placeholder="e.g. Jane Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-1.5">
              <label htmlFor="np-dob" className="text-xs font-medium text-muted-foreground">
                Date of Birth
              </label>
              <input
                id="np-dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex w-28 flex-col gap-1.5">
              <label htmlFor="np-gender" className="text-xs font-medium text-muted-foreground">
                Gender
              </label>
              <select
                id="np-gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="np-contact" className="text-xs font-medium text-muted-foreground">
              Contact
            </label>
            <input
              id="np-contact"
              type="text"
              placeholder="Phone or email"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="np-notes" className="text-xs font-medium text-muted-foreground">
              Medical Notes
            </label>
            <textarea
              id="np-notes"
              rows={3}
              placeholder="Any relevant medical history or notes..."
              value={medicalNotes}
              onChange={(e) => setMedicalNotes(e.target.value)}
              className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <DialogFooter>
          <button
            onClick={() => {
              setNewPatientModalOpen(false)
              resetForm()
            }}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            Save Patient
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
