import './globals.css'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Product Review Demo App',
  description: 'A full-stack app to demonstrate a video review UGC use case',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
          <nav className="bg-gray-800 text-white p-4">
            <ul className="flex space-x-4">
              <li><Link href="/" className="hover:text-gray-300">Bluetooth Adapter</Link></li>
            </ul>
          </nav>
          {children}
        <Script src="https://upload-widget.cloudinary.com/global/all.js" strategy="beforeInteractive" />
      </body>
    </html>
  )
}