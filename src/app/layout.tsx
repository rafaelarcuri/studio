
import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/auth-context'
import { AppLayout } from '@/components/app-layout'

export const metadata: Metadata = {
  title: 'Vendas Ágil',
  description: 'Dashboard interativo para equipes de vendas acompanharem seus resultados.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </AuthProvider>
      </body>
    </html>
  )
}
