"use client"

import { useState } from "react"
import { Upload } from "lucide-react"
import { createClient } from "@/utils/supabase/client" // 

interface FileUploadProps {
    bucket: "documents" | "videos"
    onUploadComplete: (url: string, fileName: string) => void
}

export default function FileUpload({ bucket, onUploadComplete }: FileUploadProps) {
    const [uploading, setUploading] = useState(false)

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setUploading(true)

        try {
            const supabase = createClient()
            const fileExt = file.name.split(".").pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

            const { error } = await supabase.storage
                .from(bucket)
                .upload(fileName, file)

            if (error) throw error

            const { data } = supabase.storage.from(bucket).getPublicUrl(fileName)

            onUploadComplete(data.publicUrl, file.name)
            alert("✅ File uploaded successfully!")
        } catch (error) {
            console.error("Upload error:", error)
            alert("❌ Upload failed! Check console for details.")
        } finally {
            setUploading(false)
        }
    }

    return (
        <div>
            <input
                type="file"
                onChange={handleFileChange}
                disabled={uploading}
                accept={bucket === "documents" ? ".pdf,.doc,.docx,.txt" : "video/*"}
                className="hidden"
                id={`file-upload-${bucket}`}
            />
            <label
                htmlFor={`file-upload-${bucket}`}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl cursor-pointer transition-colors font-mono text-sm ${uploading
                    ? "bg-cream-deep text-muted cursor-not-allowed"
                    : "bg-brown text-cream-deep hover:bg-brown/90"
                    }`}
            >
                <Upload className="w-4 h-4" />
                {uploading ? "⏳ Uploading..." : `Upload ${bucket === "documents" ? "Document" : "Video"}`}
            </label>
        </div>
    )
}