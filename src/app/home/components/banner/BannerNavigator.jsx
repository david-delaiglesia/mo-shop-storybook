import { Children, Fragment, PureComponent } from 'react'

import BannerIndexList from './BannerIndexList'
import { bool, func, node, number } from 'prop-types'

import Arrow from 'system-ui/arrow'
import { constants } from 'utils/constants'

const { CELL_WIDTH, MEDIAQUERIES } = constants

const SLIDE_TIME = 4000

const VIEW_PORTS = {
  [MEDIAQUERIES.MEDIUMVIEWPORT]: 3,
  [MEDIAQUERIES.LARGEVIEWPORT]: 4,
  [MEDIAQUERIES.HDVIEWPORT]: 5,
  [MEDIAQUERIES.EXTRAHDVIEWPORT]: 6,
}

class BannerNavigator extends PureComponent {
  autoPlay = undefined

  state = {
    position: 0,
  }

  constructor(props) {
    super(props)

    this.move = this.move.bind(this)
    this.moveForward = this.moveForward.bind(this)
    this.clickOnIndex = this.clickOnIndex.bind(this)
    this.clickForward = this.clickForward.bind(this)
    this.clickBackward = this.clickBackward.bind(this)
  }

  componentDidMount() {
    this.playSlider()

    window.addEventListener('resize', this.move)
  }

  componentDidUpdate() {
    if (this.props.isHighlightedGroupEnabled && this.props.shouldStopSlider) {
      this.stopSlider()
    }
  }

  componentWillUnmount() {
    clearInterval(this.autoPlay)
    window.removeEventListener('resize', this.move)
  }

  playSlider() {
    this.autoPlay = setInterval(this.moveForward, SLIDE_TIME)
  }

  moveForward() {
    const forward = 1
    this.moveToIndex(this.state.position + forward)
  }

  stopSlider() {
    clearInterval(this.autoPlay)
  }

  resetTimer() {
    this.stopSlider()
    this.playSlider()
  }

  moveToIndex(index) {
    this.setPosition(index, this.move)
  }

  move() {
    const translation = this.calculateTranslation(this.state.position)
    this.props.applyMovement(translation)
  }

  calculateTranslation(position) {
    return position * this.getMaxWidthByViewPort() * -1
  }

  getMaxWidthByViewPort() {
    const mediaQueries = Object.values(MEDIAQUERIES)
    const columnsCount = mediaQueries.reduce(this.getGreaterColumnCount, 0)
    const padding = 24

    return CELL_WIDTH * columnsCount - padding
  }

  getGreaterColumnCount(maxColumnCount, mediaQuery) {
    const match = window.matchMedia(mediaQuery).matches
    const currentColumnCount = VIEW_PORTS[mediaQuery]

    if (match && currentColumnCount > maxColumnCount) {
      return currentColumnCount
    }

    return maxColumnCount
  }

  setPosition(nextPosition, action) {
    const length = this.props.length
    const position = this.calcAbsoluteModule(nextPosition, length)
    this.setState({ position }, action)
  }

  calcAbsoluteModule(nextPosition, length) {
    return ((nextPosition % length) + length) % length
  }

  clickOnIndex(index) {
    this.resetTimer()
    this.moveToIndex(index)
  }

  clickForward() {
    this.resetTimer()
    this.moveForward()
  }

  clickBackward() {
    this.resetTimer()
    const backward = -1
    this.moveToIndex(this.state.position + backward)
  }

  render() {
    const { children, length } = this.props

    const isMoreThanOne = length > 1

    if (!isMoreThanOne) {
      return Children.only(this.props.children)
    }

    return (
      <Fragment>
        <Arrow
          direction="right"
          click={this.clickForward}
          isVisible={isMoreThanOne}
        />
        <Arrow
          direction="left"
          click={this.clickBackward}
          isVisible={isMoreThanOne}
        />

        {children}

        <BannerIndexList
          length={length}
          selected={this.state.position}
          clickOnIndex={this.clickOnIndex}
        />
      </Fragment>
    )
  }
}

BannerNavigator.propTypes = {
  children: node.isRequired,
  applyMovement: func.isRequired,
  length: number,
  shouldStopSlider: bool,
  isHighlightedGroupEnabled: bool,
}

export default BannerNavigator
