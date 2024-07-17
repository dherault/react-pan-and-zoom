import { PanZoom } from 'react-pan-and-zoom'

function App() {
  return (
    <div className="max-h-screen max-w-screen flex flex-col">
      <h1>
        React pan and zoom
      </h1>
      <PanZoom wrapperClassName="w-full grow">
        <div className="grid grid-cols-2 w-[calc(3840px*2)]">
          <img src="/4k.jpg" />
          <img src="/4k.jpg" />
          <img src="/4k.jpg" />
          <img src="/4k.jpg" />
        </div>
      </PanZoom>
    </div>
  )
}

export default App
