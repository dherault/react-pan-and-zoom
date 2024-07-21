import { PanZoom, PanZoomProvider } from 'react-pan-and-zoom'

function App() {
  return (
    <PanZoomProvider
      initialZoom={0.25}
      panBoundPadding={{
        top: 256,
        bottom: 256,
        left: 64,
        right: 64,
      }}
    >
      <div className="max-h-screen max-w-screen flex flex-col">
        <h1>
          React pan and zoom
        </h1>
        <PanZoom containerClassName="w-full grow">
          <div className="grid grid-cols-2 w-[calc(3840px*2)]">
            <img src="/4k.jpg" />
            <img src="/4k.jpg" />
            <img src="/4k.jpg" />
            <img src="/4k.jpg" />
          </div>
        </PanZoom>
      </div>
    </PanZoomProvider>
  )
}

export default App
