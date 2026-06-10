import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { SmoothScrollProvider } from '@/lib/smooth-scroll'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

const cloudinaryBase = "https://res.cloudinary.com/dkmwom4df/image/upload";

export const metadata: Metadata = {
  title: 'Minds in Motion | Empowering Communities Through Chess',
  description: 'Minds in Motion is a nonprofit using chess to build critical thinking, resilience, and community among youth in Nepal, Ghana, and beyond.',
  generator: 'v0.app',
  icons: {
    icon: `${cloudinaryBase}/v1781012077/logo.jpg`,
    apple: `${cloudinaryBase}/v1781012077/logo.jpg`,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased bg-background">
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
