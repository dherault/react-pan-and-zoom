import { PanZoom, PanZoomProvider } from 'react-pan-and-zoom'

function App() {
  return (
    <PanZoomProvider
      minZoom={0.05}
      initialZoom={0.25}
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
