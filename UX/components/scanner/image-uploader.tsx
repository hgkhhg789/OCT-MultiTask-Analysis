"use client"

import { useCallback, useState } from "react"
import { useAppState, type ScanResult } from "@/lib/store"
import { Upload, FileImage, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function ImageUploader() {
  const { setScannerMode, setCurrentScan, uploadedFile, setUploadedFile } = useAppState()
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFile = useCallback(
    (file: File) => {
      if (file.type.startsWith("image/")) {
        setUploadedFile(file)
      }
    },
    [setUploadedFile]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleProcess = useCallback(() => {
    if (!uploadedFile) return
    setScannerMode("processing")

    // Simulate AI processing
    setTimeout(() => {
      const simulatedResult: ScanResult = {
        id: `scan-${Date.now()}`,
        originalImage: URL.createObjectURL(uploadedFile),
        maskOverlay: "",
        confidence: Math.round((90 + Math.random() * 8) * 10) / 10,
        processingTime: Math.round((0.8 + Math.random() * 1.2) * 10) / 10,
        lesionTypes: [
          { name: "Drusen", color: "#f59e0b", percentage: Math.round(Math.random() * 40 * 10) / 10 },
          { name: "SRF", color: "#ef4444", percentage: Math.round(Math.random() * 25 * 10) / 10 },
          { name: "IRF", color: "#8b5cf6", percentage: Math.round(Math.random() * 20 * 10) / 10 },
        ],
        date: new Date().toISOString().split("T")[0],
        notes: "",
        doctorLabel: "",
        validationStatus: "pending",
      }
      setCurrentScan(simulatedResult)
      setScannerMode("result")
    }, 2500)
  }, [uploadedFile, setScannerMode, setCurrentScan])

  return (
    <div className="flex flex-col gap-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-all cursor-pointer",
          isDragOver
            ? "border-primary bg-primary/5"
            : uploadedFile
              ? "border-primary/40 bg-primary/5"
              : "border-border bg-card hover:border-primary/30 hover:bg-primary/5"
        )}
        onClick={() => {
          if (!uploadedFile) {
            document.getElementById("oct-file-input")?.click()
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Upload OCT image"
      >
        <input
          id="oct-file-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
          title="Upload OCT Image File" // Thêm dòng này để fix lỗi
          aria-label="Upload OCT Image File" // Thêm cả dòng này cho chắc cú với các Screen Reader
        />
        {uploadedFile ? (
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <FileImage className="h-7 w-7 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">{uploadedFile.name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {(uploadedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setUploadedFile(null)
              }}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted transition-colors"
              aria-label="Remove file"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Upload className="h-7 w-7 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Drop OCT image here or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports JPEG, PNG, TIFF formats
              </p>
            </div>
          </div>
        )}
      </div>

      {uploadedFile && (
        <button
          onClick={handleProcess}
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Run AI Analysis
        </button>
      )}
    </div>
  )
}
