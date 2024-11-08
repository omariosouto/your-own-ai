import "./style.css";

export const metadata = {
  title: 'DevSoutinho - RAG + Gemini',
  description: 'Proudly created with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
