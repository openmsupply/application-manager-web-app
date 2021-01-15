import React, { createContext, useContext, useReducer } from 'react'
import fetchUserInfo from '../utils/helpers/fetchUserInfo'
import { TemplatePermissions, User } from '../utils/types'

type UserState = {
  currentUser: User | null
  templatePermissions: TemplatePermissions
  isLoading: boolean
}

export type UserActions =
  | {
      type: 'resetCurrentUser'
    }
  | {
      type: 'setCurrentUser'
      newUser: User
      newPermissions: TemplatePermissions
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
      const { newUser, newPermissions } = action
      return {
        ...state,
        currentUser: newUser,
        templatePermissions: newPermissions,
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
  isLoading: false,
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

  const onLogin = (
    JWT: string,
    user: User | undefined = undefined,
    permissions: TemplatePermissions | undefined = undefined
  ) => {
    dispatch({ type: 'setLoading', isLoading: true })
    localStorage.setItem('persistJWT', JWT)
    if (!user || !permissions) fetchUserInfo({ dispatch: setUserState })
    else dispatch({ type: 'setCurrentUser', newUser: user, newPermissions: permissions })
  }

  const logout = () => {
    dispatch({ type: 'setLoading', isLoading: true })
    localStorage.clear()
    dispatch({ type: 'resetCurrentUser' })
  }

  // Initial check for persisted user in local storage
  const JWT = localStorage.getItem('persistJWT')
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
