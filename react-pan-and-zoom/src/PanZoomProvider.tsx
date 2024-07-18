import { type PropsWithChildren, useCallback, useMemo, useRef, useState } from 'react'

import { type FullGestureState, useGesture } from '@use-gesture/react'

import type { MouseType, Padding, Xy } from './types'
import { detectTouchpad, detectTouchscreen } from './utils'
import PanZoomContext from './PanZoomContext'

type Props = PropsWithChildren<{
  forceMouseType?: MouseType
  initialZoom?: number
  initialPan?: Xy
  boundPan?: boolean
  boundPanPadding?: Padding
  boundZoom?: boolean
  minZoom?: number
  maxZoom?: number
  zoomStrength?: number
}>

function PanZoomProvider({
  children,
  forceMouseType,
  initialZoom = 1,
  initialPan = { x: 0, y: 0 },
  boundPan = true,
  boundPanPadding = { top: 0, right: 0, bottom: 0, left: 0 },
  boundZoom = true,
  minZoom = 0.5,
  maxZoom = 2,
  zoomStrength = 0.005,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const [mouseType, setMouseType] = useState<MouseType>(forceMouseType ?? detectTouchscreen() ? 'touchscreen' : 'mouse')
  const [zoom, setZoom] = useState(initialZoom)
  const [pan, setPan] = useState(initialPan)
  const [isPinching, setIsPinching] = useState(false)
  const [point, setPoint] = useState<Xy>({ x: 0, y: 0 })

  const handlePan = useCallback((panDelta: Xy) => {
    setPan(pan => {
      const nextPan = {
        x: pan.x - panDelta.x * zoom,
        y: pan.y - panDelta.y * zoom,
      }

      if (boundPan) {
        nextPan.x = Math.min(boundPanPadding.left, Math.max(nextPan.x, -boundPanPadding.right + (wrapperRef.current?.clientWidth ?? 0) - (contentRef.current?.scrollWidth ?? 0)))
        nextPan.y = Math.min(boundPanPadding.top, Math.max(nextPan.y, -boundPanPadding.bottom + (wrapperRef.current?.clientHeight ?? 0) - (contentRef.current?.scrollHeight ?? 0)))
      }

      return nextPan
    })
  }, [
    boundPan,
    boundPanPadding,
    zoom,
  ])

  const handleZoom = useCallback((delta: number, origin: Xy) => {
    console.log('delta, origin', delta, origin)

    let nextZoom = zoom * (1 - delta * zoomStrength)

    if (boundZoom) nextZoom = Math.min(maxZoom, Math.max(minZoom, nextZoom))

    setPan(pan => ({
      x: (nextZoom / zoom) * (pan.x - origin.x) + origin.x,
      y: (nextZoom / zoom) * (pan.y - origin.y) + origin.y,
    }))

    // x: nextScale / scale * (position.x - fixedPoint.x) +
    //        fixedPoint.x,
    //     y: nextScale / scale * (position.y - fixedPoint.y) +
    //        fixedPoint.y

    setZoom(nextZoom)

    // setPan(pan => ({
    //   x: pan.x + origin.x * (nextZoom - zoom),
    //   y: pan.y + origin.y * (nextZoom - zoom),
    // }))
  }, [
    zoomStrength,
    boundZoom,
    minZoom,
    maxZoom,
    zoom,
  ])

  const handleDrag = useCallback((state: FullGestureState<'drag'>) => {
    console.log('drag')
  }, [])

  const handleWheel = useCallback((state: FullGestureState<'wheel'>) => {
    if (isPinching) return

    console.log('wheel')
    const isTouchpad = detectTouchpad(state.event)

    if (!forceMouseType && mouseType !== 'touchscreen') setMouseType(isTouchpad ? 'touchpad' : 'mouse')

    handlePan({
      x: state.delta[0],
      y: state.delta[1],
    })
  }, [
    forceMouseType,
    isPinching,
    mouseType,
    handlePan,
  ])

  const handlePinch = useCallback((state: FullGestureState<'pinch'>) => {
    console.log('pinch', state)
    const [direction] = state.direction
    const [distance] = state.distance
    const [originX, originY] = state.origin

    handleZoom(-direction * distance, {
      x: -pan.x + originX,
      y: -pan.y + originY,
    })
    setPoint({
      x: -pan.x + originX,
      y: -pan.y + originY,
    })
  }, [
    pan,
    handleZoom,
  ])

  useGesture(
    {
      onDrag: handleDrag,
      onWheel: handleWheel,
      onPinch: handlePinch,
      onPinchStart: () => setIsPinching(true),
      onPinchEnd: () => setIsPinching(false),
    },
    {
      target: wrapperRef,
    }
  )

  const panZoomContextValue = useMemo(() => ({
    mouseType,
    zoom,
    pan,
    point,
    setZoom,
    setPan,
    wrapperRef,
    contentRef,
  }), [
    mouseType,
    zoom,
    pan,
    point,
    setZoom,
    setPan,
  ])

  return (
    <PanZoomContext.Provider value={panZoomContextValue}>
      {children}
    </PanZoomContext.Provider>
  )
}

export default PanZoomProvider
