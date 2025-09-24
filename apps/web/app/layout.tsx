import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from '@langchain-flow/ui'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LangChain Flow',
  description: 'Full-stack dev tool to manage repos, visualize flows, integrate LLMs, and automate workflows',
  keywords: ['LangChain', 'AI', 'Workflow', 'Automation', 'Development'],
  authors: [{ name: 'LangChain Flow Team' }],
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
