"use client"

import { useState, useMemo } from "react"
import { useAppState, type Patient } from "@/lib/store"
import { cn } from "@/lib/utils"
import {
  Search,
  UserPlus,
  UserCheck,
  Check,
  Calendar,
  Phone,
  FileText,
  ScanLine,
  ChevronDown,
  ChevronUp,
  User,
} from "lucide-react"

type PatientMode = "existing" | "new"

interface NewPatientFormData {
  name: string
  dob: string
  gender: string
  contact: string
  medicalNotes: string
}

interface PatientContextPanelProps {
  newPatientForm: NewPatientFormData
  setNewPatientForm: (form: NewPatientFormData) => void
  patientMode: PatientMode
  setPatientMode: (mode: PatientMode) => void
}

function computeAge(dateStr: string) {
  if (!dateStr) return 0
  const today = new Date()
  const birth = new Date(dateStr)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

function PatientSummaryCard({ patient }: { patient: Patient }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 flex flex-col gap-2.5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {patient.name.split(" ").map((n) => n[0]).join("")}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{patient.name}</p>
          <p className="text-xs text-muted-foreground">{patient.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <User className="h-3 w-3 shrink-0" />
          <span>{patient.age}y, {patient.gender}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ScanLine className="h-3 w-3 shrink-0" />
          <span>{patient.totalScans} scans</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 shrink-0" />
          <span>{patient.lastVisit}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Phone className="h-3 w-3 shrink-0" />
          <span className="truncate">{patient.contact || "N/A"}</span>
        </div>
      </div>

      {patient.medicalHistory.length > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-between rounded-md bg-background/60 px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>Medical History ({patient.medicalHistory.length})</span>
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      )}

      {expanded && patient.medicalHistory.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {patient.medicalHistory.map((item) => (
            <span
              key={item}
              className="rounded-full bg-background px-2 py-0.5 text-xs text-foreground border border-border"
            >
              {item}
            </span>
          ))}
        </div>
      )}

      {patient.medicalNotes && (
        <div className="flex items-start gap-1.5 rounded-md bg-background/60 px-2 py-1.5">
          <FileText className="h-3 w-3 shrink-0 text-muted-foreground mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">{patient.medicalNotes}</p>
        </div>
      )}
    </div>
  )
}

export function PatientContextPanel({
  newPatientForm,
  setNewPatientForm,
  patientMode,
  setPatientMode,
}: PatientContextPanelProps) {
  const { patients, selectedPatientId, setSelectedPatientId } = useAppState()
  const [search, setSearch] = useState("")

  const filteredPatients = useMemo(
    () =>
      patients.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.id.toLowerCase().includes(search.toLowerCase())
      ),
    [patients, search]
  )

  const selectedPatient = patients.find((p) => p.id === selectedPatientId)

  const handleModeSwitch = (mode: PatientMode) => {
    setPatientMode(mode)
    if (mode === "new") {
      setSelectedPatientId(null)
    }
  }

  const updateField = (field: keyof NewPatientFormData, value: string) => {
    setNewPatientForm({ ...newPatientForm, [field]: value })
  }

  return (
    <div className="flex h-full flex-col">
      {/* Panel Header */}
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center gap-2 mb-3">
          <User className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Patient Context</h2>
        </div>

        {/* Toggle Tabs */}
        <div className="flex rounded-lg bg-muted p-0.5">
          <button
            onClick={() => handleModeSwitch("existing")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-all",
              patientMode === "existing"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <UserCheck className="h-3.5 w-3.5" />
            Existing
          </button>
          <button
            onClick={() => handleModeSwitch("new")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-all",
              patientMode === "new"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <UserPlus className="h-3.5 w-3.5" />
            New Patient
          </button>
        </div>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {patientMode === "existing" ? (
          <div className="flex flex-col gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-input bg-background py-2 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Selected Patient Summary */}
            {selectedPatient && <PatientSummaryCard patient={selectedPatient} />}

            {/* Patient List */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground px-1 mb-1">
                {selectedPatient ? "Switch Patient" : "Select Patient"}
              </span>
              {filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => setSelectedPatientId(patient.id)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-all",
                    selectedPatientId === patient.id
                      ? "bg-primary/8 ring-1 ring-primary/25"
                      : "hover:bg-muted"
                  )}
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground">
                    {patient.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{patient.name}</p>
                    <p className="text-xs text-muted-foreground">{patient.id} / {patient.age}y</p>
                  </div>
                  {selectedPatientId === patient.id && (
                    <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                  )}
                </button>
              ))}
              {filteredPatients.length === 0 && (
                <p className="py-4 text-center text-xs text-muted-foreground">No patients found</p>
              )}
            </div>
          </div>
        ) : (
          /* New Patient Inline Form */
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-xs font-medium text-muted-foreground">
                Fill in details below. Patient will be created on save.
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="inline-name" className="text-xs font-medium text-foreground">
                Full Name <span className="text-destructive">*</span>
              </label>
              <input
                id="inline-name"
                type="text"
                placeholder="e.g. Jane Smith"
                value={newPatientForm.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex gap-2.5">
              <div className="flex flex-1 flex-col gap-1.5">
                <label htmlFor="inline-dob" className="text-xs font-medium text-foreground">
                  Date of Birth
                </label>
                <input
                  id="inline-dob"
                  type="date"
                  value={newPatientForm.dob}
                  onChange={(e) => updateField("dob", e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              {newPatientForm.dob && (
                <div className="flex flex-col justify-end">
                  <span className="rounded-lg bg-muted px-2.5 py-2 text-sm font-medium text-foreground">
                    {computeAge(newPatientForm.dob)}y
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="inline-gender" className="text-xs font-medium text-foreground">
                Gender
              </label>
              <div className="flex rounded-lg bg-muted p-0.5">
                {["Male", "Female", "Other"].map((g) => (
                  <button
                    key={g}
                    onClick={() => updateField("gender", g)}
                    className={cn(
                      "flex-1 rounded-md py-1.5 text-xs font-medium transition-all",
                      newPatientForm.gender === g
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="inline-contact" className="text-xs font-medium text-foreground">
                Contact
              </label>
              <input
                id="inline-contact"
                type="text"
                placeholder="Phone or email"
                value={newPatientForm.contact}
                onChange={(e) => updateField("contact", e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="inline-notes" className="text-xs font-medium text-foreground">
                Medical Notes
              </label>
              <textarea
                id="inline-notes"
                rows={3}
                placeholder="Relevant medical history or notes..."
                value={newPatientForm.medicalNotes}
                onChange={(e) => updateField("medicalNotes", e.target.value)}
                className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {newPatientForm.name.trim() && (
              <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-2.5">
                <p className="text-xs text-primary font-medium">
                  Ready: &quot;{newPatientForm.name.trim()}&quot;
                  {newPatientForm.dob && ` / ${computeAge(newPatientForm.dob)}y`}
                  {newPatientForm.gender && ` / ${newPatientForm.gender}`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
