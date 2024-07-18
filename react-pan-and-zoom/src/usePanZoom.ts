import { useContext } from 'react'

import PanZoomContext from './PanZoomContext'

function usePanZoom() {
  return useContext(PanZoomContext)
}

export default usePanZoom
