import React, { createContext, useContext, useReducer } from 'react'
import fetchUserInfo from '../utils/helpers/fetchUserInfo'
import { OrganisationSimple, TemplatePermissions, User } from '../utils/types'
import strings from '../utils/constants'

type UserState = {
  currentUser: User | null
  templatePermissions: TemplatePermissions
  orgList: OrganisationSimple[]
  isLoading: boolean
  isNonRegistered: boolean | null
  isAdmin: boolean
}

export type UserActions =
  | {
      type: 'resetCurrentUser'
    }
  | {
      type: 'setCurrentUser'
      newUser: User
      newPermissions: TemplatePermissions
      newOrgList: OrganisationSimple[]
      isAdmin: boolean
    }
  | {
      type: 'setLoading'
      isLoading: boolean
    }
  | {
      type: 'setTemplatePermissions'
      templatePermissions: TemplatePermissions
    }

type UserProviderProps = { children: React.ReactNode }

const reducer = (state: UserState, action: UserActions) => {
  switch (action.type) {
    case 'resetCurrentUser':
      return initialState
    case 'setCurrentUser':
      const { newUser, newPermissions, newOrgList, isAdmin } = action
      return {
        ...state,
        currentUser: newUser,
        templatePermissions: newPermissions,
        orgList: newOrgList,
        isAdmin,
        isNonRegistered: newUser.username === strings.USER_NONREGISTERED,
      }
    case 'setLoading':
      const { isLoading } = action
      return {
        ...state,
        isLoading,
      }
    case 'setTemplatePermissions':
      const { templatePermissions } = action
      return {
        ...state,
        templatePermissions,
      }
    default:
      return state
  }
}

const initialState: UserState = {
  currentUser: null,
  templatePermissions: {},
  orgList: [],
  isLoading: false,
  isNonRegistered: null,
  isAdmin: false,
}

// By setting the typings here, we ensure we get intellisense in VS Code
const initialUserContext: {
  userState: UserState
  setUserState: React.Dispatch<UserActions>
  onLogin: Function
  logout: Function
} = {
  userState: initialState,
  setUserState: () => {},
  onLogin: () => {},
  logout: () => {},
}

const UserContext = createContext(initialUserContext)

export function UserProvider({ children }: UserProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const userState = state
  const setUserState = dispatch

  const logout = () => {
    localStorage.clear()
    window.location.href = '/login'
  }

  const onLogin = (
    JWT: string,
    user: User | undefined = undefined,
    permissions: TemplatePermissions | undefined = undefined,
    orgList: OrganisationSimple[] = [],
    isAdmin: boolean = false
  ) => {
    if (JWT == undefined) logout()
    dispatch({ type: 'setLoading', isLoading: true })
    localStorage.setItem('persistJWT', JWT)
    if (!user || !permissions) fetchUserInfo({ dispatch: setUserState }, logout)
    else {
      dispatch({
        type: 'setCurrentUser',
        newUser: user,
        newPermissions: permissions,
        isAdmin,
        newOrgList: orgList,
      })
      dispatch({ type: 'setLoading', isLoading: false })
    }
  }

  // Initial check for persisted user in local storage
  const JWT = localStorage.getItem('persistJWT')
  if (JWT == 'undefined') logout()
  if (JWT && !userState.currentUser && !userState.isLoading) {
    onLogin(JWT)
  }

  // Return the state and reducer to the context (wrap around the children)
  return (
    <UserContext.Provider value={{ userState, setUserState, onLogin, logout }}>
      {children}
    </UserContext.Provider>
  )
}

/**
 * To use and set the state of the user from anywhere in the app
 * - @returns an object with a reducer function `setUserState` and the `userState`
 */
export const useUserState = () => useContext(UserContext)
