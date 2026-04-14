import Button, { ButtonWithFeedback } from '../button'
import Modal from '../modal'
import { bool, func, object, oneOfType, string } from 'prop-types'

import { withTranslate } from 'app/i18n/containers/i18n-provider'

import './assets/ModalInfo.css'

const ModalInfo = ({
  image,
  title,
  description,
  confirmButtonText,
  cancelButtonText,
  onConfirm,
  onCancel,
  onClose,
  confirmButtonFeedBack,
  datatest,
  t,
}) => (
  <div className="modal-info">
    <Modal onClose={onClose} datatest={datatest}>
      <img
        alt=""
        aria-hidden="true"
        className="modal-info__image"
        src={image}
      />
      <h3 className="modal-info__title title2-b">{t(title)}</h3>
      <p className="modal-info__description body1-r">{t(description)}</p>
      <div className="modal-info__confirm-button">
        {confirmButtonFeedBack ? (
          <ButtonWithFeedback text={t(confirmButtonText)} onClick={onConfirm} />
        ) : (
          <Button text={t(confirmButtonText)} onClick={onConfirm} />
        )}
      </div>
      {onCancel && cancelButtonText && (
        <div className="modal-info__cancel-button">
          <Button text={t(cancelButtonText)} onClick={onCancel} />
        </div>
      )}
    </Modal>
  </div>
)

ModalInfo.propTypes = {
  image: string,
  title: string.isRequired,
  description: oneOfType([string, object]).isRequired,
  confirmButtonText: string.isRequired,
  cancelButtonText: string,
  onConfirm: func.isRequired,
  onCancel: func,
  onClose: func,
  confirmButtonFeedBack: bool,
  datatest: string,
  t: func.isRequired,
}

ModalInfo.defaultProps = {
  datatest: 'modal-info',
}

export const PlainModalInfo = ModalInfo

export default withTranslate(ModalInfo)
