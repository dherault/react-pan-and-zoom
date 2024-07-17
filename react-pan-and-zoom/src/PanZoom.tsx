import {
  type CSSProperties,
  type PropsWithChildren,
  useCallback,
  useRef,
  useState,
} from 'react'
import { FullGestureState, useGesture } from '@use-gesture/react'

import type { MouseType, Xy } from './types'

import { detectTouchpad, detectTouchscreen } from './utils'

type Props = PropsWithChildren<{
  forceMouseType?: MouseType
  initialZoom?: number
  initialPan?: Xy
  wrapperClassName?: string
  wrapperStyle?: CSSProperties
  contentClassName?: string
  contentStyle?: CSSProperties
}>

function PanZoom({
  children,
  forceMouseType,
  initialZoom = 1,
  initialPan = { x: 0, y: 0 },
  wrapperClassName = '',
  wrapperStyle = {},
  contentClassName = '',
  contentStyle = {},
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null)

  const [mouseType, setMouseType] = useState<MouseType>(forceMouseType ?? detectTouchscreen() ? 'touchscreen' : 'mouse')
  const [zoom, setZoom] = useState(initialZoom)
  const [pan, setPan] = useState(initialPan)

  const handleDrag = useCallback((state: FullGestureState<'drag'>) => {
    console.log('drag')
  }, [])

  const handleWheel = useCallback((state: FullGestureState<'wheel'>) => {
    const isTouchpad = detectTouchpad(state.event)

    if (!forceMouseType && mouseType !== 'touchscreen') setMouseType(isTouchpad ? 'touchpad' : 'mouse')

    console.log('wheel')
  }, [
    forceMouseType,
    mouseType,
  ])

  const handlePinch = useCallback((state: FullGestureState<'pinch'>) => {
    console.log('pinch')
  }, [])

  useGesture(
    {
      onDrag: handleDrag,
      onWheel: handleWheel,
      onPinch: handlePinch,
    },
    {
      target: wrapperRef,
    }
  )

  return (
    <div
      ref={wrapperRef}
      className={wrapperClassName}
      style={{
        ...wrapperStyle,
        overflow: 'hidden',
      }}
    >
      <div
        className={contentClassName}
        style={contentStyle}
      >
        {children}
      </div>
    </div>
  )
}

export default PanZoom
