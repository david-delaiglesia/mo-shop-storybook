import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import {
  Modal,
  ModalProps,
  ModalSize,
} from '@mercadona/mo.library.shop-ui/modal'

import { AddressMetrics } from 'app/address'
import { ADDRESS_ALERT_TYPE } from 'app/address/constants'
import { useFlowIdContext } from 'app/shared/flow-id'

interface AddressFormAlertContainerProps {
  alertType: ValueOf<typeof ADDRESS_ALERT_TYPE>
  town?: string
  onConfirm: () => void
  onCancel: () => void
}

export const AddressFormAlertContainer = ({
  alertType,
  town,
  onConfirm,
  onCancel,
}: AddressFormAlertContainerProps) => {
  const { t } = useTranslation()
  const { flowId } = useFlowIdContext()

  function defaultOnCancel() {
    AddressMetrics.addressAlertModifyButtonClick(flowId)
    onCancel()
  }

  function defaultOnConfirm() {
    AddressMetrics.addressAlertSaveButtonClick(flowId)
    onConfirm()
  }

  const alertsByType = useMemo((): Record<string, Omit<ModalProps, 'size'>> => {
    return {
      [ADDRESS_ALERT_TYPE.NO_DETAILS]: {
        title: t('address.alerts.incomplete.no_number_floor.title'),
        description: t('address.alerts.incomplete.no_number_floor.message'),
        primaryActionText: t('button.save_changes'),
        onPrimaryAction: onConfirm,
        secondaryActionText: t(
          'address.alerts.incomplete.no_number_floor.update',
        ),
        onSecondaryAction: onCancel,
        onClose: onCancel,
      },
      [ADDRESS_ALERT_TYPE.NO_STREET_NUMBER]: {
        title: t('address.alerts.incomplete.no_number.title'),
        description: t('address.alerts.incomplete.no_number.message'),
        primaryActionText: t('button.save_changes'),
        onPrimaryAction: onConfirm,
        secondaryActionText: t('address.alerts.incomplete.no_number.update'),
        onSecondaryAction: onCancel,
        onClose: onCancel,
      },
      [ADDRESS_ALERT_TYPE.NO_FLOOR_DOOR]: {
        title: t('address.alerts.incomplete.no_floor.title'),
        description: t('address.alerts.incomplete.no_floor.message'),
        primaryActionText: t('button.save_changes'),
        onPrimaryAction: onConfirm,
        secondaryActionText: t('address.alerts.incomplete.no_floor.update'),
        onSecondaryAction: onCancel,
        onClose: onCancel,
      },
      [ADDRESS_ALERT_TYPE.WRONG_TOWN]: {
        title: t('user_area.addresses.confirm_town.title'),
        primaryActionText: t('button.go_on'),
        onPrimaryAction: defaultOnConfirm,
        secondaryActionText: t('user_area.addresses.confirm_town.edit_btn'),
        onSecondaryAction: defaultOnCancel,
        onClose: defaultOnCancel,
        children: (
          <>
            <p>{t('user_area.addresses.confirm_town.message')}</p>
            <br />
            <p className="title2-b">{town}</p>
          </>
        ),
      },
    }
  }, [t])

  return <Modal size={ModalSize.SMALL} {...alertsByType[alertType]} />
}
