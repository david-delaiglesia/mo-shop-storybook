import { useSelector } from 'react-redux'

export const useUser = () => {
  const user = useSelector((state) => state.user)

  return user
}
