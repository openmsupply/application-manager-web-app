import React, { useState, useContext, createContext } from 'react'
import { Modal, Label, Icon, Loader } from 'semantic-ui-react'
import config from '../../../config'
import { TemplatePatch, useUpdateTemplateMutation } from '../../../utils/generated/graphql'

const snapshotsBaseUrl = `${config.serverREST}/snapshot`
const takeSnapshotUrl = `${snapshotsBaseUrl}/take`
export const snapshotFilesUrl = `${snapshotsBaseUrl}/files`
const useSnapshotUrl = `${snapshotsBaseUrl}/use`
const templateExportOptionName = 'templateExport'
const uploadSnapshotUrl = `${snapshotsBaseUrl}/upload`

type Error = { message: string; error: string }
type ErrorAndLoadingState = {
  error?: Error
  isLoading: boolean
}

type SetErrorAndLoadingState = (props: ErrorAndLoadingState) => void

type TemplatesOperationProps = { id: number; snapshotName: string }
type TemplatesOperation = (props: TemplatesOperationProps) => Promise<boolean>
type ImportTemplate = (e: any) => Promise<boolean>
type UpdateTemplate = (id: number, path: TemplatePatch) => Promise<boolean>

type OperationContextState = {
  fetch: (something: any) => any
  exportTemplate: TemplatesOperation
  duplicateTemplate: TemplatesOperation
  importTemplate: ImportTemplate
  updateTemplate: UpdateTemplate
}

type TemplateOperationHelper = (
  props: TemplatesOperationProps,
  setErrorAndLoadingState: SetErrorAndLoadingState
) => Promise<boolean>

type ImportTemplateHelper = (setErrorAndLoadingState: SetErrorAndLoadingState) => ImportTemplate

type UpdateTemplateHelper = (
  setErrorAndLoadingState: SetErrorAndLoadingState,
  updateTemplateMutation: ReturnType<typeof useUpdateTemplateMutation>[0]
) => UpdateTemplate

const contextNotPresentError = () => {
  throw new Error('context not present')
}

const defaultOperationContext: OperationContextState = {
  fetch: contextNotPresentError,
  exportTemplate: contextNotPresentError,
  duplicateTemplate: contextNotPresentError,
  importTemplate: contextNotPresentError,
  updateTemplate: contextNotPresentError,
}

const Context = createContext(defaultOperationContext)

const OperationContext: React.FC = ({ children }) => {
  const [updateTemplateMutation] = useUpdateTemplateMutation()
  const [innerState, setInnerState] = useState<ErrorAndLoadingState>({ isLoading: false })
  const [contextState] = useState<OperationContextState>({
    fetch: () => {},
    exportTemplate: (props) => exportTemplate(props, setInnerState),
    duplicateTemplate: (props) => duplicateTemplate(props, setInnerState),
    importTemplate: importTemplate(setInnerState),
    updateTemplate: updateTemplate(setInnerState, updateTemplateMutation),
  })

  const { isLoading, error } = innerState
  const renderExtra = () => (
    <Modal open={!!isLoading || !!error} onClick={resetLoading} onClose={resetLoading}>
      {error ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Label size="large" color="red">
            {error.message}
            <Icon name="close" onClick={resetLoading} />
          </Label>
          <div style={{ margin: 20 }}>{error.error}</div>
        </div>
      ) : (
        <Loader active>Loading</Loader>
      )}
    </Modal>
  )

  const resetLoading = () => {
    setInnerState({ isLoading: false })
  }

  return (
    <Context.Provider value={contextState}>
      {children}
      {renderExtra()}
    </Context.Provider>
  )
}

const checkMutationResult = async (
  result: any,
  setErrorAndLoadingState: SetErrorAndLoadingState
) => {
  if (result?.errors) {
    setErrorAndLoadingState({
      isLoading: false,
      error: {
        message: 'error',
        error: JSON.stringify(result.errors),
      },
    })
    return false
  }
  return true
}

const updateTemplate: UpdateTemplateHelper =
  (setErrorAndLoadingState: SetErrorAndLoadingState, updateTemplateMutation) =>
  async (id, patch) => {
    try {
      const result = await updateTemplateMutation({ variables: { id, templatePatch: patch } })
      return checkMutationResult(result, setErrorAndLoadingState)
    } catch (e) {
      setErrorAndLoadingState({ isLoading: false, error: { error: 'error', message: e } })

      return false
    }
  }

const exportTemplate: TemplateOperationHelper = async (
  { id, snapshotName },
  setErrorAndLoadingState
) =>
  await safeFetch(
    `${takeSnapshotUrl}?name=${snapshotName}&optionsName=${templateExportOptionName}`,
    getFitlerBody(id),
    setErrorAndLoadingState
  )

const duplicateTemplate: TemplateOperationHelper = async (
  { id, snapshotName },
  setErrorAndLoadingState
) => {
  const body = getFitlerBody(id)

  const result = await safeFetch(
    `${takeSnapshotUrl}?name=${snapshotName}&optionsName=${templateExportOptionName}`,
    body,
    setErrorAndLoadingState
  )

  if (!result) return false

  return await safeFetch(
    `${useSnapshotUrl}?name=${snapshotName}&optionsName=${templateExportOptionName}`,
    body,
    setErrorAndLoadingState
  )
}

const importTemplate: ImportTemplateHelper =
  (setErrorAndLoadingState: SetErrorAndLoadingState) => async (e) => {
    if (!e.target?.files) return false
    const file = e.target.files[0]
    const snapshotName = file.name.replace('.zip', '')

    try {
      const data = new FormData()
      data.append('file', file)

      const result = await safeFetch(
        `${uploadSnapshotUrl}?name=${snapshotName}`,
        data,
        setErrorAndLoadingState
      )

      if (!result) return false

      return await safeFetch(
        `${useSnapshotUrl}?name=${snapshotName}&optionsName=${templateExportOptionName}`,
        '{}',
        setErrorAndLoadingState
      )
    } catch (error) {
      setErrorAndLoadingState({ isLoading: false, error: { error: 'error', message: error } })
      return false
    }
  }

const getFitlerBody = (id: number) => {
  const filters = { filters: { template: { id: { equalTo: id } } } }
  return JSON.stringify(filters)
}
const safeFetch = async (
  url: string,
  body: any,
  setErrorAndLoadingState: SetErrorAndLoadingState
) => {
  setErrorAndLoadingState({ isLoading: true })
  try {
    const resultRaw = await fetch(url, {
      method: 'POST',
      body,
    })
    const resultJson = await resultRaw.json()
    if (!!resultJson?.success) {
      setErrorAndLoadingState({ isLoading: false })
      return true
    }

    setErrorAndLoadingState({ isLoading: false, error: resultJson })
    return false
  } catch (error) {
    setErrorAndLoadingState({ isLoading: false, error: { error: 'error', message: error } })
    return false
  }
}

export default OperationContext
export const useOperationState = () => useContext(Context)
