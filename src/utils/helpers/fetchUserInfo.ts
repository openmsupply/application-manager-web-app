import { Dispatch } from 'react'
import config from '../../config'
import { UserActions } from '../../contexts/UserState'

const userInfoUrl = `${config.serverREST}/user-info`
const LOCAL_STORAGE_JWT_KEY = 'persistJWT'
const createAuthorisationHeader = (JWT: string) => ({
  Authorization: `Bearer ${JWT}`,
})

interface SetUserInfoProps {
  dispatch: Dispatch<UserActions>
}

const fetchUserInfo = ({ dispatch }: SetUserInfoProps, logout: Function) => {
  const JWT: string = localStorage.getItem(LOCAL_STORAGE_JWT_KEY) || ''

  fetch(userInfoUrl, { headers: createAuthorisationHeader(JWT) })
    .then((res: any) => res.json())
    .then(({ templatePermissions, JWT, user, orgList, success }) => {
      if (!success) logout()
      localStorage.setItem(LOCAL_STORAGE_JWT_KEY, JWT)

      // Set userinfo to context after receiving it from endpoint
      if (user && templatePermissions) {
        dispatch({
          type: 'setCurrentUser',
          newUser: user,
          newPermissions: templatePermissions,
          newOrgList: orgList,
        })
      }

      dispatch({ type: 'setLoading', isLoading: false })
    })
    .catch((error) => {
      // TODO handle this properly
      console.log(error)
    })
}

export default fetchUserInfo
