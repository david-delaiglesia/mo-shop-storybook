export function serializeRegisterUser({ customer, auth }) {
  return {
    user: customer,
    auth: serializeSession(auth),
  }
}

export function serializeSession(auth) {
  return {
    uuid: auth.customer_id,
    token: auth.access_token,
  }
}
