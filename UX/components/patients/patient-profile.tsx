"use client"

import { useAppState, type Patient, type ScanResult } from "@/lib/store"
import {
  X,
  Calendar,
  Activity,
  FileText,
  ExternalLink,
  User,
  Phone,
  GitCompareArrows,
  CheckCircle2,
  Pencil,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

export function PatientProfile({
  patient,
  onClose,
}: {
  patient: Patient
  onClose: () => void
}) {
  const { viewHistoricalScan, setCompareScans, setCompareModalOpen } = useAppState()
  const [compareSelection, setCompareSelection] = useState<ScanResult[]>([])
  const [compareMode, setCompareMode] = useState(false)

  const toggleScanSelection = (scan: ScanResult) => {
    setCompareSelection((prev) => {
      const exists = prev.find((s) => s.id === scan.id)
      if (exists) return prev.filter((s) => s.id !== scan.id)
      if (prev.length >= 2) return [prev[1], scan]
      return [...prev, scan]
    })
  }

  const handleCompare = () => {
    if (compareSelection.length !== 2) return
    const sorted = [...compareSelection].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    setCompareScans(sorted)
    setCompareModalOpen(true)
    setCompareMode(false)
    setCompareSelection([])
  }

  const validationIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="h-3 w-3 text-emerald-600" />
      case "edited":
        return <Pencil className="h-3 w-3 text-sky-600" />
      default:
        return <Clock className="h-3 w-3 text-amber-600" />
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
            {patient.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">{patient.name}</h2>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-sm text-muted-foreground">{patient.id}</span>
              <span className="text-muted-foreground/40">|</span>
              <span className="text-sm text-muted-foreground">{patient.age}y, {patient.gender}</span>
              {patient.dob && (
                <>
                  <span className="text-muted-foreground/40">|</span>
                  <span className="text-sm text-muted-foreground">DOB: {patient.dob}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Close patient profile"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Contact & Notes */}
      {(patient.contact || patient.medicalNotes) && (
        <div className="flex flex-col gap-2 rounded-lg bg-card border border-border p-3">
          {patient.contact && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-foreground">{patient.contact}</span>
            </div>
          )}
          {patient.medicalNotes && (
            <div className="flex items-start gap-2 text-sm">
              <FileText className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <span className="text-muted-foreground">{patient.medicalNotes}</span>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1 rounded-lg bg-card border border-border p-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Activity className="h-3.5 w-3.5" />
            <span className="text-xs">Total Scans</span>
          </div>
          <span className="text-lg font-semibold text-foreground">{patient.totalScans}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg bg-card border border-border p-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span className="text-xs">Last Visit</span>
          </div>
          <span className="text-lg font-semibold text-foreground">{patient.lastVisit}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg bg-card border border-border p-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            <span className="text-xs">Gender</span>
          </div>
          <span className="text-lg font-semibold text-foreground">{patient.gender}</span>
        </div>
      </div>

      {/* Medical History */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">Medical History</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {patient.medicalHistory.length > 0 ? (
            patient.medicalHistory.map((condition) => (
              <span
                key={condition}
                className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground"
              >
                {condition}
              </span>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">No medical history recorded</span>
          )}
        </div>
      </div>

      {/* Scan History Timeline */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">OCT Scan History</h3>
          {patient.scans.length >= 2 && (
            <button
              onClick={() => {
                setCompareMode(!compareMode)
                setCompareSelection([])
              }}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                compareMode
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <GitCompareArrows className="h-3.5 w-3.5" />
              {compareMode ? "Cancel" : "Compare"}
            </button>
          )}
        </div>

        {compareMode && (
          <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2">
            <span className="text-xs text-muted-foreground">
              Select 2 scans to compare ({compareSelection.length}/2)
            </span>
            <button
              onClick={handleCompare}
              disabled={compareSelection.length !== 2}
              className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              Compare
            </button>
          </div>
        )}

        {patient.scans.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {patient.scans.map((scan) => {
              const isSelected = compareSelection.some((s) => s.id === scan.id)
              return (
                <button
                  key={scan.id}
                  onClick={() => {
                    if (compareMode) {
                      toggleScanSelection(scan)
                    } else {
                      viewHistoricalScan(patient.id, scan.id)
                    }
                  }}
                  className={cn(
                    "group relative flex flex-col overflow-hidden rounded-lg border bg-card transition-all",
                    compareMode && isSelected
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:border-primary/40 hover:shadow-sm"
                  )}
                >
                  {/* Thumbnail */}
                  <div className="relative h-28 bg-gradient-to-b from-[#1a1a2e] via-[#0f3460] to-[#0a0a15]">
                    {/* Simulated retinal layers */}
                    <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 200 100" preserveAspectRatio="none">
                      {[20, 35, 50, 65, 80].map((y, i) => (
                        <path
                          key={i}
                          d={`M 0 ${y} Q 50 ${y - 8 + i * 2} 100 ${y + 4} T 200 ${y - 2}`}
                          stroke="rgba(100,180,220,0.5)"
                          fill="none"
                          strokeWidth="1"
                        />
                      ))}
                    </svg>
                    {/* Lesion dots */}
                    {scan.lesionTypes.map((l, i) => (
                      <div
                        key={i}
                        className="absolute rounded-full opacity-50"
                        style={{
                          backgroundColor: l.color,
                          width: `${12 + l.percentage * 0.6}px`,
                          height: `${8 + l.percentage * 0.4}px`,
                          left: `${20 + i * 30}%`,
                          top: `${30 + i * 10}%`,
                        }}
                      />
                    ))}
                    {/* Hover overlay */}
                    {!compareMode && (
                      <div className="absolute inset-0 flex items-center justify-center bg-foreground/0 group-hover:bg-foreground/20 transition-colors">
                        <ExternalLink className="h-5 w-5 text-background opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                    {/* Compare checkbox */}
                    {compareMode && (
                      <div className={cn(
                        "absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded border-2 transition-colors",
                        isSelected
                          ? "border-primary bg-primary"
                          : "border-background/60 bg-background/30"
                      )}>
                        {isSelected && (
                          <svg className="h-3 w-3 text-primary-foreground" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5 p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground">{scan.date}</span>
                      <span className={cn(
                        "text-xs font-medium",
                        scan.confidence >= 95 ? "text-emerald-600" : "text-amber-600"
                      )}>
                        {scan.confidence}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {validationIcon(scan.validationStatus)}
                      {scan.lesionTypes.map((l) => (
                        <div
                          key={l.name}
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: l.color }}
                          title={l.name}
                        />
                      ))}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {scan.lesionTypes.length} lesions
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-lg border border-dashed border-border py-8 text-sm text-muted-foreground">
            No scans recorded yet
          </div>
        )}
      </div>
    </div>
  )
}
