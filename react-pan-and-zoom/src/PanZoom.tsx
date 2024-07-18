import { type CSSProperties, type PropsWithChildren } from 'react'

import usePanZoom from './usePanZoom'

type Props = PropsWithChildren<{
  wrapperClassName?: string
  wrapperStyle?: CSSProperties
  contentClassName?: string
  contentStyle?: CSSProperties
}>

function PanZoom({
  children,
  wrapperClassName = '',
  wrapperStyle = {},
  contentClassName = '',
  contentStyle = {},
}: Props) {
  const { wrapperRef, contentRef, pan, zoom, point } = usePanZoom()

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
        ref={contentRef}
        className={contentClassName}
        style={{
          ...contentStyle,
          position: 'relative',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        <div style={{ position: 'absolute', top: point.y, left: point.x, backgroundColor: 'red', width: 4, height: 4 }} />
        {children}
      </div>
    </div>
  )
}

export default PanZoom
