export const imageLoader = (src, onLoad, onError) => {
  let newImg = new Image()
  newImg.onerror = onError
  newImg.onload = onLoad
  newImg.src = src
}
