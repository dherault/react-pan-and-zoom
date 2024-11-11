import { useEffect } from 'react'

function useSafeGestures() {
  useEffect(() => {
    document.body.style.overscrollBehaviorX = 'none'
    document.body.style.overscrollBehaviorY = 'none'

    return () => {
      document.body.style.overscrollBehaviorX = 'auto'
      document.body.style.overscrollBehaviorY = 'auto'
    }
  }, [])
}

export default useSafeGestures
