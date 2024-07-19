import { type Dispatch, type RefObject, type SetStateAction, createContext } from 'react'

import type { MouseType, Xy } from './types'

type PanZoomContext = {
  mouseType: MouseType
  zoom: number
  pan: Xy
  setZoom: Dispatch<SetStateAction<number>>
  setPan: Dispatch<SetStateAction<Xy>>
  wrapperRef: RefObject<HTMLDivElement>
  contentRef: RefObject<HTMLDivElement>
  point: Xy
  wrapperPoint: Xy
}

export default createContext<PanZoomContext>({
  mouseType: 'mouse',
  zoom: 1,
  pan: { x: 0, y: 0 },
  setZoom: () => {},
  setPan: () => {},
  wrapperRef: {} as RefObject<HTMLDivElement>,
  contentRef: {} as RefObject<HTMLDivElement>,
  point: { x: 0, y: 0 },
  wrapperPoint: { x: 0, y: 0 },
})
