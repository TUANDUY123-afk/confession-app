import "./globals.css"
import BottomNav from "@/components/BottomNav"
import { NotificationProvider } from "@/contexts/NotificationContext"
import { FloatingNotification } from "@/components/FloatingNotification"
import { FloatingNotificationButton } from "@/components/FloatingNotificationButton"
import React from "react"
import {
  Geist as V0_Font_Geist,
  Geist_Mono as V0_Font_Geist_Mono,
  Source_Serif_4 as V0_Font_Source_Serif_4,
} from "next/font/google"

const _geist = V0_Font_Geist({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})

const _geistMono = V0_Font_Geist_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})

const _sourceSerif_4 = V0_Font_Source_Serif_4({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${_geist.variable} ${_geistMono.variable} ${_sourceSerif_4.variable}`}>
      <body className="relative min-h-screen antialiased">
        <NotificationProvider>
          <FloatingNotificationButton />
          {children}
          <FloatingNotification />
          <BottomNav />
        </NotificationProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.app'
    };
