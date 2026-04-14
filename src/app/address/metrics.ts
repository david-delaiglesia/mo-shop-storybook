import { Address } from './interfaces'

import { camelCaseToSnakeCase } from '@mercadona/mo.library.dashtil'

import { Tracker } from 'services/tracker'

export const AddressMetrics = {
  MAP_VIEW_TYPE: {
    SATELLITE: 'satelite',
    DEFAULT: 'default',
  },

  addressSearchView(flowId: string) {
    Tracker.sendInteraction('address_search_view', { flow_id: flowId })
  },

  deleteAddressClick(address: Pick<Address, 'id' | 'address' | 'detail'>) {
    Tracker.sendInteraction('delete_address_click', {
      address_id: address.id,
      address_name: `${address.address} ${address.detail || ''}`,
    })
  },

  makeDefaultAddressClick(address: Pick<Address, 'id' | 'address' | 'detail'>) {
    Tracker.sendInteraction('make_default_address_click', {
      address_id: address.id,
      address_name: `${address.address} ${address.detail || ''}`,
    })
  },

  alertNoServiceView(
    flowId: string,
    reason: 'postal_code' | 'country' | 'exclusion',
  ) {
    Tracker.sendInteraction('address_alert_no_service_view', {
      flow_id: flowId,
      no_service_reason: reason,
    })
  },

  alertNoServiceOkButtonClick(
    flowId: string,
    reason: 'postal_code' | 'country' | 'exclusion',
  ) {
    Tracker.sendInteraction('address_alert_no_service_ok_button_click', {
      flow_id: flowId,
      no_service_reason: reason,
    })
  },

  addressFormSaveClick(
    {
      flowId,
      street,
      number,
      detail,
      postalCode,
      town,
      comments,
    }: {
      flowId: string
      street: string
      number: string
      detail: string
      postalCode: string
      town: string
      comments: string
    },
    enteredManually: boolean,
  ) {
    Tracker.sendInteraction('address_form_save_click', {
      flow_id: flowId,
      address_street_name: street,
      address_street_number: number,
      address_floor_door: detail,
      address_zip_code: postalCode,
      address_town: town,
      address_more_info: comments,
      entered_manually: enteredManually,
    })
  },

  addressSaved(
    flowId: string,
    addressId: string,
    userFlow: 'autocomplete' | 'manual_form' | 'map_cp' | 'map_coordinates',
  ) {
    Tracker.sendInteraction('address_saved', {
      flow_id: flowId,
      address_id: addressId,
      user_flow: userFlow,
    })
  },

  addressMapView(
    flowId: string,
    {
      street,
      number,
      postalCode,
      town,
    }: { street: string; number: string; postalCode: string; town: string },
    userFlow: 'autocomplete' | 'manual_form' | 'map_cp' | 'map_coordinates',
  ) {
    Tracker.sendInteraction('address_map_view', {
      flow_id: flowId,
      address_street_name: street,
      address_street_number: number,
      address_zip_code: postalCode,
      address_town: town,
      user_flow: userFlow,
    })
  },

  addressMapBackClick(
    flowId: string,
    { latitude, longitude }: { latitude: string; longitude: string },
  ) {
    Tracker.sendInteraction('address_map_back_click', {
      flow_id: flowId,
      address_latitude: latitude,
      address_longitude: longitude,
    })
  },

  addressMapSaveClick(
    flowId: string,
    {
      postalCode,
      town,
      latitude,
      longitude,
    }: Pick<Address, 'postalCode' | 'town' | 'latitude' | 'longitude'>,
    addressOrigin: string,
    zoomLevel: number,
    userFlow: 'autocomplete' | 'manual_form' | 'map_cp' | 'map_coordinates',
  ) {
    Tracker.sendInteraction('address_map_save_click', {
      flow_id: flowId,
      address_latitude: latitude,
      address_longitude: longitude,
      address_zip_code: postalCode,
      address_town: town,
      address_origin: addressOrigin,
      zoom_level: zoomLevel,
      user_flow: userFlow,
    })
  },

  addressAlertSaveButtonClick(flowId: string) {
    Tracker.sendInteraction('address_alert_save_button_click', {
      flow_id: flowId,
    })
  },

  addressAlertModifyButtonClick(flowId: string) {
    Tracker.sendInteraction('address_alert_modify_button_click', {
      flow_id: flowId,
    })
  },

  addressNotFoundModalClick(flowId: string) {
    Tracker.sendInteraction('address_not_found_modal_click', {
      flow_id: flowId,
    })
  },

  addressMapChangeViewType(flowId: string, type: string) {
    Tracker.sendInteraction('address_map_change_view_type', {
      flow_id: flowId,
      type,
    })
  },

  addressMapLocateMeClick(flowId: string, latitude: string, longitude: string) {
    Tracker.sendInteraction('address_map_locate_me_click', {
      flow_id: flowId,
      address_latitude: latitude,
      address_longitude: longitude,
    })
  },

  manualAddressTownFilled(flowId: string, postalCode: string, town: string) {
    Tracker.sendInteraction('manual_address_town_filled', {
      flow_id: flowId,
      zip_code: postalCode,
      town,
    })
  },

  manualAddressTownEdited(flowId: string, postalCode: string, town: string) {
    Tracker.sendInteraction('manual_address_town_edited', {
      flow_id: flowId,
      zip_code: postalCode,
      town,
    })
  },

  addressMapPinDrop({
    flowId,
    userFlow,
    latitude,
    longitude,
    postalCode,
    locality,
    zoomLevel,
    continueButtonEnabled,
  }: {
    flowId: string
    userFlow: 'autocomplete' | 'manual_form' | 'map_cp' | 'map_coordinates'
    latitude: string
    longitude: string
    postalCode: string
    locality: string
    zoomLevel: number
    continueButtonEnabled: boolean
  }) {
    Tracker.sendInteraction(
      'address_map_pin_drop',
      camelCaseToSnakeCase({
        flowId,
        userFlow,
        latitude,
        longitude,
        postalCode,
        locality,
        zoomLevel,
        continueButtonEnabled,
      }),
    )
  },

  addressFormView({
    streetName,
    streetNumber,
    postalCode,
    town,
    comments,
    flowId,
  }: {
    streetName: string
    streetNumber: string
    postalCode: string
    town: string
    comments: string
    flowId: string
  }) {
    Tracker.sendInteraction(
      'address_form_view',
      camelCaseToSnakeCase({
        streetName,
        streetNumber,
        postalCode,
        town,
        comments,
        flowId,
      }),
    )
  },

  addressWebMapFakeUserClick(flowId: string) {
    Tracker.sendInteraction(
      'address_web_map_fake_user_click',
      camelCaseToSnakeCase({
        flowId,
      }),
    )
  },

  addressManualModeActivated(
    flowId: string,
    {
      streetName,
      streetNumber,
      zipCode,
      town,
    }: {
      streetName: string
      streetNumber: string
      zipCode: string
      town: string
    },
  ) {
    Tracker.sendInteraction(
      'address_manual_mode_activated',
      camelCaseToSnakeCase({ flowId, streetName, streetNumber, zipCode, town }),
    )
  },

  addressAlertIncompleteView(
    flowId: string,
    {
      streetNumber,
      floorDoor,
      alertOrigin,
    }: { streetNumber: string; floorDoor: string; alertOrigin: string },
  ) {
    Tracker.sendInteraction(
      'address_alert_incomplete_view',
      camelCaseToSnakeCase({
        flowId,
        streetNumber: streetNumber || 'incomplete',
        floorDoor: floorDoor || 'incomplete',
        alertOrigin,
      }),
    )
  },

  addressAlertIncompleteEditClick(flowId: string) {
    Tracker.sendInteraction(
      'address_alert_incomplete_edit_click',
      camelCaseToSnakeCase({
        flowId,
      }),
    )
  },

  addressAlertIncompleteSaveClick(flowId: string) {
    Tracker.sendInteraction(
      'address_alert_incomplete_save_click',
      camelCaseToSnakeCase({
        flowId,
      }),
    )
  },

  addressTownNotFoundWithPostalCode(flowId: string, postalCode: string) {
    Tracker.sendInteraction(
      'address_town_not_found_with_postal_code',
      camelCaseToSnakeCase({
        flowId,
        postalCode,
      }),
    )
  },

  addressSuggestionClick({
    flowId,
    label,
    position,
    userInput,
    types,
  }: {
    flowId: string
    label: string
    position: number
    userInput: string
    types: string[]
  }) {
    Tracker.sendInteraction('address_suggestion_click', {
      flow_id: flowId,
      selected_suggestion: label,
      suggestion_position: position + 1,
      user_input: userInput,
      address_type: types,
    })
  },

  addressManualClick(payload: {
    flowId: string
    userInput: string
    suggestionsAmount: number
  }) {
    Tracker.sendInteraction(
      'address_manual_click',
      camelCaseToSnakeCase(payload),
    )
  },

  addressWrongPostalCodeView(payload: {
    flowId: string
    postalCodeSuggested: string
  }) {
    Tracker.sendInteraction(
      'address_wrong_postal_code_view',
      camelCaseToSnakeCase(payload),
    )
  },

  addressWrongPostalCodeSaveClick() {
    Tracker.sendInteraction('address_wrong_postal_code_save_click')
  },

  addressWrongPostalCodeEditClick() {
    Tracker.sendInteraction('address_wrong_postal_code_edit_click')
  },

  changeHiveAlertView(reason: 'unnecessary' | 'unpublished_products') {
    Tracker.sendInteraction('change_hive_alert_view', { reason })
  },
}
