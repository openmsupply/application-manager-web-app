import React, { createContext, useContext, useEffect, useState } from 'react'
import { Loading } from '../../../../components'

import {
  CreateApplicationWrapper,
  FullAppllicationWrapper,
  ApplicationWrapper,
} from './ApplicationWrapper'
import Elements from './Elements'
import FormWrapper from './FormWrapper'
import Pages from './Pages'
import Sections from './Sections'

const FormWithWrappers: React.FC = () => (
  <FormWrapper>
    <CreateApplicationWrapper>
      <ApplicationWrapper>
        <FullAppllicationWrapper>
          <Form />
        </FullAppllicationWrapper>
      </ApplicationWrapper>
    </CreateApplicationWrapper>
  </FormWrapper>
)

type SetSelectedSectionId = (templateSectionId: number) => void
type SetSelectedPageNumber = (selectedPageNumber: number) => void

type FormState = {
  selectedSectionId: number
  selectedPageNumber: number
  setSelectedSectionId: SetSelectedSectionId
  setSelectedPageNumber: SetSelectedPageNumber
  unselect: () => void
}

const contextNotDefined = () => {
  throw new Error('form state context not defiend')
}
const defaultFormState: FormState = {
  selectedSectionId: -1,
  selectedPageNumber: -1,
  setSelectedSectionId: contextNotDefined,
  setSelectedPageNumber: contextNotDefined,
  unselect: contextNotDefined,
}
const FormContext = createContext<FormState>(defaultFormState)

const Form: React.FC = () => {
  const [state, setState] = useState<FormState>(defaultFormState)

  useEffect(() => {
    setState({
      ...defaultFormState,
      setSelectedPageNumber: (selectedPageNumber) =>
        setState((state) => ({ ...state, selectedPageNumber })),
      setSelectedSectionId: (selectedSectionId) =>
        setState((state) => ({ ...state, selectedSectionId })),
      unselect: () =>
        setState((state) => ({ ...state, selectedPageNumber: -1, selectedSectionId: -1 })),
    })
  }, [])

  if (!state) return <Loading />

  return (
    <FormContext.Provider value={state}>
      <Sections />
      <Pages />
      <Elements />
    </FormContext.Provider>
  )
}

export const useFormState = () => useContext(FormContext)

export default FormWithWrappers
