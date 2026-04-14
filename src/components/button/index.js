import Button, { ButtonWithFeedback as ButtonWithFeedbackHOC } from './Button'
import { ButtonOval } from './ButtonOval'
import { ButtonPrimary } from './ButtonPrimary'
import { ButtonQuaternary } from './ButtonQuaternary'
import { ButtonQuinary } from './ButtonQuinary'
import { ButtonRounded } from './ButtonRounded'
import { ButtonSecondary } from './ButtonSecondary'
import { ButtonTertiary } from './ButtonTertiary'

export const ButtonWithFeedback = ButtonWithFeedbackHOC
export default Button

export const ButtonV2 = {
  Primary: ButtonPrimary,
  Secondary: ButtonSecondary,
  Tertiary: ButtonTertiary,
  Quaternary: ButtonQuaternary,
  Quinary: ButtonQuinary,
  Rounded: ButtonRounded,
  Oval: ButtonOval,
}
