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
  initialZoom = 0.2,
  initialPan = { x: 0, y: 0 },
  isPanBounded = true,
  panBoundPadding = { top: 0, right: 0, bottom: 0, left: 0 },
  isZoomBounded = true,
  minZoom = 0.2,
  maxZoom = 5,
  zoomStrength = 0.005,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const [mouseType, setMouseType] = useState<MouseType>(forceMouseType ?? detectTouchscreen() ? 'touchscreen' : 'mouse')
  const [zoom, setZoom] = useState(initialZoom)
  const [pan, setPan] = useState(initialPan)
  const [isPinching, setIsPinching] = useState(false)
  const [point, setPoint] = useState<Xy>({ x: 0, y: 0 })
  const [wrapperPoint, setWrapperPoint] = useState<Xy>({ x: 0, y: 0 })
  const [centered, setCentered] = useState(false)

  const boundPan = useCallback((pan: Xy) => {
    if (!isPanBounded) return pan

    const wrapperClientX = wrapperRef.current?.clientWidth ?? 0
    const wrapperClientY = wrapperRef.current?.clientHeight ?? 0
    const contentScrollX = contentRef.current?.scrollWidth ?? 0
    const contentScrollY = contentRef.current?.scrollHeight ?? 0
    const zoomFactor = (zoom - 1) / 2
    const left = panBoundPadding.left + contentScrollX * zoomFactor
    const right = -panBoundPadding.right + wrapperClientX - contentScrollX * (1 + zoomFactor)
    const top = panBoundPadding.top + contentScrollY * zoomFactor
    const bottom = -panBoundPadding.bottom + wrapperClientY - contentScrollY * (1 + zoomFactor)
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

    if (!centered && renderedContentWidth < wrapperClientX) {
      boundedPan.x -= (wrapperClientX - renderedContentWidth) / 2
      setCentered(true)
    }
    if (!centered && renderedContentHeight < wrapperClientY) {
      boundedPan.y -= (wrapperClientY - renderedContentHeight) / 2
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
    let nextZoom = zoom * (1 - delta * zoomStrength)

    if (isZoomBounded) nextZoom = Math.min(maxZoom, Math.max(minZoom, nextZoom))

    if (false) {
      console.log('origin', origin)
    }
    // setPan(pan => ({
    //   x: pan.x + origin.x * (nextZoom / zoom - 1),
    //   y: pan.y + origin.y * (nextZoom / zoom - 1),
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
    console.log('drag', state)
  }, [])

  const handleWheel = useCallback((state: FullGestureState<'wheel'>) => {
    if (isPinching) return
    if (!forceMouseType && mouseType !== 'touchscreen') {
      setMouseType(detectTouchpad(state.event) ? 'touchpad' : 'mouse')
    }

    console.log('state.delta', state.delta)

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
    // const [originX, originY] = state.origin
    // const { top, left } = wrapperRef.current.getBoundingClientRect()
    const origin = {
      x: -pan.x,
      y: -pan.y,
    }

    setPoint(origin)
    setWrapperPoint({
      x: 0,
      y: 0,
    })

    if (false) {
      handleZoom(-direction * distance, origin)
    }
  }, [
    pan,
    // zoom,
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
    setTimeout(() => handlePan({ x: 0, y: 0 }), 16 * 3)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const panZoomContextValue = useMemo(() => ({
    mouseType,
    zoom,
    pan,
    point,
    wrapperPoint,
    setZoom,
    setPan,
    wrapperRef,
    contentRef,
  }), [
    mouseType,
    zoom,
    pan,
    point,
    wrapperPoint,
    setZoom,
    setPan,
  ])

  return (
    <PanZoomContext.Provider value={panZoomContextValue}>
      <pre style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: 'fit-content',
        padding: 16,
      }}
      >
        {JSON.stringify(pan)}
        {' - '}
        {zoom}
      </pre>
      {children}
    </PanZoomContext.Provider>
  )
}

export default PanZoomProvider
