export const isSmallResolution = () => {
  const EXTRA_HD_VIEW_PORT = 1440

  return window.innerWidth < EXTRA_HD_VIEW_PORT
}
