"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

export interface LesionType {
  name: string
  color: string
  percentage: number
}

export type ValidationStatus = "pending" | "approved" | "edited"

export interface ScanResult {
  id: string
  originalImage: string
  maskOverlay: string
  confidence: number
  processingTime: number
  lesionTypes: LesionType[]
  date: string
  notes: string
  doctorLabel: string
  validationStatus: ValidationStatus
}

export interface Patient {
  id: string
  name: string
  age: number
  dob: string
  gender: string
  contact: string
  medicalNotes: string
  lastVisit: string
  totalScans: number
  medicalHistory: string[]
  scans: ScanResult[]
}

export interface DoctorProfile {
  name: string
  title: string
  avatarInitials: string
}

export type PageView = "scanner" | "patients"
export type ScannerMode = "upload" | "processing" | "result" | "review"

interface AppState {
  doctor: DoctorProfile
  currentPage: PageView
  setCurrentPage: (page: PageView) => void
  patients: Patient[]
  selectedPatientId: string | null
  setSelectedPatientId: (id: string | null) => void
  scannerMode: ScannerMode
  setScannerMode: (mode: ScannerMode) => void
  currentScan: ScanResult | null
  setCurrentScan: (scan: ScanResult | null) => void
  reviewScan: ScanResult | null
  reviewPatient: Patient | null
  saveScanToPatient: (patientId: string, scan: ScanResult) => void
  addNewPatient: (patient: Omit<Patient, "id" | "totalScans" | "scans">) => Patient
  viewHistoricalScan: (patientId: string, scanId: string) => void
  uploadedFile: File | null
  setUploadedFile: (file: File | null) => void
  newPatientModalOpen: boolean
  setNewPatientModalOpen: (open: boolean) => void
  compareScans: ScanResult[]
  setCompareScans: (scans: ScanResult[]) => void
  compareModalOpen: boolean
  setCompareModalOpen: (open: boolean) => void
}

const PLACEHOLDER_SCANS: ScanResult[] = [
  {
    id: "scan-001",
    originalImage: "",
    maskOverlay: "",
    confidence: 96.2,
    processingTime: 1.1,
    lesionTypes: [
      { name: "Drusen", color: "#f59e0b", percentage: 34.5 },
      { name: "SRF", color: "#ef4444", percentage: 18.2 },
      { name: "IRF", color: "#8b5cf6", percentage: 12.8 },
    ],
    date: "2026-02-20",
    notes: "Moderate drusen with subretinal fluid detected",
    doctorLabel: "Wet AMD with active SRF",
    validationStatus: "approved",
  },
  {
    id: "scan-002",
    originalImage: "",
    maskOverlay: "",
    confidence: 94.8,
    processingTime: 1.3,
    lesionTypes: [
      { name: "Drusen", color: "#f59e0b", percentage: 28.1 },
      { name: "PED", color: "#10b981", percentage: 22.4 },
    ],
    date: "2026-01-15",
    notes: "Pigment epithelial detachment with associated drusen",
    doctorLabel: "PED secondary to dry AMD",
    validationStatus: "edited",
  },
  {
    id: "scan-003",
    originalImage: "",
    maskOverlay: "",
    confidence: 97.5,
    processingTime: 0.9,
    lesionTypes: [
      { name: "IRF", color: "#8b5cf6", percentage: 41.3 },
      { name: "SRF", color: "#ef4444", percentage: 15.6 },
    ],
    date: "2025-12-08",
    notes: "Significant intraretinal fluid accumulation",
    doctorLabel: "Active neovascular AMD",
    validationStatus: "approved",
  },
]

const INITIAL_PATIENTS: Patient[] = [
  {
    id: "P-1001",
    name: "Eleanor Vance",
    age: 67,
    dob: "1958-09-14",
    gender: "Female",
    contact: "+1 (555) 234-8901",
    medicalNotes: "Regular anti-VEGF injections scheduled. Monitor for treatment response.",
    lastVisit: "2026-02-20",
    totalScans: 3,
    medicalHistory: ["Age-related macular degeneration", "Hypertension", "Type 2 Diabetes"],
    scans: [PLACEHOLDER_SCANS[0], PLACEHOLDER_SCANS[1], PLACEHOLDER_SCANS[2]],
  },
  {
    id: "P-1002",
    name: "Robert Ashford",
    age: 72,
    dob: "1953-05-22",
    gender: "Male",
    contact: "+1 (555) 876-3210",
    medicalNotes: "Post-vitrectomy. Elevated IOP managed with timolol.",
    lastVisit: "2026-02-18",
    totalScans: 2,
    medicalHistory: ["Diabetic retinopathy", "Glaucoma"],
    scans: [PLACEHOLDER_SCANS[1], PLACEHOLDER_SCANS[2]],
  },
  {
    id: "P-1003",
    name: "Miyako Tanaka",
    age: 58,
    dob: "1967-11-03",
    gender: "Female",
    contact: "+1 (555) 445-6789",
    medicalNotes: "Branch retinal vein occlusion resolved. Follow-up in 3 months.",
    lastVisit: "2026-02-10",
    totalScans: 1,
    medicalHistory: ["Retinal vein occlusion"],
    scans: [PLACEHOLDER_SCANS[2]],
  },
  {
    id: "P-1004",
    name: "David Chen",
    age: 45,
    dob: "1980-07-30",
    gender: "Male",
    contact: "+1 (555) 112-4455",
    medicalNotes: "High myopia with posterior staphyloma. Annual monitoring.",
    lastVisit: "2026-01-28",
    totalScans: 2,
    medicalHistory: ["High myopia", "Vitreous detachment"],
    scans: [PLACEHOLDER_SCANS[0], PLACEHOLDER_SCANS[1]],
  },
  {
    id: "P-1005",
    name: "Amara Osei",
    age: 61,
    dob: "1964-03-18",
    gender: "Female",
    contact: "+1 (555) 998-7766",
    medicalNotes: "CSR episode resolved spontaneously. No current treatment.",
    lastVisit: "2026-01-20",
    totalScans: 1,
    medicalHistory: ["Central serous chorioretinopathy"],
    scans: [PLACEHOLDER_SCANS[0]],
  },
]

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const doctor: DoctorProfile = {
    name: "Dr. John Doe",
    title: "Ophthalmologist",
    avatarInitials: "JD",
  }

  const [currentPage, setCurrentPage] = useState<PageView>("scanner")
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS)
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [scannerMode, setScannerMode] = useState<ScannerMode>("upload")
  const [currentScan, setCurrentScan] = useState<ScanResult | null>(null)
  const [reviewScan, setReviewScan] = useState<ScanResult | null>(null)
  const [reviewPatient, setReviewPatient] = useState<Patient | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [newPatientModalOpen, setNewPatientModalOpen] = useState(false)
  const [compareScans, setCompareScans] = useState<ScanResult[]>([])
  const [compareModalOpen, setCompareModalOpen] = useState(false)

  const saveScanToPatient = useCallback((patientId: string, scan: ScanResult) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId
          ? {
              ...p,
              scans: [scan, ...p.scans],
              totalScans: p.totalScans + 1,
              lastVisit: new Date().toISOString().split("T")[0],
            }
          : p
      )
    )
  }, [])

  const addNewPatient = useCallback(
    (patient: Omit<Patient, "id" | "totalScans" | "scans">): Patient => {
      const newPatient: Patient = {
        ...patient,
        id: `P-${1000 + patients.length + 1}`,
        totalScans: 0,
        scans: [],
      }
      setPatients((prev) => [...prev, newPatient])
      setSelectedPatientId(newPatient.id)
      return newPatient
    },
    [patients.length]
  )

  const viewHistoricalScan = useCallback(
    (patientId: string, scanId: string) => {
      const patient = patients.find((p) => p.id === patientId)
      const scan = patient?.scans.find((s) => s.id === scanId)
      if (patient && scan) {
        setReviewPatient(patient)
        setReviewScan(scan)
        setScannerMode("review")
        setCurrentPage("scanner")
      }
    },
    [patients]
  )

  return (
    <AppContext.Provider
      value={{
        doctor,
        currentPage,
        setCurrentPage,
        patients,
        selectedPatientId,
        setSelectedPatientId,
        scannerMode,
        setScannerMode,
        currentScan,
        setCurrentScan,
        reviewScan,
        reviewPatient,
        saveScanToPatient,
        addNewPatient,
        viewHistoricalScan,
        uploadedFile,
        setUploadedFile,
        newPatientModalOpen,
        setNewPatientModalOpen,
        compareScans,
        setCompareScans,
        compareModalOpen,
        setCompareModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppState() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useAppState must be used within an AppProvider")
  }
  return context
}
