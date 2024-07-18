import { type PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react'

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
  minZoom = 0.25,
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

    const contentScrollX = contentRef.current?.scrollWidth ?? 0
    const contentScrollY = contentRef.current?.scrollHeight ?? 0
    const zoomFactor = (zoom - 1) / 2

    return {
      x: Math.min(panBoundPadding.left + contentScrollX * zoomFactor, Math.max(pan.x, -panBoundPadding.right + (wrapperRef.current?.clientWidth ?? 0) - contentScrollX * (1 + zoomFactor))),
      y: Math.min(panBoundPadding.top + contentScrollY * zoomFactor, Math.max(pan.y, -panBoundPadding.bottom + (wrapperRef.current?.clientHeight ?? 0) - contentScrollY * (1 + zoomFactor))),
    }
  }, [
    isPanBounded,
    panBoundPadding,
    zoom,
  ])

  console.log('pan', pan)
  const handlePan = useCallback((panDelta: Xy) => {
    setPan(pan => boundPan({
      x: pan.x - panDelta.x / zoom,
      y: pan.y - panDelta.y / zoom,
    }))
  }, [
    zoom,
    boundPan,
  ])

  const handleZoom = useCallback((delta: number, origin: Xy) => {
    let nextZoom = zoom * (1 - delta * zoomStrength)

    if (isZoomBounded) nextZoom = Math.min(maxZoom, Math.max(minZoom, nextZoom))

    console.log('nextZoom', nextZoom)
    // setPan(pan => ({
    //   x: pan.x + origin.x * (nextZoom - zoom),
    //   y: pan.y + origin.y * (nextZoom - zoom),
    // }))

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
    if (!wrapperRef.current) return

    state.event.preventDefault()

    console.log('pinch')
    const [direction] = state.direction
    const [distance] = state.distance
    const [originX, originY] = state.origin
    const { top, left } = wrapperRef.current.getBoundingClientRect()
    const origin = {
      x: -(pan.x + originX - left) / zoom,
      y: -(pan.y + originY - top) / zoom,
    }

    handleZoom(-direction * distance, origin)
    setPoint(origin)
  }, [
    pan,
    zoom,
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

  // Initial pan bounding
  useEffect(() => {
    setTimeout(() => handlePan({ x: 0, y: 0 }), 2)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
