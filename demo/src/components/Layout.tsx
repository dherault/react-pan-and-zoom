import type { PropsWithChildren } from 'react'
import { useSafeGestures } from 'react-pan-and-zoom'
import { Link } from 'react-router-dom'

function Layout({ children }: PropsWithChildren) {
  useSafeGestures()

  return (
    <div className="h-screen flex flex-col">
      <div className="flex items-center gap-4">
        <h1 className="py-2 px-4 text-xl font-bold">
          React pan and zoom
        </h1>
        <Link
          to="/4k"
          className="text-blue-500 hover:underline"
        >
          4K images
        </Link>
        <Link
          to="/persisted-state"
          className="text-blue-500 hover:underline"
        >
          Persisted state
        </Link>
        <Link
          to="/pan-padding"
          className="text-blue-500 hover:underline"
        >
          Pan padding
        </Link>
        <Link
          to="/controls"
          className="text-blue-500 hover:underline"
        >
          Controls
        </Link>
      </div>
      {children}
    </div>
  )
}

export default Layout
