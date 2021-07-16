import React, { createContext, useContext, useEffect, useState } from 'react'
import { Loading } from '../../../components'
import { useUserState } from '../../../contexts/UserState'
import useGetApplicationStructure from '../../../utils/hooks/useGetApplicationStructure'
import useLoadApplication from '../../../utils/hooks/useLoadApplication'
import { FullStructure, User } from '../../../utils/types'
import { getDefaultValues } from '../../Application/ApplicationCreate'
import { useOperationState } from '../shared/OperationContext'
import { useTemplateState } from './TemplateWrapper'
import { useFormStructureState } from './Form/FormWrapper'

type ApplicationOperationContextState = {
  resetApplication: () => Promise<void>
}

const defaultApplicationOperationContext: ApplicationOperationContextState = {
  resetApplication: () => {
    throw new Error('context is not present')
  },
}

const ApplicationOperationContext = createContext<ApplicationOperationContextState>(
  defaultApplicationOperationContext
)

const CreateApplicationWrapper: React.FC = ({ children }) => {
  const { configApplicationSerial, configApplicationId } = useFormStructureState()
  const [state, setState] = useState<ApplicationOperationContextState | null>(null)
  const { deleteApplication, createApplication } = useOperationState()
  const {
    template: { id: templateId },
    allElements,
    refetch: refetchFullTemplate,
  } = useTemplateState()

  const {
    userState: { currentUser },
  } = useUserState()

  useEffect(() => {
    if (!configApplicationSerial) {
      create()
    } else if (!state) {
      setState({ resetApplication })
    }
  }, [configApplicationSerial])

  const resetApplication = async () => {
    await deleteApplication(configApplicationId)
    refetchFullTemplate()
  }

  const create = async () => {
    const serial = Math.round(Math.random() * 10000).toString()
    const elementsDefaults = allElements.map((element) => element.defaultValue)
    const defaultValues = await getDefaultValues(elementsDefaults || [], currentUser)

    await createApplication({
      name: 'Config Application',
      serial,
      templateId,
      isConfig: true,
      templateResponses: allElements
        .filter((element) => element.elementTypePluginCode !== 'pageBreak')
        .map((element, index) => {
          return { templateElementId: element?.id || 0, value: defaultValues[index] }
        }),
    })
    refetchFullTemplate()
  }

  if (!configApplicationSerial || !state) return <Loading />

  return (
    <ApplicationOperationContext.Provider value={state}>
      {children}
    </ApplicationOperationContext.Provider>
  )
}

type ApplicationContextState = {
  structure: FullStructure
}

const AppicationContext = createContext<ApplicationContextState>({} as ApplicationContextState)

const ApplicationWrapper: React.FC = ({ children }) => {
  const {
    userState: { currentUser },
  } = useUserState()
  const [state, setState] = useState<ApplicationContextState | null>(null)
  const { configApplicationSerial } = useFormStructureState()

  const { structure } = useLoadApplication({
    serialNumber: configApplicationSerial,
    currentUser: currentUser as User,
    networkFetch: true,
  })

  useEffect(() => {
    if (structure) {
      setState({ structure })
    }
  }, [structure])

  if (!state) return <Loading />

  return <AppicationContext.Provider value={state}>{children}</AppicationContext.Provider>
}

type FullApplicationContextState = {
  structure: FullStructure
}

const FullApplicationContext = createContext<FullApplicationContextState>(
  {} as FullApplicationContextState
)

const FullAppllicationWrapper: React.FC = ({ children }) => {
  const { structure } = useApplicationState()
  const [state, setState] = useState<FullApplicationContextState | null>(null)
  const { fullStructure } = useGetApplicationStructure({
    structure,
    shouldRevalidate: false,
    minRefetchTimestampForRevalidation: 0,
    forceRun: true,
  })

  useEffect(() => {
    if (fullStructure) {
      setState({ structure: fullStructure })
    }
  }, [fullStructure])

  if (!state) return <Loading />

  return <FullApplicationContext.Provider value={state}>{children}</FullApplicationContext.Provider>
}

const useApplicationOperationState = () => useContext(ApplicationOperationContext)
const useFullApplicationState = () => useContext(FullApplicationContext)
const useApplicationState = () => useContext(AppicationContext)
export {
  CreateApplicationWrapper,
  ApplicationWrapper,
  FullAppllicationWrapper,
  useApplicationOperationState,
  useFullApplicationState,
  useApplicationState,
}
