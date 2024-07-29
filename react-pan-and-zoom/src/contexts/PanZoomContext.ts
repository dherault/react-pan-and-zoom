import { type RefObject, createContext } from 'react'

import type { MouseType, Xy } from '../types'

export type PanZoomContextType = {
  mouseType: MouseType
  pan: Xy
  zoom: number
  containerRef: RefObject<HTMLDivElement>
  contentRef: RefObject<HTMLDivElement>
  zoomIn: (intensity?: number) => void
  zoomOut: (intensity?: number) => void
  setZoom: (zoom?: number) => void
  setPan: (pan?: Xy) => void
  resetPanZoom: () => void
}

export default createContext<PanZoomContextType>({
  mouseType: 'mouse',
  pan: { x: 0, y: 0 },
  zoom: 1,
  containerRef: {} as RefObject<HTMLDivElement>,
  contentRef: {} as RefObject<HTMLDivElement>,
  zoomIn: () => {},
  zoomOut: () => {},
  setZoom: () => {},
  setPan: () => {},
  resetPanZoom: () => {},
})
