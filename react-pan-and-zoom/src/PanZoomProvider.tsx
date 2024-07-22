import { type PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { type FullGestureState, useGesture } from '@use-gesture/react'

import type { MouseType, Padding, Xy } from './types'
import { detectTouchpad, detectTouchscreen } from './utils'
import PanZoomContext from './PanZoomContext'
import { ANIMATION_DURATION } from './constants'

type Props = PropsWithChildren<{
  forceMouseType?: MouseType
  initialZoom?: number
  initialPan?: Xy
  isPanBounded?: boolean
  panBoundPadding?: Padding
  panBoundDelay?: number
  isZoomBounded?: boolean
  minZoom?: number
  maxZoom?: number
  zoomStrength?: number
  onChange?: (pan: Xy, zoom: number) => void
}>

let panBoundAnimationStartTimeout: NodeJS.Timeout | null = null
let panBoundAnimationEndTimeout: NodeJS.Timeout | null = null

function PanZoomProvider({
  children,
  forceMouseType,
  initialPan = { x: 0, y: 0 },
  isPanBounded = true,
  panBoundPadding = { top: 0, right: 0, bottom: 0, left: 0 },
  panBoundDelay = 300,
  initialZoom = 1,
  isZoomBounded = true,
  minZoom = 0.2,
  maxZoom = 5,
  zoomStrength = 0.05,
  onChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const [mouseType, setMouseType] = useState<MouseType>(forceMouseType ?? detectTouchscreen() ? 'touchscreen' : 'mouse')
  const [zoom, setZoom] = useState(initialZoom)
  const [pan, setPan] = useState(initialPan)
  const [isPinching, setIsPinching] = useState(false)
  const [centered, setCentered] = useState(false)
  const [animated, setAnimated] = useState(false)

  const resetAnimation = useCallback(() => {
    if (panBoundAnimationStartTimeout) clearTimeout(panBoundAnimationStartTimeout)
    if (panBoundAnimationEndTimeout) clearTimeout(panBoundAnimationEndTimeout)

    setAnimated(false)
  }, [])

  const boundPan = useCallback((pan: Xy) => {
    if (!isPanBounded) return pan

    const containerClientX = containerRef.current?.clientWidth ?? 0
    const containerClientY = containerRef.current?.clientHeight ?? 0
    const contentScrollX = contentRef.current?.scrollWidth ?? 0
    const contentScrollY = contentRef.current?.scrollHeight ?? 0
    const top = panBoundPadding.top * zoom
    const bottom = -panBoundPadding.bottom * zoom + containerClientY - contentScrollY * zoom
    const left = panBoundPadding.left * zoom
    const right = -panBoundPadding.right * zoom + containerClientX - contentScrollX * zoom
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
    if (animated) return

    resetAnimation()

    setPan(pan => boundPan({
      x: pan.x - panDelta.x,
      y: pan.y - panDelta.y,
    }))
  }, [
    animated,
    resetAnimation,
    boundPan,
  ])

  const handleZoom = useCallback((delta: number, origin: Xy) => {
    if (animated) return

    resetAnimation()
    // let zoomFactor = Math.min(maxZoomStrength, Math.max(minZoomStrength, -delta)) * zoomStrength
    // const zoomFactor = -Math.sign(delta) * zoomStrength
    let nextZoom = zoom * (1 - Math.sign(delta) * zoomStrength)

    if (isZoomBounded) nextZoom = Math.min(maxZoom, Math.max(minZoom, nextZoom))

    const nextPan = {
      x: pan.x - origin.x * (nextZoom - zoom),
      y: pan.y - origin.y * (nextZoom - zoom),
    }
    const nextBoundedPan = boundPan(nextPan)

    setPan(nextPan)
    setZoom(nextZoom)

    const hasBounds = nextBoundedPan.x !== pan.x || nextBoundedPan.y !== pan.y

    if (hasBounds) {
      panBoundAnimationStartTimeout = setTimeout(() => {
        setAnimated(true)
        setPan(nextBoundedPan)

        panBoundAnimationEndTimeout = setTimeout(() => {
          setAnimated(false)
        }, ANIMATION_DURATION)
      }, panBoundDelay)
    }
  }, [
    zoomStrength,
    isZoomBounded,
    minZoom,
    maxZoom,
    panBoundDelay,
    animated,
    pan,
    zoom,
    resetAnimation,
    boundPan,
  ])

  const handleDrag = useCallback((state: FullGestureState<'drag'>) => {
    if (false) {
      console.log('drag', state)
    }
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

    handleZoom(-direction * distance, {
      x: (originX - left - pan.x) / zoom,
      y: (originY - top - pan.y) / zoom,
    })
  }, [
    pan,
    zoom,
    handleZoom,
  ])

  const handlePinchStart = useCallback(() => {
    setIsPinching(true)
  }, [])

  const handlePinchEnd = useCallback(() => {
    setIsPinching(false)
  }, [])

  useGesture(
    {
      onDrag: handleDrag,
      onWheel: handleWheel,
      onPinch: handlePinch,
      onPinchStart: handlePinchStart,
      onPinchEnd: handlePinchEnd,
    },
    {
      target: containerRef,
    }
  )

  // Initial pan bounding
  useEffect(() => {
    setTimeout(() => handlePan({ x: 0, y: 0 }), 17)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle change
  useEffect(() => {
    onChange?.(pan, zoom)
  }, [
    pan,
    zoom,
    onChange,
  ])

  useEffect(() => {

  }, [])

  const panZoomContextValue = useMemo(() => ({
    mouseType,
    zoom,
    pan,
    setZoom,
    setPan,
    containerRef,
    contentRef,
    animated,
  }), [
    mouseType,
    zoom,
    pan,
    animated,
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
