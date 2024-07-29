import { type CSSProperties, type PropsWithChildren } from 'react'

import { ANIMATION_DURATION } from '../constants'
import usePanZoom from '../hooks/usePanZoom'
import usePanZoomExtra from '../hooks/usePanZoomExtra'

type Props = PropsWithChildren<{
  containerClassName?: string
  containerStyle?: CSSProperties
  contentClassName?: string
  contentStyle?: CSSProperties
}>

function PanZoom({
  children,
  containerClassName = '',
  containerStyle = {},
  contentClassName = '',
  contentStyle = {},
}: Props) {
  const { containerRef, contentRef, pan, zoom } = usePanZoom()
  const { animated, visible } = usePanZoomExtra()

  return (
    <div
      ref={containerRef}
      className={containerClassName}
      style={{
        ...containerStyle,
        overflow: 'hidden',
        touchAction: 'none',
      }}
    >
      <div
        ref={contentRef}
        className={contentClassName}
        style={{
          ...contentStyle,
          width: 'fit-content',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          transition: animated ? `transform ${ANIMATION_DURATION}ms ease-out` : undefined,
          visibility: visible ? 'visible' : 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  )
}

export default PanZoom
