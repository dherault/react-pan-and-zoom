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
  const { wrapperRef, contentRef, pan, zoom, point, wrapperPoint } = usePanZoom()

  return (
    <div
      ref={wrapperRef}
      className={wrapperClassName}
      style={{
        ...wrapperStyle,
        overflow: 'hidden',
        position: 'relative', // TODO remove
      }}
    >
      <div style={{ position: 'absolute', top: wrapperPoint.y - 8, left: wrapperPoint.x - 8, backgroundColor: 'blue', width: 16, height: 16, borderRadius: 99, zIndex: 99 }} />
      <div
        ref={contentRef}
        className={contentClassName}
        style={{
          ...contentStyle,
          width: 'fit-content',
          position: 'relative',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        <div style={{ position: 'absolute', top: point.y - 64, left: point.x - 64, backgroundColor: 'red', width: 128, height: 128, borderRadius: 99, zIndex: 999 }} />
        {children}
      </div>
    </div>
  )
}

export default PanZoom
