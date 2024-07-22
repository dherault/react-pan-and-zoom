import { useContext } from 'react'

import PanZoomContext from '../contexts/PanZoomContext'

function usePanZoom() {
  return useContext(PanZoomContext)
}

export default usePanZoom
