import { useAppSelector } from 'app/redux'

export const useUserState = () => useAppSelector(({ user }) => user)

export const useUserDeletionRequest = () =>
  useAppSelector(({ user }) => user.has_requested_account_deletion)
