export const AuthUuidStorage = {
  AUTH_UUID: 'MO-payment_authentication_uuid',
  get: () => localStorage.getItem(AuthUuidStorage.AUTH_UUID),
  set: (authUuid: string) =>
    localStorage.setItem(AuthUuidStorage.AUTH_UUID, authUuid),
  remove: () => localStorage.removeItem(AuthUuidStorage.AUTH_UUID),
}
