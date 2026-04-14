import { serializeRegisterUser, serializeSession } from './serializer'

import { HttpWithErrorHandler } from 'services/http'

async function register(userInfo) {
  const path = '/customers/actions/create_and_authenticate/'
  const options = {
    shouldCatchErrors: false,
    body: JSON.stringify(userInfo),
  }

  return HttpWithErrorHandler.post(path, options).then(serializeRegisterUser)
}
/**
 * @throws {400} Invalid credentials
 * @throws {401} User not exist
 * @throws {403} Ni idea
 * @throws {412} Recaptcha validation failed
 * @throws {452} Force update
 * @throws {500} Server error
 */
async function login(credentials) {
  return HttpWithErrorHandler.post('/auth/tokens/', {
    shouldCatchErrors: false,
    body: JSON.stringify({ ...credentials }),
  }).then(serializeSession)
}

async function getUserData(uuid) {
  return HttpWithErrorHandler.auth().get(`/customers/${uuid}/`, {
    shouldCatchErrors: false,
  })
}

async function recoverPassword(email) {
  return HttpWithErrorHandler.post('/customers/actions/recover-password/', {
    body: JSON.stringify(email),
  })
}

async function editUserData(userData) {
  const path = `/customers/${userData.uuid}/`
  const options = {
    body: JSON.stringify(userData),
  }

  return HttpWithErrorHandler.auth().put(path, options)
}

async function changeUserEmail(userId, email, password) {
  const path = `/customers/${userId}/actions/change-email/`
  const options = {
    shouldCatchErrors: false,
    body: JSON.stringify({ email, password }),
  }

  return HttpWithErrorHandler.auth().post(path, options)
}

async function changePassword(newCredentials) {
  const path = '/customers/actions/change-password/'
  const options = {
    body: JSON.stringify(newCredentials),
  }

  return HttpWithErrorHandler.post(path, options)
}

async function checkEmail(email) {
  return HttpWithErrorHandler.post('/customers/actions/check-email/', {
    body: JSON.stringify(email),
  })
}

async function removalRequest(uuid) {
  return HttpWithErrorHandler.auth().post(`/customers/${uuid}/removal-request/`)
}

export const AuthClient = {
  login,
  register,
  getUserData,
  editUserData,
  recoverPassword,
  changeUserEmail,
  changePassword,
  checkEmail,
  removalRequest,
}
