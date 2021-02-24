import React, { useEffect, useState } from 'react'
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
} from 'semantic-ui-react'

import {
  useCreateTemplateCategoryMutation,
  useGetTemplateCategoriesQuery,
  useUpdateTemplateElementMutation,
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
    serialNumber: `${all?.wholeTemplate?.applications?.nodes[1]?.serial || 0}`,
  })

  if (!structure) return null

  return (
    <GetAppicationDetails all={all} structure={structure} refetch={refetch} template={template} />
  )
}

const GetAppicationDetails: React.FC = ({ structure, all, template, refetch }: any) => {
  const { error, isLoading, fullStructure, responsesByCode } = useGetFullApplicationStructure({
    structure,
  })
  if (!fullStructure || !responsesByCode) return null
  console.log(fullStructure)
  return (
    <>
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
          <Grid.Column width={4}></Grid.Column>

          <Grid.Column width={10} stretched>
            {Object.entries(fullStructure.sections).map(([sectionCode, section]) =>
              Object.keys(section.pages).map((page) => (
                <Segment key={`${sectionCode}-${page}`} basic>
                  <Segment vertical style={{ marginBottom: 20 }}>
                    <Header content={fullStructure.sections[sectionCode].details.title} />

                    <PageElements
                      refetch={refetch}
                      elements={getCurrentPageElements(fullStructure, sectionCode, page)}
                      responsesByCode={responsesByCode}
                      isStrictPage={false}
                      isEditable
                    />
                  </Segment>
                </Segment>
              ))
            )}
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
  responsesByCode,
  isStrictPage,
  refetch,
  isEditable = true,
  isReview = false,
}) => {
  // Applicant Editable application
  console.log(elements)
  return (
    <Form>
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
              <TemplateElement refetch={refetch} fullElement={fullElement} />
              <pre>{JSON.stringify(fullElement, null, ' ')}</pre>
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

  return <JsonTextArea defaultValue={fullElement} onChange={onChange('data')} onBlur={mutate} />
}

export default Template
