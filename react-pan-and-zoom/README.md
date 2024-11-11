# React pan and zoom

A React component to pan and zoom using a trackpad, mouse or touchscreen.

## Demo

[Demo](https://react-pan-and-zoom.web.app/).

## Introduction

This package differs from other packages in that it detects the mouse type and using a trackpad you can pan with two fingers and zoom with a pinch.

## Installation

```bash
npm install --save react-pan-and-zoom
```

## Usage

```jsx
import { PanZoomProvider, PanZoom, useSafeGestures } from 'react-pan-and-zoom'

function App() {
  // Disable swiping the history back and forward with two fingers
  useSafeGestures()

  return (
    <PanZoomProvider>
      <PanZoom>
        Pannable and zoomable content goes here
      </PanZoom>
    </PanZoomProvider>
  )
}
```

You can also import a hook called `usePanZoom` to access the pan and zoom state inside `PanZoomProvider`.

## Props

### PanZoomProvider

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| forceMouseType | 'touchpad' or 'touchscreen' or 'mouse' | automatic | Force a mouse type |
| initialPan | Xy | { x: 0, y: 0 } | The initial pan value |
| isPanBounded | boolean | true | Whether to bound panning  |
| panBoundPadding | Padding | { top: 0, bottom: 0, left: 0, right: 0 } | Padding for panning |
| panZoomDelay | number | 300 | The delay in ms for the pan to adjust after a zoom |
| centerOnMount | boolean | true | Whether to center on mount if the content is smaller than the container |
| centerOnMountDelay | number | 3 * 1000 / 60 | How long to way on mount before centering the content |
| initialZoom | number | 1 | The initial zoom value |
| isZoomBounded | boolean | true | Whether to bound zooming |
| minZoom | number | 0.5 | The minimum zoom value |
| maxZoom | number | 2 | The maximum zoom value |
| zoomStrength | number | 0.05 | The strength factor of the zoom |
| onChange | (pan: Xy, zoom: number) => void | undefined | The callback when the pan or zoom changes |

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
