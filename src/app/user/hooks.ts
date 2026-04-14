import { AuthClient, createSession } from 'app/authentication'
import { useAppDispatch, useAppSelector } from 'app/redux'
import { setLoggedUser } from 'app/user/actions'
import { HTTP_STATUS } from 'services/http'
import { Session } from 'services/session'

export const useUser = () => {
  const user = useAppSelector(({ user }) => user)
  const dispatch = useAppDispatch()

  const refetch = async () => {
    try {
      const newUserData = await AuthClient.getUserData(user.uuid)
      dispatch(createSession(newUserData))
      dispatch(setLoggedUser(newUserData))
    } catch (error) {
      if ((error as { status?: number }).status === HTTP_STATUS.FORCE_UPDATE)
        return
      Session.remove()
    }
  }

  return { user, refetch }
}
