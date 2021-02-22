import React, { useEffect, useState } from 'react'
import {
  Accordion,
  Button,
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
} from 'semantic-ui-react'
import {
  useCreateTemplateCategoryMutation,
  useGetPermissionPoliciesQuery,
  useGetTemplateCategoriesQuery,
  useGetTemplatePermissionsQuery,
  useGetPermissionNamesQuery,
  useUpdateTemplateCategoryMutation,
  useCreateTemplateStageMutation,
  useUpdateTemplateStageMutation,
  TemplatePermissionsOrderBy,
  useCreateTemplatePermissionMutation,
  useDeleteTemplatePermissionMutation,
  useUpdateTemplatePermissionMutation,
} from '../../utils/generated/graphql'
import useLoadTemplate from '../../utils/hooks/useLoadTemplate'
import { useRouter } from '../../utils/hooks/useRouter'
import GeneralTab from './GeneralTab'
import ActionsTab from './ActionsTab'
import TextareaAutosize from 'react-textarea-autosize'
import stageFragment from '../../utils/graphql/fragments/stage.fragment'
import deleteTemplatePermissionMutation from '../../utils/graphql/mutations/deleteTemplatePermission.mutation'
import JsonTextArea from './JsonTextArea'

const options = {
  Apply: 'APPLY',
  Review: 'REVIEW',
  Assign: 'ASSIGN',
}

const TemplatePermission: React.FC = ({ templatePermission }: any) => {
  const [deleteTemplatePermission] = useDeleteTemplatePermissionMutation()
  const [updateTemplatePermission] = useUpdateTemplatePermissionMutation()
  const [change, setChanges] = useState({})
  const updateChanges = (key: any) => (_: any, { value }: any) =>
    setChanges({ ...change, [key]: value })

  const mutateTemplatePermission = ({}) =>
    updateTemplatePermission({ variables: { id: templatePermission.id, data: change } })

  return (
    <Form>
      <Form.Field>
        <label>Restrictions</label>
        <JsonTextArea
          defaultValue={templatePermission.restrictions || '{}'}
          onChange={updateChanges('restrictions')}
          onBlur={mutateTemplatePermission}
        />
      </Form.Field>
      <Button
        onClick={() => {
          deleteTemplatePermission({ variables: { id: templatePermission.id } })
        }}
      >
        Delete
      </Button>
    </Form>
  )
}

const PermissionList: React.FC = ({
  permissionPolicyType,
  templatePermissions,
  level = null,
  stageNumber = null,
}: any) => {
  console.log(templatePermissions, permissionPolicyType)

  const panels = (
    templatePermissions?.filter((templatePermission: any) => {
      console.log(
        'hmm',
        templatePermission.permissionName.permissionPolicy.type,
        permissionPolicyType
      )
      return (
        templatePermission.permissionName.permissionPolicy.type === permissionPolicyType &&
        (level === null || templatePermission.level === level) &&
        (stageNumber === null || templatePermission.stageNumber === stageNumber)
      )
    }) || []
  ).map((templatePermission: any, index: any) => ({
    key: templatePermission.id,
    title: `${templatePermission.permissionName.name} - ${templatePermission.permissionName.permissionPolicy.name} {Description}`,
    content: {
      content: (
        <TemplatePermission key={templatePermission.id} templatePermission={templatePermission} />
      ),
    },
  }))

  if (panels.length === 0) return null
  return <Accordion styled defaultActiveIndex={-1} panels={panels} />
}
const getPermissionNames = (permissionPolicyType: any, permissionNames: any) => {
  console.log({ permissionPolicyType, permissionNames })
  return permissionNames?.permissionNames?.nodes
    .filter((permissionName: any) => permissionName.permissionPolicy.type === permissionPolicyType)
    .map((permissionName: any) => ({
      key: permissionName.name,
      text: permissionName.name,
      value: permissionName.id,
    }))
}

const Permissions: React.FC = ({ all }: any) => {
  const { data: permissionPolicies } = useGetPermissionPoliciesQuery()
  const { data: permissionNames } = useGetPermissionNamesQuery()
  const [maxStage, setMaxStage] = useState(all.templateStages.length)
  const [createStageMutation] = useCreateTemplateStageMutation()
  const [createTemplatePermission] = useCreateTemplatePermissionMutation()

  console.log(
    permissionPolicies?.permissionPolicies?.nodes.filter(
      (permissisonPolicy: any) => permissisonPolicy.type === 'APPLY'
    )
  )

  return (
    <div>
      {Object.entries(options).map(([type, permissionPolicyType]: any) => (
        <Message key={type} style={{ background: 'white' }}>
          {type === 'Apply' ? (
            <Dropdown
              button
              className="icon"
              floating
              labeled
              icon="add"
              style={{ margin: 20 }}
              text={type}
              onClick={(...all) => {
                console.log('clicked', all)
              }}
              options={getPermissionNames(permissionPolicyType, permissionNames)}
              onChange={(_, { value }) => {
                createTemplatePermission({
                  variables: {
                    data: {
                      templateId: all.template.id,

                      restrictions: {},
                      permissionNameId: Number(value),
                    },
                  },
                })
              }}
            />
          ) : (
            <Button
              animated
              onClick={() => {
                createStageMutation({
                  variables: {
                    data: {
                      templateId: all.template.id,
                      title: `New Stage ${maxStage + 1}`,
                      number: maxStage + 1,
                    },
                  },
                })
                setMaxStage(maxStage + 1)
              }}
            >
              <Button.Content visible>
                {' '}
                <Icon size="large" name="add square" />
                {`${type}`}
              </Button.Content>
              <Button.Content hidden>
                {' '}
                <Icon size="large" name="add square" />
                Add Stage
              </Button.Content>
            </Button>
          )}

          {type === 'Apply' ? (
            <PermissionList
              permissionPolicyType={permissionPolicyType}
              templatePermissions={all.templatePermissions}
            />
          ) : (
            [...all.templateStages]
              .sort((templateStage1: any, templateStage2: any) => {
                console.log(templateStage1.number, templateStage2.number)
                return templateStage1.number - templateStage2.number
              })
              .map((templateStage: any) => (
                <Stage
                  key={templateStage.id}
                  all={all}
                  type={type}
                  permissionPolicyType={permissionPolicyType}
                  templateStage={templateStage}
                  permissionNames={permissionNames}
                />
              ))
          )}
        </Message>
      ))}
      <pre>{JSON.stringify(all.templateStages, null, ' ')}</pre>
      {permissionNames?.permissionNames?.nodes ? (
        <pre>{JSON.stringify(permissionNames?.permissionNames?.nodes, null, ' ')}</pre>
      ) : null}
      {permissionPolicies?.permissionPolicies?.nodes ? (
        <pre>{JSON.stringify(permissionPolicies?.permissionPolicies?.nodes, null, ' ')}</pre>
      ) : null}
      {permissionNames?.templatePermissionNames?.nodes ? (
        <pre>{JSON.stringify(permissionNames?.templatePermissionNames?.nodes, null, ' ')}</pre>
      ) : null}
    </div>
  )
}

const Stage: React.FC = ({
  type,
  templateStage,
  permissionPolicyType,
  permissionNames,
  all,
}: any) => {
  const [toggleOpen, setToggleOpen] = useState(false)
  const [levels, setLevels] = useState<any>([])
  const [calculateLevels, setCalculateLevels] = useState(true)
  const [createTemplatePermission] = useCreateTemplatePermissionMutation()

  useEffect(() => {
    if (calculateLevels && (permissionNames?.permissionNames?.nodes || []).length > 0) {
      let numberOfReviewLevels: any = 0

      permissionNames?.permissionNames?.nodes?.forEach((permissionName: any) => {
        permissionName?.templatePermissions?.nodes?.forEach((tempalatePermission: any) => {
          if (
            permissionName.permissionPolicy.type === 'REVIEW' &&
            tempalatePermission.templateId === all.template.id &&
            tempalatePermission.stageNumber === templateStage.number &&
            numberOfReviewLevels < Number(tempalatePermission.level)
          ) {
            numberOfReviewLevels = Number(tempalatePermission.level)
          }
        })
      })

      const levels: any = []
      for (let i = 0; i < numberOfReviewLevels; i++) levels.push(i + 1)

      setLevels(levels)
      setCalculateLevels(false)
    }
  }, [permissionNames])

  console.log({ getPermissionNames })
  return (
    <Message key={templateStage.id}>
      <UpdateTemplateStage toggleOpen={toggleOpen} templateStage={templateStage} />
      {type === 'Review' ? (
        <Button
          animated
          onClick={() => {
            setLevels([...levels, levels.length + 1])
          }}
        >
          <Button.Content visible>{`Stage - ${templateStage.title}`}</Button.Content>
          <Button.Content hidden>
            {' '}
            <Icon size="large" name="add square" />
          </Button.Content>
        </Button>
      ) : (
        <Dropdown
          button
          className="icon"
          floating
          labeled
          icon="add"
          style={{ margin: 20 }}
          text={`Stage - ${templateStage.title}`}
          options={getPermissionNames(permissionPolicyType, permissionNames)}
        />
      )}

      <Button
        icon="edit"
        onClick={() => {
          setToggleOpen(!toggleOpen)
        }}
      />
      {type === 'Assign' ? (
        <PermissionList
          permissionPolicyType={permissionPolicyType}
          templatePermissions={all.templatePermissions}
          stageNumber={templateStage.number}
        />
      ) : (
        levels.map((level: any) => (
          <Message key={level}>
            <Dropdown
              button
              className="icon"
              floating
              labeled
              icon="add"
              style={{ margin: 20 }}
              text={`Level - ${level}`}
              options={getPermissionNames(permissionPolicyType, permissionNames)}
              onChange={(_, { value }) => {
                createTemplatePermission({
                  variables: {
                    data: {
                      templateId: all.template.id,
                      level,
                      stageNumber: templateStage.number,
                      restrictions: {},
                      permissionNameId: Number(value),
                    },
                  },
                })
              }}
            />

            <PermissionList
              permissionPolicyType={permissionPolicyType}
              templatePermissions={all.templatePermissions}
              level={level}
              stageNumber={templateStage.number}
            />
          </Message>
        ))
      )}
    </Message>
  )
}

const UpdateTemplateStage: React.FC = ({ toggleOpen, templateStage = {} }: any) => {
  const [isOpen, setIsOpen] = useState(false)
  const [lastToggleOpen, setLastToggleOpen] = useState(false)
  const [changes, setChanges] = useState({})

  const [updateTemplateStage] = useUpdateTemplateStageMutation()

  useEffect(() => {
    if (toggleOpen === lastToggleOpen) return

    setChanges({})
    setIsOpen(true)
    setLastToggleOpen(toggleOpen)
  }, [toggleOpen])

  const updateChanges = (key: any) => (_: any, { value }: any) => {
    setChanges({ ...changes, [key]: value })
  }

  const mutateTemplateStage = () => {
    updateTemplateStage({ variables: { id: templateStage.id, data: changes } })
  }

  return (
    <Modal open={isOpen} onClose={() => setIsOpen(false)}>
      <Modal.Header>Update Template Stage</Modal.Header>
      <Modal.Content>
        <Form>
          <Form.Field>
            <label>Title</label>
            <Input defaultValue={templateStage.title} onChange={updateChanges('title')} />
          </Form.Field>

          <Form.Field>
            <label>Description</label>
            <Input
              defaultValue={templateStage.description}
              onChange={updateChanges('description')}
            />
          </Form.Field>
        </Form>
        <br />
        <Button
          icon="save"
          onClick={() => {
            mutateTemplateStage()
            setIsOpen(false)
          }}
        >
          save
        </Button>
      </Modal.Content>
    </Modal>
  )
}

export default Permissions
