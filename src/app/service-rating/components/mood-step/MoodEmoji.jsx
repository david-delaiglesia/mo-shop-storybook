import { PureComponent } from 'react'

import { withTranslate } from '../../../i18n/containers/i18n-provider'
import happyEmoji from './assets/face-happy.svg'
import neutralEmoji from './assets/face-neutral.svg'
import unhappyEmoji from './assets/face-unhappy.svg'
import { func, number, shape, string } from 'prop-types'

import { TAB_INDEX } from 'utils/constants'

import './styles/MoodEmoji.css'

const MOOD_EMOJI = {
  happy: happyEmoji,
  neutral: neutralEmoji,
  unhappy: unhappyEmoji,
}

class MoodEmoji extends PureComponent {
  constructor() {
    super()

    this.onClick = this.onClick.bind(this)
  }

  onClick() {
    const { rate, choice } = this.props
    const { id: answerId, label } = choice
    const answer = { answerId, label }

    rate(answer)
  }

  render() {
    const { name, t } = this.props

    return (
      <button
        className="mood-emoji"
        onClick={this.onClick}
        data-testid={`mood-emoji-${name}`}
        aria-label={t(`accessibility_${name}_mood`)}
        tabIndex={TAB_INDEX.ENABLED}
      >
        <img
          className="mood-emoji__image"
          src={MOOD_EMOJI[name]}
          alt={t(`accessibility_${name}_mood`)}
        />
      </button>
    )
  }
}

MoodEmoji.propTypes = {
  rate: func.isRequired,
  choice: shape({
    id: number.isRequired,
    label: string,
  }).isRequired,
  name: string.isRequired,
  t: func.isRequired,
}

const MoodEmojiWithTranslate = withTranslate(MoodEmoji)

export { MoodEmojiWithTranslate as MoodEmoji }
