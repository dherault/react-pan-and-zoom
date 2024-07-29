import { PanZoom, PanZoomProvider, usePanZoom } from 'react-pan-and-zoom'

function Controls() {
  return (
    <PanZoomProvider>
      <div className="absolute top-16 left-4 z-50">
        <ControlsActions />
      </div>
      <PanZoom containerClassName="grow">
        <img
          src="/climb.jpg"
          draggable={false}
        />
      </PanZoom>
    </PanZoomProvider>
  )
}

function ControlsActions() {
  const { resetPan, zoomIn, zoomOut, resetZoom } = usePanZoom()

  return (
    <div className="bg-white flex flex-col">
      <button
        type="button"
        className="flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 h-10 px-4 py-2"
        onClick={() => zoomIn()}
      >
        Zoom in
      </button>
      <button
        type="button"
        className="flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 h-10 px-4 py-2"
        onClick={() => zoomOut()}
      >
        Zoom out
      </button>
      <button
        type="button"
        className="flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 h-10 px-4 py-2"
        onClick={() => {
          resetZoom()
          resetPan()
        }}
      >
        Reset
      </button>
    </div>
  )
}

export default Controls
