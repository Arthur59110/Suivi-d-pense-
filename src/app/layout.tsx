import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Suivi de dépenses',
  description: 'Gérez et suivez vos dépenses personnelles',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="h-full">
      <body className={`${inter.className} h-full bg-slate-100 antialiased`}>
        <Sidebar />
        <main className="pl-56 min-h-full">
          <div className="p-8">{children}</div>
        </main>
      </body>
    </html>
  )
}
