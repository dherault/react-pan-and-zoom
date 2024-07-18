import { type PropsWithChildren, useCallback, useMemo, useRef, useState } from 'react'

import { type FullGestureState, useGesture } from '@use-gesture/react'

import type { MouseType, Padding, Xy } from './types'
import { detectTouchpad, detectTouchscreen } from './utils'
import PanZoomContext from './PanZoomContext'

type Props = PropsWithChildren<{
  forceMouseType?: MouseType
  initialZoom?: number
  initialPan?: Xy
  isPanBounded?: boolean
  panBoundPadding?: Padding
  isZoomBounded?: boolean
  minZoom?: number
  maxZoom?: number
  zoomStrength?: number
}>

function PanZoomProvider({
  children,
  forceMouseType,
  initialZoom = 1,
  initialPan = { x: 0, y: 0 },
  isPanBounded = true,
  panBoundPadding = { top: 0, right: 0, bottom: 0, left: 0 },
  isZoomBounded = true,
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

  const boundPan = useCallback((pan: Xy) => {
    if (!isPanBounded) return pan

    return {
      x: Math.min(panBoundPadding.left, Math.max(pan.x, -panBoundPadding.right + (wrapperRef.current?.clientWidth ?? 0) - (contentRef.current?.scrollWidth ?? 0))),
      y: Math.min(panBoundPadding.top, Math.max(pan.y, -panBoundPadding.bottom + (wrapperRef.current?.clientHeight ?? 0) - (contentRef.current?.scrollHeight ?? 0))),
    }
  }, [
    isPanBounded,
    panBoundPadding,
  ])

  const handlePan = useCallback((panDelta: Xy) => {
    setPan(pan => boundPan({
      x: pan.x - panDelta.x * zoom,
      y: pan.y - panDelta.y * zoom,
    }))
  }, [
    zoom,
    boundPan,
  ])

  const handleZoom = useCallback((delta: number, origin: Xy) => {
    console.log('delta, origin', delta, origin)

    let nextZoom = zoom * (1 - delta * zoomStrength)

    if (isZoomBounded) nextZoom = Math.min(maxZoom, Math.max(minZoom, nextZoom))

    setPan(pan => ({
      x: pan.x - origin.x + origin.x * nextZoom / zoom,
      y: pan.y - origin.y + origin.y * nextZoom / zoom,
    }))

    setZoom(nextZoom)
  }, [
    zoomStrength,
    isZoomBounded,
    minZoom,
    maxZoom,
    zoom,
    // boundPan,
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
    state.event.preventDefault()

    console.log('pinch')
    const [direction] = state.direction
    const [distance] = state.distance
    const [originX, originY] = state.origin

    handleZoom(-direction * distance, {
      x: originX,
      y: originY,
    })
    setPoint({
      x: originX,
      y: originY,
    })
  }, [
    // pan,
    handleZoom,
  ])

  useGesture(
    {
      onDrag: handleDrag,
      onWheel: handleWheel,
    },
    {
      target: wrapperRef,
    }
  )

  useGesture(
    {
      onPinch: handlePinch,
      onPinchStart: () => setIsPinching(true),
      onPinchEnd: () => setIsPinching(false),
    },
    {
      target: contentRef,
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
