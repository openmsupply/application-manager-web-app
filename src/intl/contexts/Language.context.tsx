import React, { createContext, useReducer } from 'react'
import { IntlProvider } from 'react-intl'

type SupportedLocales = 'en' | 'fr'

async function loadLocaleData(locale: SupportedLocales) {
  switch (locale) {
    case 'fr':
      return import('../../intl/compiled-lang/fr.json')
    default:
      return import('../../intl/compiled-lang/en.json')
  }
}

type LanguageType = {
  language: SupportedLocales
  messages: any
}

const initialState: LanguageType = {
  language: 'en',
  messages: {},
}

type LanguageActionType =
  | { type: 'CHANGE_LANGUAGE'; payload: LanguageType }
  | { type: 'SET_MESSAGES'; payload: any }

const LanguageContext = createContext<{
  state: LanguageType
  dispatch: React.Dispatch<LanguageActionType>
  changeLanguage: any
}>({
  state: initialState,
  dispatch: () => null,
  changeLanguage: () => null,
})

const LanguageProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(LanguageReducer, initialState)
  const { language, messages } = state

  const changeLanguage: any = async (language: SupportedLocales) => {
    const messages = await loadLocaleData(language)
    dispatch({
      type: 'CHANGE_LANGUAGE',
      payload: { language: language, messages: messages },
    })
  }

  return (
    <LanguageContext.Provider value={{ state, dispatch, changeLanguage }}>
      <IntlProvider messages={messages} locale={language} defaultLocale="en">
        {children}
      </IntlProvider>
    </LanguageContext.Provider>
  )
}

enum LanguageActions {
  changeLanguage = 'CHANGE_LANGUAGE',
  setMessages = 'SET_MESSAGES',
}

const LanguageReducer = (state: LanguageType, action: LanguageActionType): LanguageType => {
  switch (action.type) {
    case LanguageActions.changeLanguage:
      return {
        ...initialState,
        language: action.payload.language,
        messages: action.payload.messages,
      }
    case LanguageActions.setMessages:
      return {
        ...initialState,
        messages: action.payload,
      }
    default:
      return state
  }
}

export { LanguageContext, LanguageProvider }
