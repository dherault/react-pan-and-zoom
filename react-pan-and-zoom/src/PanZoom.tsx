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
  const { containerRef, contentRef, pan, zoom } = usePanZoom()

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
        {children}
      </div>
    </div>
  )
}

export default PanZoom
