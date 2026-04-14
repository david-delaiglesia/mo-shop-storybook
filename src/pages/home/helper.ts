export const generateEventPayload = () => {
  return {
    device_pixel_ratio_web: window.devicePixelRatio,
    screen_outher_width_web: window.outerWidth,
    screen_inner_width_web: window.innerWidth,
    screen_inner_outher_width_ratio_web: window.outerWidth / window.innerWidth,
    screen_height_web: window.screen.height,
    screen_width_web: window.screen.width,
  }
}
