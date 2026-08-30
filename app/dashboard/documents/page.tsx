"use client"

import { useState } from "react"
import { FileText } from "lucide-react"
import FileUpload from "@/components/FileUpload"

interface Document {
  id: string
  name: string
  url: string
  uploadedAt: string
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([
    // Demo data - baad mein Supabase se fetch karenge
    { id: "1", name: "Project Proposal.pdf", url: "#", uploadedAt: "2026-08-15" },
    { id: "2", name: "Q3 Report.docx", url: "#", uploadedAt: "2026-08-10" },
  ])

  const handleUploadComplete = (url: string, fileName: string) => {
    const newDoc: Document = {
      id: Date.now().toString(),
      name: fileName,
      url: url,
      uploadedAt: new Date().toISOString().split("T")[0]
    }
    setDocuments([...documents, newDoc])
  }

  return (
    <section className="max-w-5xl mx-auto px-6 py-16 md:py-24">
      {/* Header - Tumhare style mein */}
      <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-4">
        Workspace · Documents
      </p>
      <h1 className="font-display text-4xl md:text-5xl text-brown italic mb-4">
        Documents
      </h1>
      <p className="text-muted max-w-xl mb-12">
        Every document that matters to your work, organized and easy to find.
      </p>

      {/* Upload Button */}
      <div className="mb-8">
        <FileUpload bucket="documents" onUploadComplete={handleUploadComplete} />
      </div>

      {/* Documents List */}
      {documents.length > 0 ? (
        <div className="space-y-4">
          <h2 className="font-display text-2xl text-brown italic mb-6">
            Your Documents ({documents.length})
          </h2>
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="rounded-2xl border hairline bg-cream-deep/40 p-6 flex justify-between items-center hover:border-brown/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-cream-deep rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-brown" />
                </div>
                <div>
                  <h3 className="font-semibold text-brown">{doc.name}</h3>
                  <p className="text-xs text-muted mt-1">Uploaded on {doc.uploadedAt}</p>
                </div>
              </div>
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-brown hover:bg-cream-deep rounded-lg transition-colors font-mono text-sm"
              >
                View →
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border hairline border-dashed border-cream-deep p-12 text-center">
          <div className="w-16 h-16 bg-cream-deep rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-brown" />
          </div>
          <p className="text-muted mb-2">No documents uploaded yet.</p>
          <p className="text-xs text-muted">Upload your first document above.</p>
        </div>
      )}
    </section>
  )
}