import { Component } from 'react'

import { number, object, string } from 'prop-types'

class CustomImg extends Component {
  constructor(props) {
    super(props)

    this.state = {
      src: this.props.placeHolder,
    }

    this.isComponentMounted = false
  }

  componentDidMount = () => {
    this.isComponentMounted = true
    this.imageLoader(this.props)
  }

  componentDidUpdate = (prevProps) => {
    const { thumbnail, src } = this.props
    const srcHasChanged = prevProps.src !== src

    if (!this.isFinalImageLoaded(src) && thumbnail && srcHasChanged) {
      this.imageLoader({ thumbnail, src })
    }
  }

  componentWillUnmount = () => {
    this.isComponentMounted = false
  }

  setStateSafe = (value) => {
    if (this.isComponentMounted) {
      this.setState(value)
    }
  }

  shouldLoadFinalImage = (src) => {
    const isFinalImageLoaded = this.isFinalImageLoaded(this.props.src)
    const isLastSrc = this.props.src && src !== this.props.src

    return !isFinalImageLoaded && isLastSrc
  }

  isFinalImageLoaded = (src) => {
    return this.state.src === src
  }

  setErrorImage = () => {
    this.setStateSafe({ src: this.props.error })
  }

  imageLoader = ({ thumbnail, src }) => {
    if (thumbnail) {
      this.loadImage(thumbnail)
      return
    }

    if (src) {
      this.loadImage(src)
      return
    }
  }

  loadImage = (src) => {
    let newImg = new Image()
    newImg.onerror = this.setErrorImage
    newImg.onload = () => {
      this.setStateSafe({ src: src })
      if (this.shouldLoadFinalImage(src)) {
        this.loadImage(this.props.src)
      }
    }
    newImg.src = src
  }

  render = () => {
    const { alt, className, style, tabIndex } = this.props

    return (
      <img
        alt={alt}
        style={style}
        src={this.state.src}
        className={className}
        tabIndex={tabIndex}
        loading="lazy"
      />
    )
  }
}

CustomImg.propTypes = {
  src: string,
  thumbnail: string,
  style: object,
  className: string,
  placeHolder: string.isRequired,
  error: string.isRequired,
  alt: string,
  tabIndex: number,
}

export { CustomImg }
