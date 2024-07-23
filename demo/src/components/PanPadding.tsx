import { PanZoom, PanZoomProvider } from 'react-pan-and-zoom'

function PanPadding() {
  return (
    <PanZoomProvider
      panBoundPadding={{
        top: 128,
        right: 128,
        bottom: 128,
        left: 128,
      }}
    >
      <PanZoom containerClassName="grow">
        <div className="w-[1024px] aspect-video border border-blue-500 text-blue-500 flex items-center justify-center select-none">
          I have 128px of pan padding!
        </div>
      </PanZoom>
    </PanZoomProvider>
  )
}

export default PanPadding
