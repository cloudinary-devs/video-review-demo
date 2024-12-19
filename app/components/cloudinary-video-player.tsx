'use client'

import { useEffect, useRef, useState } from "react"
import { CLOUDINARY_CONFIG } from '../config/cloudinary'

interface CloudinaryVideoPlayerProps {
  publicId: string
}

export function CloudinaryVideoPlayer({ publicId }: CloudinaryVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)

  useEffect(() => {
    if (!window.cloudinary || !window.cloudinary.videoPlayer) {
      const coreScript = document.createElement("script")
      coreScript.src = "https://unpkg.com/cloudinary-core@latest/cloudinary-core-shrinkwrap.min.js"
      coreScript.async = true
      
      coreScript.onload = () => {
        const videoPlayerScript = document.createElement("script")
        videoPlayerScript.src = "https://unpkg.com/cloudinary-video-player@2.2.0/dist/cld-video-player.min.js"
        videoPlayerScript.async = true
        videoPlayerScript.onload = () => setIsScriptLoaded(true)
        videoPlayerScript.onerror = (error) => console.error("Error loading Cloudinary Video Player 2.2.0 script:", error)
        document.head.appendChild(videoPlayerScript)
      }
      
      coreScript.onerror = (error) => console.error("Error loading Cloudinary Core script:", error)
      document.head.appendChild(coreScript)

      const link = document.createElement("link")
      link.href = "https://unpkg.com/cloudinary-video-player@2.2.0/dist/cld-video-player.min.css"
      link.rel = "stylesheet"
      document.head.appendChild(link)

      return () => {
        document.head.removeChild(coreScript)
        const videoPlayerScript = document.querySelector('script[src="https://unpkg.com/cloudinary-video-player@2.2.0/dist/cld-video-player.min.js"]')
        if (videoPlayerScript) {
          document.head.removeChild(videoPlayerScript)
        }
        document.head.removeChild(link)
      }
    } else {
      setIsScriptLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (isScriptLoaded && videoRef.current && window.cloudinary && window.cloudinary.videoPlayer) {
      const player = window.cloudinary.videoPlayer(videoRef.current, {
        cloud_name: CLOUDINARY_CONFIG.cloudName,
        controls: true,
        chaptersButton: true,
        width: 600,
        sourceTypes: ['webm','mp4'],
        posterOptions: {aspect_ratio: "16:9", crop: "fill", gravity: "auto", width: 600}
      })

      player.source(
        publicId, {
        transformation: [{aspect_ratio: "16:9", crop: "fill", gravity: "auto", width: 600}],
        textTracks: {
          captions: {
            label: 'English (captions)',
            default: true,
            maxWords: 5,
          },
          subtitles: [
            {
              label: 'French',
              language: 'fr-FR',
            },
            {
              label: 'Spanish',
              language: 'es-ES',
            },
            {
              label: 'German',
              language: 'de-DE',
            }
          ]
        },
        chapters: true
      })

      

      return () => {
        player.dispose()
      }
    }
  }, [isScriptLoaded, publicId])

  return (
    <video 
      ref={videoRef}
      className="cld-video-player"
      controls
    />
  )
}

