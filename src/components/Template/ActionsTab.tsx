import React, { useEffect, useState } from 'react'
import {
  Accordion,
  Button,
  Card,
  Container,
  Dropdown,
  Form,
  Header,
  Icon,
  Input,
  Label,
  Menu,
  Message,
  Modal,
  Portal,
  Segment,
  TextArea,
} from 'semantic-ui-react'
import TextareaAutosize from 'react-textarea-autosize'
import {
  useCreateTemplateActionMutation,
  useCreateTemplateCategoryMutation,
  useDeleteTemplateActionMutation,
  useGetTemplateCategoriesQuery,
  useUpdateTemplateActionMutation,
  useUpdateTemplateCategoryMutation,
  Trigger,
} from '../../utils/generated/graphql'
import useLoadTemplate from '../../utils/hooks/useLoadTemplate'
import { useRouter } from '../../utils/hooks/useRouter'
import GeneralTab from './GeneralTab'
import ActionsTab from './ActionsTab'
import JsonTextArea from './JsonTextArea'

const options = {
  Application: [
    'ON_APPLICATION_CREATE',
    'ON_APPLICATION_SUBMIT',
    'ON_APPLICATION_SAVE',
    'ON_APPLICATION_WITHDRAW',
  ],

  Review: ['ON_REVIEW_CREATE', 'ON_REVIEW_SUBMIT', 'ON_REVIEW_START'],
  Assignment: ['ON_REVIEW_ASSIGN'],
}
const Actions: React.FC = ({ all }: any) => {
  const [createActionMutation] = useCreateTemplateActionMutation()
  const structure = {
    Application: options.Application.filter((trigger) =>
      all.templateActions.find((templateAction: any) => templateAction.trigger === trigger)
    ),

    Review: options.Review.filter((trigger) =>
      all.templateActions.find((templateAction: any) => templateAction.trigger === trigger)
    ),

    Assignment: options.Assignment.filter((trigger) =>
      all.templateActions.find((templateAction: any) => templateAction.trigger === trigger)
    ),
  }

  return (
    <div>
      {Object.entries(structure).map(([type, triggers]: any) => (
        <div key={type}>
          <Dropdown
            button
            className="icon"
            floating
            labeled
            icon="add"
            style={{ margin: 20 }}
            onChange={async (_, { value }) => {
              createActionMutation({
                variables: {
                  data: {
                    actionCode: 'defaultActionCode',
                    templateId: all.template.id,
                    trigger: value as Trigger,
                    condition: true,
                    parameterQueries: { addQueryParameteres: 'here' },
                  },
                },
              })
            }}
            options={options[type].map((trigger: any) => ({
              key: trigger,
              text: trigger,
              value: trigger,
            }))}
            text={type}
          />
          {triggers.map((trigger: any) => (
            <Message>
              <Message.Header>{trigger}</Message.Header>
              <Accordion
                defaultActiveIndex={-1}
                panels={all.templateActions
                  .filter((templateAction: any) => templateAction.trigger === trigger)
                  .map((templateAction: any) => ({
                    key: templateAction.id,
                    title: templateAction.actionCode || 'defaultActionCode',
                    content: {
                      content: <Action templateAction={templateAction} />,
                    },
                  }))}
                styled
              />
            </Message>
          ))}
        </div>
      ))}
      <pre>{JSON.stringify(all.templateActions, null, ' ')}</pre>
    </div>
  )
}

const Action: React.FC = ({ templateAction }: any) => {
  const [actionChange, setActionChange] = useState({})
  const [updateActionMutation] = useUpdateTemplateActionMutation()
  const [deleteTemplateActionMutation] = useDeleteTemplateActionMutation()

  const updateAction = (key: any) => (_: any, { value }: any) => {
    console.log(key, value, actionChange)
    setActionChange({ ...actionChange, [key]: value })
  }
  const mutationAction = () => {
    console.log(actionChange)
    updateActionMutation({ variables: { id: templateAction.id, data: actionChange } })
  }

  return (
    <Form>
      <Form.Field>
        <label>Action Code (TODO: get through end point)</label>
        <Input
          defaultValue={templateAction.actionCode}
          onChange={updateAction('actionCode')}
          onBlur={mutationAction}
        />
      </Form.Field>
      <Form.Field>
        <label>Condition</label>
        <JsonTextArea
          defaultValue={templateAction.condition}
          onChange={updateAction('condition')}
          onBlur={mutationAction}
        />
      </Form.Field>
      <Form.Field>
        <label>Parameters</label>
        <JsonTextArea
          defaultValue={templateAction.parameterQueries}
          onChange={updateAction('parameterQueries')}
          onBlur={mutationAction}
        />
      </Form.Field>
      <Button
        onClick={() => deleteTemplateActionMutation({ variables: { id: templateAction.id } })}
      >
        Delete
      </Button>
    </Form>
  )
}

export default Actions
