import "./globals.css"
import BottomNav from "@/components/BottomNav"
import { NotificationProvider } from "@/contexts/NotificationContext"
import { FloatingNotification } from "@/components/FloatingNotification"
import { FloatingNotificationButton } from "@/components/FloatingNotificationButton"
import React from "react"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
