import React from 'react'
import { matchPath } from 'react-router'
import { Header, Label, Message } from 'semantic-ui-react'
import { Loading, NoMatch } from '../../../components'
import strings from '../../../utils/constants'

import {
  GetFullTemplateInfoQuery,
  useGetFullTemplateInfoQuery,
} from '../../../utils/generated/graphql'
import { useRouter } from '../../../utils/hooks/useRouter'

import Actions from './Actions'
import Form from './Form'
import General from './General'
import Permissions from './Permissions'

export type TemplateInfo = GetFullTemplateInfoQuery['template']

const tabs = [
  {
    route: 'general',
    title: 'General',
    render: (templateInfo: TemplateInfo) => <General templateInfo={templateInfo} />,
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

const TemplateWrapper: React.FC = () => {
  const {
    match: { path },
    push,
    location,
    query: { templateId },
  } = useRouter()

  const { data, error } = useGetFullTemplateInfoQuery({
    fetchPolicy: 'network-only',
    variables: { id: Number(templateId) },
  })

  const selected = tabs.find(({ route }) =>
    matchPath(location.pathname, { path: `${path}/${route}`, exact: true, strict: false })
  )

  if (!selected) return <NoMatch />
  if (error) return <Message error title={strings.ERROR_GENERIC} />
  if (!data) return <Loading />

  const templateInfo = data.template

  return (
    <div className="template-config">
      <div className="indicators-container as-row">
        <div key="version" className="indicator">
          <Label className="key" content="version" />
          <Label className="value" content={templateInfo?.version} />
        </div>
        <div key="name" className="indicator">
          <Label className="key" content="name" />
          <Label className="value" content={templateInfo?.name} />
        </div>
        <div key="code" className="indicator">
          <Label className="key" content="code" />
          <Label className="value" content={templateInfo?.code} />
        </div>
        <div key="status" className="indicator">
          <Label className="key" content="status" />
          <Label className="value" content={templateInfo?.status} />
        </div>
        <div key="applicationCount" className="indicator">
          <Label className="key" content="# applications" />
          <Label className="value" content={templateInfo?.applications.totalCount} />
        </div>
      </div>
      <div key="tabs" className="template-config-tabs">
        {tabs.map(({ route, title }) => (
          <div
            key={title}
            onClick={() => push(`/admin/template/${templateId}/${route}`)}
            className={selected.route === route ? 'selected' : ''}
          >
            <Header as="h4">{title}</Header>
          </div>
        ))}
      </div>
      {selected.render(templateInfo)}
    </div>
  )
}

export default TemplateWrapper
