import { NextResponse } from 'next/server'

// This map will store the processing results temporarily
const processingResults = new Map<string, {
  moderation: { status: string, message: string },
  autoChaptering: { status: string, message: string },
  autoTranscription: { status: string, message: string },
  eagerTransformation: { status: string, message: string }
}>()

export async function POST(request: Request) {
  const data = await request.json()
  console.log("Received webhook data:", data)

  const { asset_id, public_id, notification_type } = data

  if (!processingResults.has(asset_id)) {
    processingResults.set(asset_id, {
      moderation: { status: 'pending', message: '' },
      autoChaptering: { status: 'pending', message: '' },
      autoTranscription: { status: 'pending', message: '' },
      eagerTransformation: { status: 'pending', message: '' }
    })
  }

  const result = processingResults.get(asset_id)!

  if (notification_type === 'moderation' || notification_type === 'moderation_summary') {
    const { moderation_status, moderation_kind } = data

    if (moderation_status === 'rejected') {
      result.moderation = { 
        status: 'rejected', 
        message: moderation_kind === 'aws_rek_video' 
          ? 'Your video was rejected due to unsuitable content'
          : 'Your video was rejected due to potential malware'
      }
    } else if (moderation_status === 'approved') {
      result.moderation = { status: 'approved', message: 'Video approved' }
    }
  } else if (notification_type === 'info') {
    const { info_kind, info_status } = data

    if (info_kind === 'auto_chaptering') {
      result.autoChaptering = { 
        status: info_status, 
        message: info_status === 'failed' ? data.info_data : 'Chaptering completed'
      }
    } else if (info_kind === 'auto_transcription') {
      result.autoTranscription = { 
        status: info_status, 
        message: info_status === 'failed' ? data.info_data : 'Transcription completed'
      }
    }
  } else if (notification_type === 'eager') {
    result.eagerTransformation = { status: 'complete', message: 'Eager transformation completed' }
  }

  processingResults.set(asset_id, result)

  // If it's a request from our frontend
  if (data.checkStatus) {
    const processingResult = processingResults.get(asset_id)

    if (!processingResult) {
      return NextResponse.json({ status: 'pending', message: 'Processing in progress' })
    }

    const { moderation, autoChaptering, autoTranscription, eagerTransformation } = processingResult

    if (moderation.status === 'rejected') {
      return NextResponse.json({ status: 'rejected', message: moderation.message })
    }

    if (moderation.status === 'approved' && 
        (autoChaptering.status === 'complete' || autoChaptering.status === 'failed') &&
        (autoTranscription.status === 'complete' || autoTranscription.status === 'failed') &&
        eagerTransformation.status === 'complete') {
      // Clear the result from our temporary storage
      processingResults.delete(asset_id)

      return NextResponse.json({ 
        status: 'approved',
        publicId: public_id,
        autoChaptering: autoChaptering.status === 'complete',
        autoTranscription: autoTranscription.status === 'complete',
        eagerTransformationComplete: true
      })
    }

    return NextResponse.json({ status: 'pending', message: 'Processing in progress' })
  }

  return NextResponse.json({ success: true })
}

