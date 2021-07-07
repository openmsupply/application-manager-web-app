import config from '../../../config'
import {
  useUpdateTemplateMutation,
  useUpdateTemplateFilterJoinMutation,
  useUpdateTemplateSectionMutation,
  useDeleteWholeApplicationMutation,
  useRestartApplicationMutation,
} from '../../../utils/generated/graphql'
import useCreateApplication from '../../../utils/hooks/useCreateApplication'
import {
  ImportTemplate,
  UpdateTemplate,
  UpdateTemplateFilterJoin,
  DeleteApplication,
  CreateApplication,
  TemplatesOperationProps,
  ErrorAndLoadingState,
  UpdateApplication,
} from './OperationContext'

const snapshotsBaseUrl = `${config.serverREST}/snapshot`
const takeSnapshotUrl = `${snapshotsBaseUrl}/take`
export const snapshotFilesUrl = `${snapshotsBaseUrl}/files`
const useSnapshotUrl = `${snapshotsBaseUrl}/use`
const templateExportOptionName = 'templateExport'
const uploadSnapshotUrl = `${snapshotsBaseUrl}/upload`

type SetErrorAndLoadingState = (props: ErrorAndLoadingState) => void

type TemplateOperationHelper = (
  props: TemplatesOperationProps,
  setErrorAndLoadingState: SetErrorAndLoadingState
) => Promise<boolean>

type ImportTemplateHelper = (setErrorAndLoadingState: SetErrorAndLoadingState) => ImportTemplate

type UpdateTemplateHelper = (
  setErrorAndLoadingState: SetErrorAndLoadingState,
  updateTemplateMutation: ReturnType<typeof useUpdateTemplateMutation>[0]
) => UpdateTemplate

type UpdateTemplateFilterJoinHelper = (
  setErrorAndLoadingState: SetErrorAndLoadingState,
  updateTemplateMutation: ReturnType<typeof useUpdateTemplateFilterJoinMutation>[0]
) => UpdateTemplateFilterJoin

type UpdateTemplateSectionHelper = (
  setErrorAndLoadingState: SetErrorAndLoadingState,
  updateTemplateSectionMutation: ReturnType<typeof useUpdateTemplateSectionMutation>[0]
) => UpdateTemplateFilterJoin

type DeleteApplicationHelper = (
  setErrorAndLoadingState: SetErrorAndLoadingState,
  deleteApplicationMutation: ReturnType<typeof useDeleteWholeApplicationMutation>[0]
) => DeleteApplication

type CreateApplicationHelper = (
  setErrorAndLoadingState: SetErrorAndLoadingState,
  create: ReturnType<typeof useCreateApplication>['create']
) => CreateApplication

type UpdateApplicationHelper = (
  setErrorAndLoadingState: SetErrorAndLoadingState,
  create: ReturnType<typeof useRestartApplicationMutation>[0]
) => UpdateApplication

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

export const updateTemplate: UpdateTemplateHelper =
  (setErrorAndLoadingState: SetErrorAndLoadingState, updateTemplateMutation) =>
  async (id, patch) => {
    try {
      const result = await updateTemplateMutation({ variables: { id, templatePatch: patch } })
      return checkMutationResult(result, setErrorAndLoadingState)
    } catch (e) {
      setErrorAndLoadingState({ isLoading: false, error: { error: 'error', message: e.message } })
      return false
    }
  }
export const updateTemplateFilterJoin: UpdateTemplateFilterJoinHelper =
  (setErrorAndLoadingState: SetErrorAndLoadingState, updateTemplateFilterJoin) =>
  async (id, patch) => {
    try {
      const result = await updateTemplateFilterJoin({ variables: { id, filterJoinPatch: patch } })
      return checkMutationResult(result, setErrorAndLoadingState)
    } catch (e) {
      setErrorAndLoadingState({ isLoading: false, error: { error: 'error', message: e.message } })
      return false
    }
  }

export const updateTemplateSection: UpdateTemplateSectionHelper =
  (setErrorAndLoadingState: SetErrorAndLoadingState, updatateTemplateSectionMutation) =>
  async (id, patch) => {
    try {
      const result = await updatateTemplateSectionMutation({
        variables: { id, sectionPatch: patch },
      })
      return checkMutationResult(result, setErrorAndLoadingState)
    } catch (e) {
      setErrorAndLoadingState({ isLoading: false, error: { error: 'error', message: e.message } })
      return false
    }
  }

export const updateApplication: UpdateApplicationHelper =
  (setErrorAndLoadingState: SetErrorAndLoadingState, updateApplicationMutation) =>
  async (serial, patch) => {
    try {
      const result = await updateApplicationMutation({
        variables: { serial, applicationPatch: patch },
      })
      return checkMutationResult(result, setErrorAndLoadingState)
    } catch (e) {
      setErrorAndLoadingState({ isLoading: false, error: { error: 'error', message: e.message } })
      return false
    }
  }

export const deleteApplication: DeleteApplicationHelper =
  (setErrorAndLoadingState: SetErrorAndLoadingState, deleteApplicationMutation) => async (id) => {
    try {
      const result = await deleteApplicationMutation({
        variables: { id },
      })
      return checkMutationResult(result, setErrorAndLoadingState)
    } catch (e) {
      setErrorAndLoadingState({ isLoading: false, error: { error: 'error', message: e.message } })
      return false
    }
  }

export const createApplication: CreateApplicationHelper =
  (setErrorAndLoadingState: SetErrorAndLoadingState, create) => async (props) => {
    try {
      const result = await create(props)
      return checkMutationResult(result, setErrorAndLoadingState)
    } catch (e) {
      setErrorAndLoadingState({ isLoading: false, error: { error: 'error', message: e.message } })
      return false
    }
  }

export const exportTemplate: TemplateOperationHelper = async (
  { id, snapshotName },
  setErrorAndLoadingState
) =>
  await safeFetch(
    `${takeSnapshotUrl}?name=${snapshotName}&optionsName=${templateExportOptionName}`,
    getFitlerBody(id),
    setErrorAndLoadingState
  )

export const duplicateTemplate: TemplateOperationHelper = async (
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

export const importTemplate: ImportTemplateHelper =
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
      headers: typeof body === 'string' ? { 'Content-Type': 'application/json' } : {},
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

export const getRandomNumber = () => Math.floor(Math.random() * Math.pow(9, 9))
