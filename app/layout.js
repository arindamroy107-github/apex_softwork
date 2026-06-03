import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'ApexSoftworks — Software, Forged.',
  description: 'ApexSoftworks is a software studio in Utah engineering custom platforms, products, and AI systems. Software treated as a craft, not a commodity.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body className="bg-[#08080a] text-[#ede8e0] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
