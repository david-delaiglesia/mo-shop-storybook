import { connect } from 'react-redux'

import { openDeliveryArea } from '../../actions'
import { SelectDeliveryArea } from '../../components/select-delivery-area'
import { func, shape, string } from 'prop-types'
import { compose } from 'redux'

import { sendChangePostalCodeClickMetrics } from 'app/delivery-area/metrics'
import { withTranslate } from 'app/i18n/containers/i18n-provider'

const SelectDeliveryAreaContainer = ({
  openDeliveryArea,
  session,
  datatest,
  source,
}) => {
  const openDeliveryAreaWithMetrics = () => {
    sendChangePostalCodeClickMetrics({ session, source })
    openDeliveryArea()
  }

  return (
    <SelectDeliveryArea
      openDeliveryArea={openDeliveryAreaWithMetrics}
      postalCode={session.postalCode}
      datatest={datatest}
    />
  )
}

SelectDeliveryAreaContainer.propTypes = {
  source: string,
  openDeliveryArea: func.isRequired,
  session: shape({
    postalCode: string,
  }).isRequired,
  datatest: string,
}

const mapDispatchToProps = {
  openDeliveryArea,
}

const mapStateToProps = ({ session }) => ({ session })

const ComposedSelectDeliveryAreaContainer = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withTranslate,
)(SelectDeliveryAreaContainer)

export { ComposedSelectDeliveryAreaContainer as SelectDeliveryAreaContainer }
