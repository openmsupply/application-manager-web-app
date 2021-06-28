import React, { useEffect, useState } from 'react'
import { Button, Dropdown, Header, Icon, Label, Modal, Popup } from 'semantic-ui-react'
import { Loading, PageElements } from '../../../components'
import { useUserState } from '../../../contexts/UserState'
import pluginProvider from '../../../formElementPlugins/pluginProvider'
import {
  TemplateElementCategory,
  TemplateStatus,
  useDeleteWholeApplicationMutation,
  useUpdateTemplateElementMutation,
  useUpdateTemplateMutation,
} from '../../../utils/generated/graphql'
import useCreateApplication from '../../../utils/hooks/useCreateApplication'
import useGetApplicationStructure from '../../../utils/hooks/useGetApplicationStructure'
import useLoadApplication from '../../../utils/hooks/useLoadApplication'
import useLoadTemplate from '../../../utils/hooks/useLoadTemplate'
import { ElementState, EvaluatorNode, FullStructure, User } from '../../../utils/types'
import { handleCreate } from '../../Application/ApplicationCreate'
import { JsonTextBox, OnBlurInput } from './General'
import { TemplateInfo } from './TemplateWrapper'

const Form: React.FC<{ templateInfo: TemplateInfo }> = ({ templateInfo }) => {
  const [serial, setSerial] = useState(templateInfo?.configApplications?.nodes?.[0]?.serial || '')
  const { template } = useLoadTemplate({
    templateCode: templateInfo?.code,
    status: templateInfo?.status || TemplateStatus.Draft,
  })
  const isEditable = templateInfo?.status === TemplateStatus.Draft
  const { create } = useCreateApplication({
    onCompleted: () => {},
  })
  const [deleteApplication] = useDeleteWholeApplicationMutation()
  const {
    userState: { currentUser },
  } = useUserState()

  useEffect(() => {
    if (!serial && template) {
      resetApplication()
    }
  }, [serial, template])

  const resetApplication = async () => {
    const existingId = templateInfo?.configApplications?.nodes?.[0]?.id
    if (existingId) await deleteApplication({ variables: { id: existingId } })
    const newSerial = await handleCreate({ create, currentUser, template, isConfig: true })
    setSerial(newSerial)
  }

  if (!serial || !template) return <Loading />

  return (
    <ApplicationWrapper
      isEditable={isEditable}
      key={serial}
      serialNumber={serial}
      resetApplication={resetApplication}
    />
  )
}
type Error = { message: string; error: string }
const ApplicationWrapper: React.FC<{
  serialNumber: string
  resetApplication: () => void
  isEditable: boolean
}> = ({ serialNumber, resetApplication, isEditable }) => {
  const {
    userState: { currentUser },
  } = useUserState()

  const { structure } = useLoadApplication({
    serialNumber,
    currentUser: currentUser as User,
    networkFetch: true,
  })

  if (!structure) return <Loading />

  return (
    <Application
      isEditable={isEditable}
      structure={structure}
      resetApplication={resetApplication}
    />
  )
}

type SectionUpdateState = {
  code: string
  title: string
  index: number
  id?: number
}
const SectionEdit: React.FC<{
  section?: SectionUpdateState
  templateId: number
  setError: (error: Error) => void
  isEditable: boolean
}> = ({ section, templateId, setError, isEditable }) => {
  const [updateTemplate] = useUpdateTemplateMutation()
  const [updateState, setUpdateState] = useState<SectionUpdateState>({
    code: section?.code || '',
    index: section?.index || 0,
    title: section?.title || '',
    id: section?.id,
  })
  return (
    <div className="section-edit">
      <OnBlurInput
        key="sectionCode"
        initialValue={updateState.code}
        label="Code"
        update={(value: string) => setUpdateState({ ...updateState, code: value })}
      />
      <OnBlurInput
        key="sectionTitle"
        initialValue={updateState.title}
        label="Title"
        update={(value: string) => setUpdateState({ ...updateState, title: value })}
      />
      <Popup
        content="Template form only editable on draft templates"
        key="not draft"
        disabled={isEditable}
        trigger={
          <Icon
            name="edit"
            onClick={async () => {
              if (!isEditable) return
              try {
                const result = await updateTemplate({
                  variables: {
                    id: templateId,
                    templatePatch: {
                      templateSectionsUsingId: {
                        updateById: [{ patch: updateState, id: updateState.id || 0 }],
                      },
                    },
                  },
                })
                if (result.errors)
                  return setError({
                    message: 'error',
                    error: JSON.stringify(result.errors),
                  })
              } catch (e) {
                setError({ message: 'error', error: e })
              }
            }}
          />
        }
      />
      <Icon name="delete" />
    </div>
  )
}

type ElementUpdateState = {
  code: string
  index: number
  title: string
  category: TemplateElementCategory
  elementTypePluginCode: string
  visibilityCondition: EvaluatorNode
  isRequired: EvaluatorNode
  isEditable: EvaluatorNode
  validation: EvaluatorNode
  validationMessage: string
  helpText: string
  parameters: object
  defaultValue: EvaluatorNode
  id: number
}

const Application: React.FC<{
  structure: FullStructure
  resetApplication: () => void
  isEditable: boolean
}> = ({ structure, resetApplication, isEditable }) => {
  const { fullStructure } = useGetApplicationStructure({
    structure,
    shouldRevalidate: false,
    minRefetchTimestampForRevalidation: 0,
    forceRun: true,
  })
  const [selectedSectionCode, setSelectedSectionCode] = useState('')
  const [selectedPageNumber, setSelectedPageNumber] = useState(-1)
  const [error, setError] = useState<Error | null>(null)
  const templateId = fullStructure?.info.template.id || 0
  const selectedSection = fullStructure?.sections[selectedSectionCode]
  const [updateState, setUpdateState] = useState<ElementUpdateState | null>(null)
  const [updateTemplateElement] = useUpdateTemplateElementMutation()

  if (!fullStructure || !fullStructure.responsesByCode) return <Loading />

  return (
    <>
      <div key="sections" className="template-sections-header" onClick={() => {}}>
        <Header as="h3">Sections</Header> <Icon name="add" />
        <div className="button-container">
          <Button inverted primary onClick={resetApplication}>
            Reset Application
          </Button>
        </div>
      </div>
      <div key="section" className="template-sections">
        {Object.values(fullStructure?.sections || []).map((section) => (
          <Label
            key={section.details.id}
            onClick={() => {
              setSelectedSectionCode(section.details.code)
              setSelectedPageNumber(-1)
            }}
            className={`${section.details.code === selectedSectionCode ? 'selected' : ''}`}
          >
            {section.details.title}
          </Label>
        ))}
      </div>

      {!!selectedSectionCode && (
        <SectionEdit
          setError={setError}
          isEditable={isEditable}
          key={selectedSectionCode}
          templateId={templateId}
          section={selectedSection?.details as SectionUpdateState}
        />
      )}

      {!!selectedSectionCode && (
        <>
          <div key="pages" className="template-pages-header" onClick={() => {}}>
            <Header as="h3">Pages</Header> <Icon name="add" />
          </div>
          <div key="page" className="template-pages">
            {Object.entries(selectedSection?.pages || []).map(([index, page]) => (
              <Label
                key={index}
                onClick={() => {
                  setSelectedPageNumber(Number(index))
                }}
                className={`${Number(index) === selectedPageNumber ? 'selected' : ''}`}
              >
                {`Page ${index}`}
              </Label>
            ))}
          </div>
        </>
      )}

      {selectedPageNumber !== -1 && (
        <div className="config-wrapper">
          <PageElements
            canEdit={true}
            renderConfigElement={(element: ElementState) => (
              <Icon
                size="large"
                className="template-elment-settings"
                name="setting"
                onClick={() =>
                  setUpdateState({
                    code: element.code,
                    index: element.elementIndex,
                    title: element.title,
                    category: element.category,
                    elementTypePluginCode: element.pluginCode,
                    visibilityCondition: element.isVisibleExpression,
                    isRequired: element.isRequiredExpression,
                    isEditable: element.isEditableExpression,
                    validation: element.validationExpression,
                    helpText: element.helpText || '',
                    validationMessage: element.validationMessage || '',
                    parameters: element.parameters,
                    defaultValue: element.defaultValueExpression,
                    id: element.id,
                  })
                }
              />
            )}
            elements={getCurrentPageElements(
              fullStructure,
              selectedSectionCode,
              selectedPageNumber
            )}
            responsesByCode={fullStructure.responsesByCode}
            applicationData={fullStructure.info}
          />
        </div>
      )}
      <Modal open={!!error} onClick={() => setError(null)} onClose={() => setError(null)}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Label size="large" color="red">
            {String(error?.message)}
            <Icon name="close" onClick={() => setError(null)} />
          </Label>
          <div style={{ margin: 20 }}>{String(error?.error)}</div>
        </div>
      </Modal>

      <Modal open={!!updateState} onClose={() => setUpdateState(null)}>
        {updateState && (
          <div className="element-update-container">
            <div key="elementPlugin" className="element-dropdown-container">
              <Label content="Type" />
              <Dropdown
                value={updateState.elementTypePluginCode}
                selection
                options={Object.values(pluginProvider.pluginManifest).map(
                  ({ code, displayName }) => ({
                    key: code,
                    value: code,
                    text: displayName,
                  })
                )}
                onChange={(_, { value }) =>
                  setUpdateState({ ...updateState, elementTypePluginCode: String(value) })
                }
              />
            </div>
            <div key="elementCategory" className="element-dropdown-container">
              <Label content="Category" />
              <Dropdown
                value={updateState.category}
                selection
                options={[
                  {
                    key: 'Information',
                    value: TemplateElementCategory.Information,
                    text: 'Information',
                  },
                  { key: 'Question', value: TemplateElementCategory.Question, text: 'Question' },
                ]}
                onChange={(_, { value }) =>
                  setUpdateState({ ...updateState, category: value as TemplateElementCategory })
                }
              />
            </div>
            <OnBlurInput
              key="elementCode"
              initialValue={updateState.code}
              label="Code"
              update={(value: string) => setUpdateState({ ...updateState, code: value })}
            />
            <OnBlurInput
              key="elementTitle"
              initialValue={updateState.title}
              label="Title"
              update={(value: string) => setUpdateState({ ...updateState, title: value })}
            />
            <JsonTextBox
              key="elementIsVisible"
              initialValue={asObject(updateState.visibilityCondition)}
              label="isVisible"
              update={(value: object) =>
                setUpdateState({ ...updateState, visibilityCondition: value })
              }
            />
            <JsonTextBox
              key="elementIsEditable"
              initialValue={asObject(updateState.isEditable)}
              label="isEditable"
              update={(value: object) => setUpdateState({ ...updateState, isEditable: value })}
            />
            <JsonTextBox
              key="elementIsRequired"
              initialValue={asObject(updateState.isRequired)}
              label="isRequired"
              update={(value: object) => setUpdateState({ ...updateState, isRequired: value })}
            />
            <JsonTextBox
              key="elementIsValid"
              initialValue={asObject(updateState.validation)}
              label="isValid"
              update={(value: object) => setUpdateState({ ...updateState, validation: value })}
            />
            <OnBlurInput
              key="elementHelpText"
              initialValue={updateState.validationMessage}
              label="Validation Message"
              isTextArea={true}
              update={(value: string) =>
                setUpdateState({ ...updateState, validationMessage: value })
              }
            />
            <JsonTextBox
              key="elementDefaultValue"
              initialValue={asObject(updateState.defaultValue)}
              label="Default Value"
              update={(value: object) => setUpdateState({ ...updateState, defaultValue: value })}
            />
            <JsonTextBox
              key="elementParameters"
              initialValue={updateState.parameters}
              label="Plugin Parameters"
              update={(value: object) => setUpdateState({ ...updateState, parameters: value })}
            />
            <OnBlurInput
              key="elementHelpText"
              initialValue={updateState.helpText}
              label="Help Text"
              isTextArea={true}
              update={(value: string) => setUpdateState({ ...updateState, helpText: value })}
            />
            <div className="button-container">
              <Button
                inverted
                disabled={!isEditable}
                primary
                onClick={() => {
                  updateTemplateElement({
                    variables: { id: updateState.id, templateElementPatch: updateState },
                  })
                  setUpdateState(null)
                }}
              >
                Save
              </Button>

              <Button inverted primary onClick={() => setUpdateState(null)}>
                Cancel
              </Button>
            </div>
            {!isEditable && (
              <Label color="red">Template form only editable on draft templates</Label>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}

const asObject = (value: EvaluatorNode) =>
  typeof value === 'object' && value != null ? value : { value: value || null }

const getCurrentPageElements = (structure: FullStructure, section: string, page: number) => {
  return structure.sections[section].pages[page].state
}
export default Form
