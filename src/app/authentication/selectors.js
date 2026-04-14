import { useSelector } from 'react-redux'

export const useSession = () => useSelector(({ session }) => session)

export const useUserUUID = () => useSelector(({ session }) => session.uuid)
