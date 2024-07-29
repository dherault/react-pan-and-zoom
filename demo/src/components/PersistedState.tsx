import { useCallback, useRef } from 'react'
import { PanZoom, PanZoomProvider } from 'react-pan-and-zoom'

import usePersistedState from '../hooks/usePersistedState'

function PersistedState() {
  const [state, setState] = usePersistedState('state', { pan: { x: 0, y: 0 }, zoom: 1 })

  // Using a ref allows to avoid unnecessary re-renders when the state changes
  const initialState = useRef(state)

  const handleChange = useCallback((pan: { x: number, y: number }, zoom: number) => {
    setState({ pan, zoom })
  }, [
    setState,
  ])

  return (
    <PanZoomProvider
      initialPan={initialState.current.pan}
      initialZoom={initialState.current.zoom}
      onChange={handleChange}
      centerOnMount={false}
    >
      <PanZoom containerClassName="grow">
        <div className="flex flex-col select-none">
          <div className="h-32 w-32 bg-blue-500 rounded self-end" />
          <h1 className="mt-8 text-4xl font-bold">
            React pan and zoom
          </h1>
          <div className="mt-4">
            Reload the page, the pan and zoom state should be persisted.
          </div>
          <div className="mt-8 h-32 w-32 bg-blue-500 rounded" />
        </div>
      </PanZoom>
    </PanZoomProvider>
  )
}

export default PersistedState
