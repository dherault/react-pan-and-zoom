import { type PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { type FullGestureState, useGesture } from '@use-gesture/react'

import type { MouseType, Padding, Xy } from '../types'
import { ANIMATION_DURATION } from '../constants'
import { detectTouchpad, detectTouchscreen } from '../utils'
import PanZoomContext, { type PanZoomContextType } from '../contexts/PanZoomContext'
import type { PanZoomExtraContextType } from '../contexts/PanZoomExtraContext'
import PanZoomExtraContext from '../contexts/PanZoomExtraContext'

type Props = PropsWithChildren<{
  forceMouseType?: MouseType
  initialZoom?: number
  initialPan?: Xy
  isPanBounded?: boolean
  panBoundPadding?: Padding
  panBoundDelay?: number
  centerOnMount?: boolean
  centerOnMountDelay?: number
  isZoomBounded?: boolean
  minZoom?: number
  maxZoom?: number
  zoomStrength?: number
  onChange?: (pan: Xy, zoom: number) => void
}>

let panAnimationStartTimeout: NodeJS.Timeout | null = null
let panAnimationEndTimeout: NodeJS.Timeout | null = null
let zoomAnimationEndTimeout: NodeJS.Timeout | null = null

const mouseDetection: MouseType[] = []
const MAX_MOUSE_DETECTION = 16

function PanZoomProvider({
  children,
  forceMouseType,
  initialPan,
  isPanBounded = true,
  panBoundPadding = { top: 0, right: 0, bottom: 0, left: 0 },
  panBoundDelay = 300,
  centerOnMount = true,
  centerOnMountDelay = 3 * 1000 / 60,
  initialZoom,
  isZoomBounded = true,
  minZoom = 0.5,
  maxZoom = 2,
  zoomStrength = 0.05,
  onChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const [mouseType, setMouseType] = useState<MouseType>(forceMouseType ?? detectTouchscreen() ? 'touchscreen' : 'mouse')
  const [pan, setPan] = useState(initialPan ?? { x: 0, y: 0 },)
  const [zoom, setZoom] = useState(initialZoom ?? 1)
  const [isPinching, setIsPinching] = useState(false)
  const [shouldCenter, setShouldCenter] = useState(centerOnMount)
  const [panAnimated, setPanAnimated] = useState(false)
  const [zoomAnimated, setZoomAnimated] = useState(false)
  const [visible, setVisible] = useState(false)

  const detectMouseType = useCallback((event: any) => {
    if (forceMouseType || mouseType === 'touchscreen') return

    if (mouseDetection.length > MAX_MOUSE_DETECTION) mouseDetection.shift()

    mouseDetection.push(detectTouchpad(event) ? 'touchpad' : 'mouse')

    const touchpadCount = mouseDetection.filter(type => type === 'touchpad').length
    const mouseCount = mouseDetection.filter(type => type === 'mouse').length
    const nextMouseType = touchpadCount > mouseCount ? 'touchpad' : 'mouse'

    setMouseType(nextMouseType)

    return nextMouseType
  }, [
    forceMouseType,
    mouseType,
  ])

  const resetPanAnimation = useCallback(() => {
    if (panAnimationStartTimeout) clearTimeout(panAnimationStartTimeout)
    if (panAnimationEndTimeout) clearTimeout(panAnimationEndTimeout)
  }, [])

  const resetZoomAnimation = useCallback(() => {
    if (zoomAnimationEndTimeout) clearTimeout(zoomAnimationEndTimeout)
  }, [])

  const boundPan = useCallback((pan: Xy, nextZoom = zoom) => {
    if (!isPanBounded) return pan

    const containerClientX = containerRef.current?.clientWidth ?? 0
    const containerClientY = containerRef.current?.clientHeight ?? 0
    const contentScrollX = contentRef.current?.scrollWidth ?? 0
    const contentScrollY = contentRef.current?.scrollHeight ?? 0
    const top = panBoundPadding.top * nextZoom
    const bottom = -panBoundPadding.bottom * nextZoom + containerClientY - contentScrollY * nextZoom
    const left = panBoundPadding.left * nextZoom
    const right = -panBoundPadding.right * nextZoom + containerClientX - contentScrollX * nextZoom
    const minX = Math.min(left, right)
    const maxX = Math.max(left, right)
    const minY = Math.min(top, bottom)
    const maxY = Math.max(top, bottom)
    const renderedContentWidth = contentScrollX * nextZoom
    const renderedContentHeight = contentScrollY * nextZoom
    const boundedPan = {
      x: Math.max(minX, Math.min(pan.x, maxX)),
      y: Math.max(minY, Math.min(pan.y, maxY)),
    }

    if (typeof initialPan === 'undefined') {
      if (shouldCenter && boundedPan.x === left && renderedContentWidth < containerClientX) {
        boundedPan.x += (containerClientX - renderedContentWidth) / 2 - left
        setShouldCenter(false)
      }
      if (shouldCenter && boundedPan.y === top && renderedContentHeight < containerClientY) {
        boundedPan.y += (containerClientY - renderedContentHeight) / 2 - top
        setShouldCenter(false)
      }
    }

    return boundedPan
  }, [
    initialPan,
    isPanBounded,
    panBoundPadding,
    zoom,
    shouldCenter,
  ])

  const handlePan = useCallback((panDelta: Xy) => {
    if (panAnimated) return

    resetPanAnimation()
    setPanAnimated(false)
    setPan(pan => boundPan({
      x: pan.x - panDelta.x,
      y: pan.y - panDelta.y,
    }))
  }, [
    panAnimated,
    resetPanAnimation,
    boundPan,
  ])

  const handleZoom = useCallback((value: number, origin: Xy) => {
    if (panAnimated) return

    resetPanAnimation()
    setPanAnimated(false)

    const nextZoom = isZoomBounded ? Math.min(maxZoom, Math.max(minZoom, value)) : value
    const nextPan = {
      x: pan.x - origin.x * (nextZoom - zoom),
      y: pan.y - origin.y * (nextZoom - zoom),
    }
    const nextBoundedPan = boundPan(nextPan, nextZoom)

    setPan(nextPan)
    setZoom(nextZoom)

    const shouldBound = !(nextBoundedPan.x === nextPan.x && nextBoundedPan.y === nextPan.y)

    if (shouldBound) {
      panAnimationStartTimeout = setTimeout(() => {
        setPanAnimated(true)
        setPan(nextBoundedPan)

        panAnimationEndTimeout = setTimeout(() => {
          setPanAnimated(false)
        }, ANIMATION_DURATION)
      }, panBoundDelay)
    }
  }, [
    isZoomBounded,
    minZoom,
    maxZoom,
    panBoundDelay,
    panAnimated,
    pan,
    zoom,
    resetPanAnimation,
    boundPan,
  ])

  const handleDrag = useCallback((state: FullGestureState<'drag'>) => {
    if (mouseType === 'touchpad') return

    handlePan({
      x: -state.delta[0],
      y: -state.delta[1],
    })
  }, [
    mouseType,
    handlePan,
  ])

  const handleWheel = useCallback((state: FullGestureState<'wheel'>) => {
    state.event.stopPropagation()

    if (isPinching) return
    if (!containerRef.current) return

    const nextMouseType = detectMouseType(state.event)

    if (nextMouseType === 'touchpad') {
      handlePan({
        x: state.delta[0],
        y: state.delta[1],
      })
    }
    else if (nextMouseType === 'mouse') {
      const { top, left } = containerRef.current.getBoundingClientRect()
      const nextZoom = zoom * (1 - Math.sign(state.delta[1]) * zoomStrength)

      handleZoom(nextZoom, {
        x: (state.event.clientX - left - pan.x) / zoom,
        y: (state.event.clientY - top - pan.y) / zoom,
      })
    }
  }, [
    zoomStrength,
    pan,
    zoom,
    isPinching,
    handlePan,
    handleZoom,
    detectMouseType,
  ])

  const handlePinch = useCallback((state: FullGestureState<'pinch'>) => {
    if (!containerRef.current) return

    state.event.preventDefault()
    state.event.stopPropagation()

    const [direction] = state.direction
    const [originX, originY] = state.origin
    const { top, left } = containerRef.current.getBoundingClientRect()
    const nextZoom = zoom * (1 - Math.sign(-direction) * zoomStrength)
    const origin = {
      x: (originX - left - pan.x) / zoom,
      y: (originY - top - pan.y) / zoom,
    }

    handleZoom(nextZoom, origin)
  }, [
    zoomStrength,
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

  const handleSetPan = useCallback((pan = initialPan ?? { x: 0, y: 0 }) => {
    resetPanAnimation()
    setPanAnimated(true)

    setPan(boundPan(pan))

    panAnimationEndTimeout = setTimeout(() => {
      setPanAnimated(false)
    }, ANIMATION_DURATION)
  }, [
    initialPan,
    boundPan,
    resetPanAnimation,
  ])

  const handleSetZoom = useCallback((value = initialZoom ?? 1) => {
    resetZoomAnimation()
    setZoomAnimated(true)

    if (!containerRef.current) return

    const { top, left, width, height } = containerRef.current.getBoundingClientRect()
    const origin = {
      x: (width / 2 - left - pan.x) / zoom,
      y: (height / 2 - top - pan.y) / zoom,
    }

    handleZoom(value, origin)

    zoomAnimationEndTimeout = setTimeout(() => {
      setZoomAnimated(false)
    }, ANIMATION_DURATION)
  }, [
    pan,
    zoom,
    initialZoom,
    handleZoom,
    resetZoomAnimation,
  ])

  const handleReset = useCallback(() => {
    handleSetZoom()
    setTimeout(() => {
      handleSetPan()
    }, 2)
  }, [
    handleSetZoom,
    handleSetPan,
  ])

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
      eventOptions: {
        passive: false,
      },
    }
  )

  // Initial pan bounding
  useEffect(() => {
    setTimeout(() => {
      handlePan({ x: 0, y: 0 })
      setShouldCenter(false)
      setVisible(true)
    }, centerOnMountDelay)
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

  const panZoomContextValue = useMemo<PanZoomContextType>(() => ({
    mouseType,
    pan,
    zoom,
    containerRef,
    contentRef,
    setPan: handleSetPan,
    setZoom: handleSetZoom,
    zoomIn: () => handleSetZoom(zoom + 0.5),
    zoomOut: () => handleSetZoom(zoom - 0.5),
    resetPanZoom: handleReset,
  }), [
    mouseType,
    pan,
    zoom,
    handleSetPan,
    handleSetZoom,
    handleReset,
  ])

  const panZoomContextExtraValue = useMemo<PanZoomExtraContextType>(() => ({
    animated: panAnimated || zoomAnimated,
    visible,
  }), [
    panAnimated,
    zoomAnimated,
    visible,
  ])

  return (
    <PanZoomContext.Provider value={panZoomContextValue}>
      <PanZoomExtraContext.Provider value={panZoomContextExtraValue}>
        {children}
      </PanZoomExtraContext.Provider>
    </PanZoomContext.Provider>
  )
}

export default PanZoomProvider
