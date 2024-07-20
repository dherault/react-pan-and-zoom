import { type CSSProperties, type PropsWithChildren } from 'react'

import usePanZoom from './usePanZoom'

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
  const { containerRef, contentRef, pan, zoom, point, containerPoint } = usePanZoom()

  return (
    <div
      ref={containerRef}
      className={containerClassName}
      style={{
        ...containerStyle,
        overflow: 'hidden',
        position: 'relative', // TODO remove
      }}
    >
      <div style={{ position: 'absolute', top: containerPoint.y - 8, left: containerPoint.x - 8, backgroundColor: 'blue', width: 16, height: 16, borderRadius: 99, zIndex: 99 }} />
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
