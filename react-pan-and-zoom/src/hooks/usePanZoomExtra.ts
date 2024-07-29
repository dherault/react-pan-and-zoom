import { useContext } from 'react'

import PanZoomExtraContext from '../contexts/PanZoomExtraContext'

function usePanZoomExtra() {
  return useContext(PanZoomExtraContext)
}

export default usePanZoomExtra
