'use client'

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'
import { CloudinaryVideoPlayer } from "./cloudinary-video-player"
import { CLOUDINARY_CONFIG } from "../config/cloudinary"

interface Review {
  id: string
  text: string
  videoUrl?: string
  date: string
  status: 'processing' | 'approved' | 'rejected'
  rejectionReason?: string
  eagerTransformationComplete?: boolean
}

export function ProductReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [newReview, setNewReview] = useState("")
  const [uploadWidget, setUploadWidget] = useState<any>(null)
  const [isCloudinaryLoaded, setIsCloudinaryLoaded] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.cloudinary) {
      const script = document.createElement("script")
      script.src = "https://upload-widget.cloudinary.com/global/all.js"
      script.async = true
      script.onload = () => {
        setIsCloudinaryLoaded(true)
      }
      document.body.appendChild(script)

      return () => {
        document.body.removeChild(script)
      }
    } else if (window.cloudinary) {
      setIsCloudinaryLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (isCloudinaryLoaded && !uploadWidget) {
      initializeUploadWidget()
    }
  }, [isCloudinaryLoaded])

  const initializeUploadWidget = useCallback(() => {
    if (window.cloudinary && !uploadWidget) {
      const widget = window.cloudinary.createUploadWidget(
        {
          cloudName: CLOUDINARY_CONFIG.cloudName,
          clientAllowedFormats: 'video',
          uploadPreset: CLOUDINARY_CONFIG.uploadPreset,
          sources: ["local"],
          multiple: false,
          maxFiles: 1,
          resourceType: "video",
        },
        (error: any, result: any) => {
          if (error) {
            console.error("Error in upload widget:", error)
            return
          }
          if (result && result.event === "success") {
            const newReviewWithVideo: Review = {
              id: result.info.asset_id,
              text: newReview,
              videoUrl: result.info.public_id,
              date: new Date().toLocaleDateString(),
              status: 'processing'
            }
            setReviews(prevReviews => [newReviewWithVideo, ...prevReviews])
            setNewReview("")
            checkVideoStatus(result.info.asset_id, result.info.public_id)
          }
        }
      )
      setUploadWidget(widget)
    }
  }, [newReview])

  const checkVideoStatus = useCallback(async (assetId: string, publicId: string) => {
    const startTime = Date.now()
    const timeoutDuration = 360000 // 6 minutes in milliseconds

    const checkStatus = async () => {
      try {
        const response = await fetch('/api/moderate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ checkStatus: true, asset_id: assetId, public_id: publicId })
        })
        const data = await response.json()

        if (data.status === 'approved') {
          setReviews(prevReviews => 
            prevReviews.map(review => 
              review.id === assetId 
                ? { ...review, status: 'approved', eagerTransformationComplete: data.eagerTransformationComplete }
                : review
            )
          )
        } else if (data.status === 'rejected') {
          setReviews(prevReviews => 
            prevReviews.map(review => 
              review.id === assetId 
                ? { ...review, status: 'rejected', rejectionReason: data.message }
                : review
            )
          )
        } else if (Date.now() - startTime < timeoutDuration) {
          // If still processing and within timeout, check again after 5 seconds
          setTimeout(() => checkStatus(), 5000)
        } else {
          // Timeout reached
          setReviews(prevReviews => 
            prevReviews.map(review => 
              review.id === assetId 
                ? { ...review, status: 'rejected', rejectionReason: 'Processing timeout reached' }
                : review
            )
          )
        }
      } catch (error) {
        console.error("Error checking video status:", error)
      }
    }

    checkStatus()
  }, [])

  const handleUploadVideo = () => {
    if (uploadWidget) {
      uploadWidget.open()
    } else {
      console.error("Upload widget is not initialized")
    }
  }

  const handleSubmitTextReview = () => {
    if (!newReview.trim()) return

    const textOnlyReview: Review = {
      id: Date.now().toString(),
      text: newReview,
      date: new Date().toLocaleDateString(),
      status: 'approved'
    }
    setReviews(prevReviews => [textOnlyReview, ...prevReviews])
    setNewReview("")
  }

  return (
    <div className="mt-12 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Write a Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Share your experience with this product..."
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex gap-4">
            <Button onClick={handleSubmitTextReview}>Submit Text Review</Button>
            <Button variant="secondary" onClick={handleUploadVideo} disabled={!isCloudinaryLoaded}>
              Add Video Review
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Customer Reviews</h2>
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-6 space-y-4">
              {review.videoUrl && (
                <div>
                {review.status === 'processing' ? (
                    <div className="flex items-center justify-center h-full bg-gray-200">
                    <p>Processing video...</p>
                    </div>
                ) : review.status === 'approved' ? (
                    <CloudinaryVideoPlayer 
                    publicId={review.videoUrl} 
                    />
                ) : (
                    <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Video Rejected</AlertTitle>
                    <AlertDescription>
                        {review.rejectionReason || "The video was rejected during moderation."}
                    </AlertDescription>
                    </Alert>
                )}
                </div>
              )}
              <p className="text-lg">{review.text}</p>
              <div className="text-sm text-muted-foreground">
                Posted on {review.date}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

