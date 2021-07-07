import React, { createContext, useContext, useEffect, useState } from 'react'
import { matchPath } from 'react-router'
import { Header, Message } from 'semantic-ui-react'
import { Loading, NoMatch } from '../../../components'
import strings from '../../../utils/constants'

import {
  FullTemplateFragment,
  GetFullTemplateInfoQuery,
  TemplateCategory,
  TemplateElement,
  TemplateFilterJoin,
  TemplateSection,
  TemplateStatus,
  useGetFullTemplateInfoQuery,
} from '../../../utils/generated/graphql'
import { useRouter } from '../../../utils/hooks/useRouter'
import { TextIO } from '../shared/components'
import OperationContext from '../shared/OperationContext'

import Actions from './Actions'
import Form from './Form'
import General from './General/General'
import Permissions from './Permissions'

export type TemplateInfo = GetFullTemplateInfoQuery['template']

const tabs = [
  {
    route: 'general',
    title: 'General',
    render: () => <General />,
  },
  {
    route: 'form',
    title: 'Form',
    render: (templateInfo: TemplateInfo) => <Form templateInfo={templateInfo} />,
  },
  {
    route: 'permissions',
    title: 'Permissions',
    render: (templateInfo: TemplateInfo) => <Permissions templateInfo={templateInfo} />,
  },
  {
    route: 'actions',
    title: 'Actions',
    render: (templateInfo: TemplateInfo) => <Actions templateInfo={templateInfo} />,
  },
]

const TemplateContainer: React.FC = () => {
  const {
    match: { path },
    push,
    location,
  } = useRouter()
  const {
    template: { version, name, code, status, applicationCount, id },
    fromQuery: templateInfo,
  } = useTemplateState()

  const selected = tabs.find(({ route }) =>
    matchPath(location.pathname, { path: `${path}/${route}`, exact: true, strict: false })
  )

  if (!selected) return <NoMatch />

  return (
    <OperationContext>
      <div className="template-builder-wrapper">
        <div className="template-builder-info-bar">
          <TextIO title="version" text={String(version)} />
          <TextIO title="name" text={name} />
          <TextIO title="code" text={code} />
          <TextIO title="status" text={status} />
          <TextIO title="# applications" text={String(applicationCount)} />
        </div>
        <div className="template-builder-tabs">
          {tabs.map(({ route, title }) => (
            <div
              key={title}
              onClick={() => push(`/admin/template/${id}/${route}`)}
              className={selected.route === route ? 'selected' : ''}
            >
              <Header as="h4">{title}</Header>
            </div>
          ))}
        </div>
        {selected.render(templateInfo)}
      </div>
    </OperationContext>
  )
}

type TemplateContextState = {
  template: {
    id: number
    isDraft: boolean
    version: number
    name: string
    code: string
    status: string
    applicationCount: number
  }
  refetch: () => void
  category?: TemplateCategory
  sections: TemplateSection[]
  templateFilterJoins: TemplateFilterJoin[]
  allElements: TemplateElement[]
  fromQuery?: FullTemplateFragment
}

const defaultTemplateContextState: TemplateContextState = {
  template: {
    id: 0,
    isDraft: false,
    version: 0,
    name: '',
    code: '',
    status: '',
    applicationCount: 0,
  },
  refetch: () => {},
  sections: [],
  allElements: [],
  templateFilterJoins: [],
}

const Context = createContext<TemplateContextState>(defaultTemplateContextState)

const TemplateWrapper: React.FC = () => {
  const {
    query: { templateId },
  } = useRouter()

  const [state, setState] = useState<TemplateContextState>(defaultTemplateContextState)
  const [firstLoaded, setFirstLoaded] = useState(false)
  const { data, error, refetch } = useGetFullTemplateInfoQuery({
    fetchPolicy: 'network-only',
    variables: { id: Number(templateId) },
  })

  useEffect(() => {
    const template = data?.template
    const sections = (template?.templateSections?.nodes as TemplateSection[]) || []
    const allElements = sections
      .map((section) => (section.templateElementsBySectionId?.nodes as TemplateElement[]) || [])
      .flat()
    if (template) {
      setState({
        template: {
          id: template.id || 0,
          version: template?.version || 0,
          name: template?.name || '',
          code: template?.code || '',
          status: template?.status || TemplateStatus.Disabled,
          applicationCount: template?.applications?.totalCount || 0,
          isDraft: template.status === TemplateStatus.Draft,
        },
        category: (template?.templateCategory as TemplateCategory) || undefined,
        fromQuery: template,
        sections,
        allElements,
        refetch,
        templateFilterJoins: (template?.templateFilterJoins?.nodes || []) as TemplateFilterJoin[],
      })
      setFirstLoaded(true)
    }
  }, [data])

  if (error) return <Message error title={strings.ERROR_GENERIC} list={[error]} />

  if (!firstLoaded) return <Loading />
  return (
    <Context.Provider value={state}>
      <TemplateContainer />
    </Context.Provider>
  )
}

export const useTemplateState = () => useContext(Context)
export default TemplateWrapper
