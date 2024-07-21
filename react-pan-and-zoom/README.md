# React pan and zoom

A React component to pan and zoom using a trackpad, mouse or touchscreen.

## Introduction

I couldn't find a pan and zoom component that handles trackpads, mouses and touchscreens. So I made one.
It differs from other packages in that it detects the mouse type and using a trackpad you can pan with two fingers and zoom with a pinch.

## Installation

```bash
npm install --save react-pan-and-zoom
```

## Usage

```jsx
import { PanZoomProvider, PanZoom } from 'react-pan-and-zoom'

function App() {
  return (
    <PanZoomProvider>
      <PanZoom>
        Pannable and zoomable content goes here
      </PanZoom>
    </PanZoomProvider>
  )
}
```

## Props

### PanZoomProvider

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| forceMouseType | 'touchpad' or 'touchscreen' or 'mouse' | automatic | Force a mouse type |
| initialPan | Xy | { x: 0, y: 0 } | The initial pan value |
| isPanBounded | boolean | true | Whether to bound panning  |
| panBoundPadding | Padding | { top: 0, bottom: 0, left: 0, right: 0 } | Padding for panning |
| initialZoom | number | 1 | The initial zoom value |
| isZoomBounded | boolean | true | Whether to bound zooming |
| minZoom | number | 0.2 | The minimum zoom value |
| maxZoom | number | 5 | The maximum zoom value |
| zoomStrength | number | 0.0333 | The strength factor of the zoom |
| minZoomStrength | number | -2 | The minimum zoom strength |
| maxZoomStrength | number | 2 | The maximum zoom strength  |

## PanZoom

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| containerClassName | string | empty string | The class name of the container |
| containerStyle | CSSProperties | empty object | The style of the container |
| contentClassName | string | empty string | The class name of the content |
| contentStyle | CSSProperties | empty object | The style of the content |

## License

MIT License

## Contributing

Yes please!
