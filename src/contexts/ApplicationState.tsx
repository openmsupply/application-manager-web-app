import React, { createContext, useContext, useReducer } from 'react'
import { isArraySorted } from '../utils/helpers/utilityFunctions'
import { ContextApplicationState } from '../utils/types'

type TimestampType =
  | 'elementEnteredTimestamp'
  | 'elementLostFocusTimestamp'
  | 'elementsStateUpdatedTimestamp'

export type ApplicationActions =
  | {
      type: 'setApplication'
      id: number
    }
  | {
      type: 'setSerialNumber'
      serialNumber: string
    }
  | {
      type: 'reset'
    }
  | {
      type: 'setElementTimestamp'
      timestampType: TimestampType
    }

type ApplicationProviderProps = { children: React.ReactNode }

const reducer = (state: ContextApplicationState, action: ApplicationActions) => {
  switch (action.type) {
    case 'setApplication':
      const { id } = action
      return {
        ...state,
        id,
      }
    case 'setSerialNumber':
      const { serialNumber } = action
      return {
        ...state,
        serialNumber,
      }
    case 'setElementTimestamp':
      const newTimestamps = { ...state.inputElementsActivity }
      newTimestamps[action.timestampType] = Date.now()
      console.log('type', action.timestampType)

      console.log(newTimestamps)

      newTimestamps.areTimestampsInSequence = isArraySorted([
        newTimestamps.elementEnteredTimestamp,
        newTimestamps.elementLostFocusTimestamp,
        newTimestamps.elementsStateUpdatedTimestamp,
      ])
      return {
        ...state,
        inputElementsActivity: newTimestamps,
      }
    case 'reset':
      return initialState
    default:
      return state
  }
}

const initialState: ContextApplicationState = {
  id: null,
  serialNumber: null,
  inputElementsActivity: {
    elementEnteredTimestamp: Date.now(),
    elementLostFocusTimestamp: Date.now(),
    elementsStateUpdatedTimestamp: Date.now(),
    areTimestampsInSequence: true,
  },
}

// By setting the typings here, we ensure we get intellisense in VS Code
const initialApplicationContext: {
  applicationState: ContextApplicationState
  setApplicationState: React.Dispatch<ApplicationActions>
} = {
  applicationState: initialState,
  setApplicationState: () => {},
}

// No need to export this as we use it internally only
const ApplicationContext = createContext(initialApplicationContext)

export function ApplicationProvider({ children }: ApplicationProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const applicationState = state
  const setApplicationState = dispatch

  // pass the state and reducer to the context, dont forget to wrap the children
  return (
    <ApplicationContext.Provider value={{ applicationState, setApplicationState }}>
      {children}
    </ApplicationContext.Provider>
  )
}

/**
 * To use and set the state of the current application from anywhere in the app
 * - @returns an object with a reducer function `setApplicationState` and the `applicationState`
 */
export const useApplicationState = () => useContext(ApplicationContext)
