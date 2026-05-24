import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Suivi',
  description: 'Suivi de dépenses Paloma & Arthur',
  applicationName: 'Suivi',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Suivi',
  },
  formatDetection: { telephone: false },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="bg-white antialiased">
        {/* Synchronous mask: covers page before React hydrates to prevent flash */}
        <script dangerouslySetInnerHTML={{ __html: `try{if(!sessionStorage.getItem('daily-msg-seen')){var m=document.createElement('div');m.id='__dm__';m.style.cssText='position:fixed;inset:0;background:#000;z-index:9999';document.body.appendChild(m)}}catch(e){}` }} />
        {children}
      </body>
    </html>
  )
}
