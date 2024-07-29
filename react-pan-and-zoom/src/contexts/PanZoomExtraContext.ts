import { createContext } from 'react'

export type PanZoomExtraContextType = {
  animated: boolean
  visible: boolean
}

export default createContext<PanZoomExtraContextType>({
  animated: false,
  visible: false,
})
