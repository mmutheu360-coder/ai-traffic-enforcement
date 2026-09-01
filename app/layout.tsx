import './globals.css'

export const metadata = {
  title: 'AI Traffic Enforcement',
  description: 'Hackathon demo',
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <script src="//cdn.jsdelivr.net/npm/eruda"></script>
        <script dangerouslySetInnerHTML={{ __html: `eruda.init();` }} />
      </body>
    </html>
  )
}
