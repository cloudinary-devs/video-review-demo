interface Window {
    cloudinary: {
      createUploadWidget: (options: any, callback: (error: any, result: any) => void) => {
        open: () => void
        close: () => void
        destroy: () => void
      }
      videoPlayer: (element: HTMLVideoElement, options: any) => {
        source: (publicId: string, options?: any) => void
        dispose: () => void
      }
    }
  }
  
  