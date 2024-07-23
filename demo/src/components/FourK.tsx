import { PanZoom, PanZoomProvider } from 'react-pan-and-zoom'

function FourK() {
  return (
    <PanZoomProvider
      minZoom={0.05}
      initialZoom={0.15}
    >
      <PanZoom containerClassName="grow">
        <div className="grid grid-cols-2 w-[calc(3840px*2)]">
          <img
            src="/4k.jpg"
            draggable={false}
          />
          <img
            src="/4k.jpg"
            draggable={false}
          />
          <img
            src="/4k.jpg"
            draggable={false}
          />
          <img
            src="/4k.jpg"
            draggable={false}
          />
        </div>
      </PanZoom>
    </PanZoomProvider>
  )
}

export default FourK
