import React, { createContext, useContext, useReducer } from 'react'

interface ContextFormElementUpdateTrackerState {
  elementEnteredTimestamp: number
  elementEnteredTextValue?: string
  elementUpdatedTimestamp: number
  elementUpdatedTextValue: string
  isLastElementUpdateProcessed: boolean
  wasElementChanged: boolean
}

export type UpdateAction =
  | {
      type: 'setElementEntered'
      textValue: string
    }
  | {
      type: 'setElementUpdated'
      textValue: string
      previousValue: string
    }

type FormElementUpdateTrackerProps = { children: React.ReactNode }

// TODO will have to think about storing elementEnteredTimestamp and elementUpdatedTimestamp by element code/application
// think of a use case where API query take a long time, and focus is changed to another field and submit is pressed
// straight away
const reducer = (
  state: ContextFormElementUpdateTrackerState,
  action: UpdateAction
): ContextFormElementUpdateTrackerState => {
  switch (action.type) {
    case 'setElementUpdated': {
      const newState = {
        ...state,
        elementUpdatedTimestamp: Date.now(),
        elementUpdatedTextValue: action.textValue,
      }

      // It's possible that element is saved without setElementEntered in which case we want to compare values suppied by this action
      const wasElementChanged =
        typeof newState.elementEnteredTextValue === 'undefined'
          ? action.textValue !== action.previousValue
          : action.textValue !== newState.elementEnteredTextValue

      return {
        ...newState,
        isLastElementUpdateProcessed:
          newState.elementUpdatedTimestamp >= newState.elementEnteredTimestamp,
        wasElementChanged,
        elementEnteredTextValue: undefined,
      }
    }
    case 'setElementEntered': {
      const newState = {
        ...state,
        elementEnteredTimestamp: Date.now(),
        elementEnteredTextValue: action.textValue,
      }

      return {
        ...newState,
        isLastElementUpdateProcessed: false,
      }
    }
    default:
      return state
  }
}

const initialState: ContextFormElementUpdateTrackerState = {
  isLastElementUpdateProcessed: true,
  elementEnteredTimestamp: Date.now(),
  elementUpdatedTimestamp: Date.now(),
  elementEnteredTextValue: undefined,
  elementUpdatedTextValue: '',
  wasElementChanged: false,
}

// By setting the typings here, we ensure we get intellisense in VS Code
const initialContext: {
  state: ContextFormElementUpdateTrackerState
  setState: React.Dispatch<UpdateAction>
} = {
  state: initialState,
  setState: () => {},
}

// No need to export this as we use it internally only
const FormElementUpdateTrackerContext = createContext(initialContext)

export function FormElementUpdateTrackerProvider({ children }: FormElementUpdateTrackerProps) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const setState = dispatch

  // pass the state and reducer to the context, dont forget to wrap the children
  return (
    <FormElementUpdateTrackerContext.Provider value={{ state, setState }}>
      {children}
    </FormElementUpdateTrackerContext.Provider>
  )
}

export const useFormElementUpdateTracker = () => useContext(FormElementUpdateTrackerContext)
