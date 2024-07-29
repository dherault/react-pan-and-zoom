import { type RefObject, createContext } from 'react'

import type { MouseType, Xy } from '../types'

export type PanZoomContextType = {
  mouseType: MouseType
  zoom: number
  pan: Xy
  containerRef: RefObject<HTMLDivElement>
  contentRef: RefObject<HTMLDivElement>
  zoomIn: (intensity?: number) => void
  zoomOut: (intensity?: number) => void
  setZoom: (zoom?: number) => void
  setPan: (pan?: Xy) => void
}

export default createContext<PanZoomContextType>({
  mouseType: 'mouse',
  zoom: 1,
  pan: { x: 0, y: 0 },
  containerRef: {} as RefObject<HTMLDivElement>,
  contentRef: {} as RefObject<HTMLDivElement>,
  zoomIn: () => {},
  zoomOut: () => {},
  setZoom: () => {},
  setPan: () => {},
})
