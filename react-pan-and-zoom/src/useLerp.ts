import { useCallback, useEffect, useState } from 'react'

import type { Xy } from './types'

let currentLerpId = 0

function useLerp(value: Xy, duration = 200) {
  const [lerpedValue, setLerpedValue] = useState(value)

  const lerp = useCallback((lerpId: number, startTime: number) => {
    let nextT = (Date.now() - startTime) / duration

    nextT = nextT * nextT * (3 - 2 * nextT)

    console.log('nextT', nextT)

    if (nextT < 0 || nextT >= 1) {
      setLerpedValue(value)

      return 1
    }

    setLerpedValue(lerpedValue => ({
      x: value.x * nextT + lerpedValue.x * (1 - nextT),
      y: value.y * nextT + lerpedValue.y * (1 - nextT),
    }))

    if (currentLerpId !== lerpId) return

    window.requestAnimationFrame(() => lerp(lerpId, startTime))
  }, [
    value,
    duration,
  ])

  useEffect(() => {
    currentLerpId++

    lerp(currentLerpId, Date.now())
  }, [
    value,
    lerp,
  ])

  return lerpedValue
}

export default useLerp
