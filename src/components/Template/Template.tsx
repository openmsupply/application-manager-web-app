import React, { createElement, useEffect, useState } from 'react'
import {
  Button,
  Container,
  Dropdown,
  Grid,
  Header,
  Icon,
  Input,
  Label,
  Menu,
  Modal,
  Portal,
  Segment,
  Sticky,
  Form,
  Checkbox,
  Popup,
  Accordion,
} from 'semantic-ui-react'

import {
  useCreateTemplateCategoryMutation,
  useCreateTemplateElementMutation,
  useCreateTemplateSectionMutation,
  useGetTemplateCategoriesQuery,
  useUpdateTemplateElementMutation,
  useUpdateTemplateSectionMutation,
} from '../../utils/generated/graphql'
import useLoadTemplate from '../../utils/hooks/useLoadTemplate'
import { useRouter } from '../../utils/hooks/useRouter'
import GeneralTab from './GeneralTab'
import ActionsTab from './ActionsTab'
import PermissionsTab from './PermissionsTab'
import useLoadApplication from '../../utils/hooks/useLoadApplication'
import useLoadApplicationNEW from '../../utils/hooks/useLoadApplicationNEW'
import useGetFullApplicationStructure from '../../utils/hooks/useGetFullApplicationStructure'
import { ProgressBar } from '..'
import { ElementStateNEW, FullStructure, ResponsesByCode } from '../../utils/types'
import ApplicationViewWrapper from '../../formElementPlugins/ApplicationViewWrapperNEW'
import JsonField from './JsonTextArea'
import JsonTextArea from './JsonTextArea'
import { ConsolidatorCell } from '../List/Cells'

type TParams = { templateId: string; step?: string }

const Template: React.FC = () => {
  const { query } = useRouter()
  const { templateCode, step } = query
  const [activeItem, setActiveItem] = useState('Form')
  const { ...all } = useLoadTemplate({
    templateCode,
  })

  console.log({ all })
  return (
    <div>
      <Menu attached="top" tabular>
        <Menu.Item
          name="Form"
          active={activeItem === 'Form'}
          onClick={() => setActiveItem('Form')}
        />
        <Menu.Item
          name="General"
          active={activeItem === 'General'}
          onClick={() => setActiveItem('General')}
        />
        <Menu.Item
          name="Actions"
          active={activeItem === 'Actions'}
          onClick={() => setActiveItem('Actions')}
        />
        <Menu.Item
          name="Permissions"
          active={activeItem === 'Permissions'}
          onClick={() => setActiveItem('Permissions')}
        />
      </Menu>
      {activeItem === 'Form' ? <TemplateForm all={all} /> : null}
      {activeItem === 'General' ? <GeneralTab all={all} /> : null}
      {activeItem === 'Actions' ? <ActionsTab all={all} /> : null}
      {activeItem === 'Permissions' ? <PermissionsTab all={all} /> : null}
    </div>
  )
}

const GetApplication: React.FC = ({ all, children }: any) => {
  const { structure, template, refetch } = useLoadApplicationNEW({
    serialNumber: `${all?.wholeTemplate?.applications?.nodes[0]?.serial || 0}`,
  })

  if (!structure) return null

  return (
    <GetAppicationDetails all={all} structure={structure} refetch={refetch} template={template} />
  )
}

const GetAppicationDetails: React.FC = ({ structure, all, template, refetch }: any) => {
  const { error, isLoading, fullStructure } = useGetFullApplicationStructure({
    structure,
  })
  const [shouldShowConfig, setShouldShowConfig] = useState(false)
  const [toggleSectionEdit, setToggleSectionEdit] = useState(false)
  const [currentSectionCode, setCurrentSectionCode] = useState(null)
  const [createElement] = useCreateTemplateElementMutation()

  if (!fullStructure) return null

  const responsesByCode = fullStructure.responsesByCode

  console.log(fullStructure)
  return (
    <>
      <CreateUpdateSection
        triggerUpdate={refetch}
        fullStructure={fullStructure}
        all={all}
        sections={fullStructure.sections}
        toggleOpen={toggleSectionEdit}
        currentSectionCode={currentSectionCode}
      />
      <Segment.Group style={{ backgroundColor: 'Gainsboro', display: 'flex' }}>
        {/* <ModalWarning showModal={showModal} /> */}
        <Header textAlign="center"></Header>
        <Grid
          stackable
          style={{
            backgroundColor: 'white',
            padding: 10,
            margin: '0px 50px',
            minHeight: 500,
            flex: 1,
          }}
        >
          <Grid.Column width={4}>
            <Sticky offset={120}>
              <Segment compact>
                <Checkbox
                  toggle
                  label="Show Config"
                  checked={shouldShowConfig}
                  onChange={() => setShouldShowConfig(!shouldShowConfig)}
                />
                <Button
                  style={{ marginTop: 10 }}
                  onClick={() => {
                    setCurrentSectionCode(null)
                    setToggleSectionEdit(!toggleSectionEdit)
                  }}
                >
                  Add New Section
                </Button>
              </Segment>
            </Sticky>
          </Grid.Column>

          <Grid.Column width={10} stretched>
            {Object.entries(fullStructure.sections).map(([sectionCode, section]) => (
              <Segment key={section.details.id}>
                <div>
                  <Header as="h2" content={fullStructure.sections[sectionCode].details.title} />
                  <Label
                    floating
                    circular
                    style={{
                      left: 'auto',
                      right: 0,
                      background: 'none',
                      top: '0em',
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    <Popup
                      content="Edit Section Details"
                      trigger={
                        <Icon
                          onClick={() => {
                            setCurrentSectionCode(sectionCode)
                            setToggleSectionEdit(!toggleSectionEdit)
                          }}
                          name="edit"
                          size="large"
                          style={{ cursor: 'pointer', background: 'white', padding: 2, margin: 2 }}
                        />
                      }
                    />
                    <Popup
                      content="Add Page"
                      trigger={
                        <Icon
                          name="add"
                          size="large"
                          onClick={async () => {
                            console.log('add page')
                            const elementsInSection = Object.values(section.pages)
                              .map((page) => page.state.map((state) => state.element.elementIndex))
                              .flat()
                            const latestElementInSection = Math.max(...elementsInSection)
                            await createElement({
                              variables: {
                                data: {
                                  category: 'INFORMATION',
                                  code: 'PB2',
                                  elementTypePluginCode: 'pageBreak',
                                  sectionId: section.details.id,
                                  index: latestElementInSection + 1,
                                  isEditable: { value: true },
                                  isRequired: { value: true },
                                  parameters: null,
                                  title: 'Page Break',
                                  validation: { value: true },
                                  validationMessage: null,
                                  visibilityCondition: { value: true },
                                },
                              },
                            })

                            await createElement({
                              variables: {
                                data: {
                                  category: 'INFORMATION',
                                  code: 'PlaceholderForText',
                                  elementTypePluginCode: 'textInfo',
                                  sectionId: section.details.id,
                                  index: latestElementInSection + 2,
                                  isEditable: { value: true },
                                  isRequired: { value: true },
                                  parameters: { text: 'Placeholder for page' },
                                  title: 'placeholderForPage',
                                  validation: { value: true },
                                  validationMessage: null,
                                  visibilityCondition: { value: true },
                                },
                              },
                            })
                            refetch()
                          }}
                          style={{ cursor: 'pointer', background: 'white', padding: 2, margin: 2 }}
                        />
                      }
                    />
                  </Label>
                </div>

                {Object.keys(section.pages).map((page) => (
                  <Segment key={`${section.details.id}-${page}`} basic>
                    <Segment vertical style={{ marginBottom: 10 }}>
                      <PageElements
                        refetch={refetch}
                        pageName={page}
                        fullStructure={fullStructure}
                        elements={getCurrentPageElements(fullStructure, sectionCode, page)}
                        responsesByCode={responsesByCode}
                        isStrictPage={false}
                        shouldShowConfig={shouldShowConfig}
                        isEditable
                      />
                    </Segment>
                  </Segment>
                ))}
              </Segment>
            ))}
          </Grid.Column>
          <Grid.Column width={2} />
        </Grid>
      </Segment.Group>
    </>
  )
}

const getCurrentPageElements = (structure: FullStructure, section: string, page: string) => {
  return structure.sections[section].pages[page].state.map(
    (item) => item.element
  ) as ElementStateNEW[]
}

const TemplateForm: React.FC = ({ all }: any) => {
  return (
    <div>
      <GetApplication all={all}></GetApplication>
    </div>
  )
}

interface PageElementProps {
  elements: ElementStateNEW[]
  responsesByCode: ResponsesByCode
  isStrictPage?: boolean
  isEditable?: boolean
  isReview?: boolean
}

const PageElements: React.FC<PageElementProps> = ({
  elements,
  pageName,
  fullStructure,
  responsesByCode,
  isStrictPage,
  refetch,
  shouldShowConfig,
  isEditable = true,
  isReview = false,
}) => {
  const [createElement] = useCreateTemplateElementMutation()
  // Applicant Editable application
  console.log(elements)
  return (
    <Form>
      <Header content={pageName} />
      <Label
        floating
        circular
        style={{
          left: 'auto',
          right: 0,
          background: 'none',
          top: '0em',
          margin: 0,
          padding: 0,
        }}
      >
        <Popup
          content="Add Element"
          trigger={
            <Icon
              name="add"
              onClick={async () => {
                console.log('add element')
                console.log(elements)
                await createElement({
                  variables: {
                    data: {
                      applicationResponsesUsingId: {
                        create: { applicationId: fullStructure.info.id },
                      },
                      index: Math.max(...elements.map(({ fullElement }) => fullElement.index)),
                      code: `NewElement${Math.random() * 10000}`,
                      title: 'DefaultTitle',
                      elementTypePluginCode: 'shortText',
                      sectionId: elements[0].fullElement.sectionId,

                      category: 'QUESTION',
                      visibilityCondition: {
                        value: true,
                      },
                      isRequired: {
                        value: true,
                      },
                      isEditable: {
                        value: true,
                      },
                      validation: {
                        value: true,
                      },
                      validationMessage: 'DefaultValidationMessage',
                      parameters: {
                        text: 'Default Text',
                        title: 'Default Label',
                      },
                    },
                  },
                })
                refetch()
              }}
              size="large"
              style={{ cursor: 'pointer', background: 'white', padding: 2, margin: 2 }}
            />
          }
        />
      </Label>

      {elements.map((element) => {
        const {
          code,
          pluginCode,
          parameters,
          isVisible,
          isRequired,
          isEditable,
          validationExpression,
          validationMessage,
        } = element
        const response = responsesByCode?.[code]
        const isValid = response?.isValid
        console.log('rendering')
        // Regular application view
        if (isEditable && !isReview) {
          const { ['__typename']: tp, ...fullElement } = element.fullElement
          return (
            <>
              <ApplicationViewWrapper
                key={`question_${code}`}
                code={code}
                initialValue={response}
                pluginCode={pluginCode}
                parameters={parameters}
                isVisible={isVisible}
                isEditable={isEditable}
                isRequired={isRequired}
                isValid={isValid || true}
                isStrictPage={isStrictPage}
                validationExpression={validationExpression}
                validationMessage={validationMessage}
                allResponses={responsesByCode}
                currentResponse={response}
              />
              {!shouldShowConfig ? null : (
                <TemplateElement refetch={refetch} fullElement={fullElement} />
              )}
            </>
          )
        }
        // Summary Page -- TO-DO
        if (!isEditable && !isReview) return <p>Summary View</p>
        // Review Page -- TO-DO
        if (isReview) return <p>Review Elements</p>
      })}
    </Form>
  )
}
const TemplateElement: React.FC = ({ fullElement, refetch }) => {
  const [change, setChange] = useState({})

  const onChange = (key: any) => (_: any, { value }: any) => {
    setChange({ ...change, [key]: value })
  }
  const [updateTemplateElement] = useUpdateTemplateElementMutation()
  const mutate = async () => {
    await updateTemplateElement({ variables: { id: fullElement.id, data: change.data } })
    refetch()
  }

  const { id, ...element } = fullElement

  return (
    <Accordion
      defaultActiveIndex={-1}
      panels={[
        {
          key: 'key',
          title: {
            icon: 'setting',
          },
          content: {
            content: (
              <JsonTextArea defaultValue={element} onChange={onChange('data')} onBlur={mutate} />
            ),
          },
        },
      ]}
    />
  )
}

const CreateUpdateSection: React.FC = ({
  sections,
  toggleOpen,
  fullStructure,
  triggerUpdate,
  currentSectionCode = null,
  all,
}: any) => {
  const [isOpen, setIsOpen] = useState(false)
  const [lastToggleOpen, setLastToggleOpen] = useState(false)

  const [changes, setChanges] = useState({})
  const [currentSection, setCurrentSection] = useState({})

  const [createSection] = useCreateTemplateSectionMutation()
  const [updateSection] = useUpdateTemplateSectionMutation()
  useEffect(() => {
    if (currentSectionCode === null) {
      const newSection = {
        title: 'New Section Title',
        code: 'newSectionCode',
      }
      setChanges(newSection)
      setCurrentSection(newSection)
    } else {
      console.log({ currentSectionCode, sections })
      const { totalPages, ...existinSection } = sections[currentSectionCode].details
      setCurrentSection(existinSection)
    }
  }, [currentSectionCode])

  useEffect(() => {
    if (toggleOpen === lastToggleOpen) return

    setIsOpen(true)
    setLastToggleOpen(toggleOpen)
  }, [toggleOpen])

  const create = async () => {
    let latestIndex = Math.max(...Object.values(sections).map((section) => section.details.index))
    await createSection({
      variables: {
        data: {
          templateId: all.template.id,
          ...changes,
          index: latestIndex + 1,
          applicationSectionsUsingId: {
            create: { applicationId: fullStructure.info.id },
          },
        },
      },
    })
    triggerUpdate()
  }

  const update = async () => {
    await updateSection({
      variables: {
        id: currentSection.id,
        data: changes,
      },
    })
    triggerUpdate()
  }
  const onChange = (key) => (_, { value }) => setChanges({ ...changes, [key]: value })

  return (
    <Modal open={isOpen} onClose={() => setIsOpen(false)}>
      <Modal.Header>{`${currentSectionCode === null ? 'Create' : 'Update'} Section`}</Modal.Header>
      <Modal.Content>
        <Input
          style={{ margin: 10 }}
          label="Title"
          defaultValue={currentSection.title}
          onChange={onChange('title')}
        />
        <Input
          style={{ margin: 10 }}
          label="Code"
          defaultValue={currentSection.code}
          onChange={onChange('code')}
        />

        <Button
          style={{ margin: 10 }}
          icon={currentSectionCode === null ? 'add' : 'save'}
          onClick={async () => {
            if (currentSectionCode === null) await create()
            else await update()
            setIsOpen(false)
          }}
        />

        {currentSectionCode && (
          <Button
            style={{ margin: 10 }}
            icon={'delete'}
            onClick={() => {
              console.log('TODO delete')
              setIsOpen(false)
            }}
          />
        )}
      </Modal.Content>
    </Modal>
  )
}

export default Template
