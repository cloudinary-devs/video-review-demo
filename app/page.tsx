import { Card, CardContent } from "@/components/ui/card"
import { ProductReviews } from "./components/product-reviews"
import { Cloudinary } from "@cloudinary/url-gen"
import { fill } from '@cloudinary/url-gen/actions/resize'
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity"
import { byRadius } from "@cloudinary/url-gen/actions/roundCorners"

export default function ProductPage() {

  const cld = new Cloudinary({
    cloud: {
      cloudName: 'demo'
    }
  })

  const myImage = cld.image('docs/bluetooth_dongle').
  resize(fill().width(450).height(450).gravity(autoGravity())).
    roundCorners(byRadius(5)).format('auto').quality('auto')
  const imgUrl = myImage.toURL()

  return (

    <div className="container mx-auto py-8">
      <div className="grid gap-6 lg:grid-cols-2 h-500">
      <Card className="flex items-center justify-center">
          <CardContent className="p-5">
            <div className="flex items-center justify-center w-full h-full">
              <div className="aspect-square relative overflow-hidden rounded-lg">
                <img src={imgUrl} width={450} height={450} alt="Bluetooth Dongle" className="object-contain w-full h-full"></img>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Bluetooth 5.0 USB Adapter</h1>
          <p className="text-lg text-muted-foreground">
            High-speed Bluetooth dongle compatible with Windows, Mac, and Linux. Perfect for connecting wireless devices to your computer.
          </p>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">$29.99</div>
            <div className="text-sm text-muted-foreground">Free shipping</div>
          </div>
        </div>
      </div>
      <ProductReviews />
    </div>
  )
}

