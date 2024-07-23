export function detectTouchpad(event: any) {
  let isTouchpad = false

  if (event.wheelDeltaY) {
    if (event.wheelDeltaY === event.deltaY * -3) {
      isTouchpad = true
    }
  }
  else if (event.deltaMode === 0) {
    isTouchpad = true
  }

  return isTouchpad
}

export function detectTouchscreen() {
  return window.matchMedia('(pointer: coarse)').matches
}
