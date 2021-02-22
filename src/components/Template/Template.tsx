import React, { useEffect, useState } from 'react'
import {
  Button,
  Container,
  Dropdown,
  Header,
  Icon,
  Input,
  Label,
  Menu,
  Modal,
  Portal,
  Segment,
} from 'semantic-ui-react'
import {
  useCreateTemplateCategoryMutation,
  useGetTemplateCategoriesQuery,
  useUpdateTemplateCategoryMutation,
} from '../../utils/generated/graphql'
import useLoadTemplate from '../../utils/hooks/useLoadTemplate'
import { useRouter } from '../../utils/hooks/useRouter'
import GeneralTab from './GeneralTab'
import ActionsTab from './ActionsTab'
import PermissionsTab from './PermissionsTab'

type TParams = { templateId: string; step?: string }

const Form: React.FC = ({ all }: any) => {
  return (
    <div>
      <pre>{JSON.stringify(all.template, null, ' ')}</pre>
    </div>
  )
}

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
      {activeItem === 'Form' ? <Form all={all} /> : null}
      {activeItem === 'General' ? <GeneralTab all={all} /> : null}
      {activeItem === 'Actions' ? <ActionsTab all={all} /> : null}
      {activeItem === 'Permissions' ? <PermissionsTab all={all} /> : null}
    </div>
  )
}
export default Template
