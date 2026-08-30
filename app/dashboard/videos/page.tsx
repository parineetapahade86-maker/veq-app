"use client"

import { useState } from "react"
import { currentUser } from "@clerk/nextjs/server"
import { Video } from "lucide-react"
import FileUpload from "@/components/FileUpload"

export default function VideosPage() {
  const [videos, setVideos] = useState<string[]>([])

  const handleUploadComplete = (url: string) => {
    setVideos([...videos, url])
  }

  return (
    <section className="max-w-5xl mx-auto px-6 py-16 md:py-24">
      {/* Header */}
      <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-4">
        Workspace · Videos
      </p>
      <h1 className="font-display text-4xl md:text-5xl text-brown italic mb-4">
        Videos
      </h1>
      <p className="text-muted max-w-xl mb-12">
        Your video library. Upload and organize your important recordings.
      </p>

      {/* Upload Button */}
      <div className="mb-8">
        <FileUpload bucket="videos" onUploadComplete={handleUploadComplete} />
      </div>

      {/* Videos Grid */}
      {videos.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {videos.map((video, index) => (
            <div key={index} className="rounded-2xl border hairline bg-cream-deep/40 p-4">
              <video controls className="w-full rounded-lg">
                <source src={video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <p className="text-xs text-muted mt-2 font-mono">Video {index + 1}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border hairline border-dashed border-cream-deep p-12 text-center">
          <div className="w-16 h-16 bg-cream-deep rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-brown" />
          </div>
          <p className="text-muted mb-2">No videos uploaded yet.</p>
          <p className="text-xs text-muted">Upload your first video above.</p>
        </div>
      )}
    </section>
  )
}