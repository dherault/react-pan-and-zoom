import { type PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { type FullGestureState, useGesture } from '@use-gesture/react'

import type { MouseType, Padding, Xy } from './types'
import { detectTouchpad, detectTouchscreen } from './utils'
import PanZoomContext from './PanZoomContext'
// import useLerp from './useLerp'

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
  minZoomStrength?: number
  maxZoomStrength?: number
}>

function PanZoomProvider({
  children,
  forceMouseType,
  initialPan = { x: 0, y: 0 },
  isPanBounded = true,
  panBoundPadding = { top: 0, right: 0, bottom: 0, left: 0 },
  initialZoom = 1,
  isZoomBounded = true,
  minZoom = 0.2,
  maxZoom = 5,
  zoomStrength = 0.0333,
  minZoomStrength = -1.5,
  maxZoomStrength = 1.5,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const [mouseType, setMouseType] = useState<MouseType>(forceMouseType ?? detectTouchscreen() ? 'touchscreen' : 'mouse')
  const [zoom, setZoom] = useState(initialZoom)
  const [pan, setPan] = useState(initialPan)
  const [isPinching, setIsPinching] = useState(false)
  const [point, setPoint] = useState<Xy>({ x: 0, y: 0 })
  const [containerPoint, setWrapperPoint] = useState<Xy>({ x: 0, y: 0 })
  const [centered, setCentered] = useState(false)

  // const lerpedPan = useLerp(pan)

  // console.log('lerpedPan', lerpedPan)

  const boundPan = useCallback((pan: Xy) => {
    if (!isPanBounded) return pan

    const containerClientX = containerRef.current?.clientWidth ?? 0
    const containerClientY = containerRef.current?.clientHeight ?? 0
    const contentScrollX = contentRef.current?.scrollWidth ?? 0
    const contentScrollY = contentRef.current?.scrollHeight ?? 0
    const zoomFactor = (zoom - 1)
    const { top, left } = panBoundPadding
    const right = -panBoundPadding.right + containerClientX - contentScrollX * (1 + zoomFactor)
    const bottom = -panBoundPadding.bottom + containerClientY - contentScrollY * (1 + zoomFactor)
    const minX = Math.min(left, right)
    const maxX = Math.max(left, right)
    const minY = Math.min(top, bottom)
    const maxY = Math.max(top, bottom)
    const renderedContentWidth = contentScrollX * zoom
    const renderedContentHeight = contentScrollY * zoom
    const boundedPan = {
      x: Math.max(minX, Math.min(pan.x, maxX)),
      y: Math.max(minY, Math.min(pan.y, maxY)),
    }

    if (!centered && renderedContentWidth < containerClientX) {
      boundedPan.x += (containerClientX - renderedContentWidth) / 2
      setCentered(true)
    }
    if (!centered && renderedContentHeight < containerClientY) {
      boundedPan.y += (containerClientY - renderedContentHeight) / 2
      setCentered(true)
    }

    return boundedPan
  }, [
    isPanBounded,
    panBoundPadding,
    zoom,
    centered,
  ])

  const handlePan = useCallback((panDelta: Xy) => {
    setPan(pan => boundPan({
      x: pan.x - panDelta.x,
      y: pan.y - panDelta.y,
    }))
  }, [
    boundPan,
  ])

  const handleZoom = useCallback((delta: number, origin: Xy) => {
    const zoomFactor = Math.min(maxZoomStrength, Math.max(minZoomStrength, -delta)) * zoomStrength

    let nextZoom = zoom * (1 + zoomFactor)

    if (isZoomBounded) nextZoom = Math.min(maxZoom, Math.max(minZoom, nextZoom))

    setPan(pan => ({
      x: pan.x - origin.x * (nextZoom - zoom),
      y: pan.y - origin.y * (nextZoom - zoom),
    }))

    setZoom(nextZoom)
  }, [
    zoomStrength,
    minZoomStrength,
    maxZoomStrength,
    isZoomBounded,
    minZoom,
    maxZoom,
    zoom,
  ])

  const handleDrag = useCallback((state: FullGestureState<'drag'>) => {
    console.log('drag', state)
  }, [])

  const handleWheel = useCallback((state: FullGestureState<'wheel'>) => {
    state.event.stopPropagation()

    if (isPinching) return
    if (!forceMouseType && mouseType !== 'touchscreen') {
      setMouseType(detectTouchpad(state.event) ? 'touchpad' : 'mouse')
    }

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
    if (!containerRef.current) return

    state.event.preventDefault()
    state.event.stopPropagation()

    const [direction] = state.direction
    const [distance] = state.distance
    const [originX, originY] = state.origin
    const { top, left } = containerRef.current.getBoundingClientRect()

    // KEEP
    const origin = {
      x: (originX - left - pan.x) / zoom,
      y: (originY - top - pan.y) / zoom,
    }

    // DISCARD
    setPoint(origin)
    setWrapperPoint({
      x: originX - left,
      y: originY - top,
    })

    handleZoom(-direction * distance, origin)
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
      target: containerRef,
    }
  )

  // Initial pan bounding
  useEffect(() => {
    setTimeout(() => handlePan({ x: 0, y: 0 }), 16 * 3)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const panZoomContextValue = useMemo(() => ({
    mouseType,
    zoom,
    pan,
    point,
    containerPoint,
    setZoom,
    setPan,
    containerRef,
    contentRef,
  }), [
    mouseType,
    zoom,
    pan,
    point,
    containerPoint,
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
