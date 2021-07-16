import React, { useEffect, useState } from 'react'
import ReactJson from 'react-json-view'
import {
  Popup,
  Header,
  Dropdown,
  Icon,
  Label,
  Modal,
  Accordion,
  Button,
  Checkbox,
} from 'semantic-ui-react'
import { Loading } from '../../../../components'
import { Stage } from '../../../../components/Review'
import {
  PermissionPolicyType,
  TemplateStage,
  TemplateStagePatch,
} from '../../../../utils/generated/graphql'

import { IconButton } from '../../shared/IconButton'
import { useOperationState } from '../../shared/OperationContext'

import TextIO, { iconLink } from '../../shared/TextIO'
import { disabledMessage, useTemplateState } from '../TemplateWrapper'
import PermissionNameList from './PermissionNameList'
import PermissionNamesContext from './PermissionNamesContext'
import PermissionReviewLevel from './PermissionReviewLevels'
import PermissionsHeader, { getMatchingTemplatePermission } from './PermissionsHeader'

const PermissionsWrapper: React.FC = () => (
  <PermissionNamesContext>
    <Permissions />
  </PermissionNamesContext>
)

const newStage = {
  title: 'New Stage',
  description: 'new stage description',
  colour: '#24B5DF',
}

type UpdateStage = (id: number, patch: TemplateStagePatch) => void
type CanRemoveStage = (stage: TemplateStage) => boolean
type RemoveStage = (id: number) => void

const Permissions: React.FC = () => {
  const {
    templateStages,
    template: { isDraft, id: templateId },
    templatePermissions,
  } = useTemplateState()
  const { updateTemplate } = useOperationState()

  const latestStageNumber = templateStages.reduce(
    (max, current) => (max > (current?.number || 0) ? max : current?.number || 0),
    0
  )

  const canRemoveStage: CanRemoveStage = (stage) =>
    stage?.number === latestStageNumber &&
    getMatchingTemplatePermission({
      templatePermissions,
      type: PermissionPolicyType.Assign,
      stageNumber: stage?.number || 0,
    }).length === 0 &&
    (stage?.templateStageReviewLevelsByStageId?.nodes || []).length == 0

  const removeStage: RemoveStage = (id) => {
    updateTemplate(templateId, {
      templateStagesUsingId: { deleteById: [{ id }] },
    })
  }

  const addStage = () =>
    updateTemplate(templateId, {
      templateStagesUsingId: { create: [{ number: latestStageNumber + 1, ...newStage }] },
    })

  const updateStage: UpdateStage = (id, patch) => {
    updateTemplate(templateId, {
      templateStagesUsingId: { updateById: [{ id, patch }] },
    })
  }
  return (
    <div className="flex-column-start-start">
      <PermissionsHeader type={PermissionPolicyType.Apply} header={'Apply'} />
      <PermissionNameList type={PermissionPolicyType.Apply} />
      <div className="spacer-20" />
      <div className="flex-row-start-center">
        <Header as="h3" className="no-margin-no-padding">
          Stage
        </Header>
        <IconButton
          name="add square"
          disabled={!isDraft}
          disabledMessage={disabledMessage}
          onClick={addStage}
        />
      </div>
      {templateStages.map((stage) => (
        <div key={stage.id} className="config-container">
          <div className="flex-row-start-center">
            <div className="flex-row-start-center-wrap">
              <TextIO
                title="Name"
                text={stage?.title || ''}
                setText={(title) => updateStage(stage.id, { title })}
                disabled={!isDraft}
                disabledMessage={disabledMessage}
              />
              <TextIO title="Number" text={String(stage?.number)} />
              <TextIO
                title="Color"
                link={iconLink}
                text={stage?.colour || ''}
                color={stage?.colour || ''}
                setText={(colour) => updateStage(stage.id, { colour })}
                disabled={!isDraft}
                disabledMessage={disabledMessage}
              />

              <div className="longer">
                <TextIO
                  title="Description"
                  text={stage?.description || ''}
                  setText={(description) => updateStage(stage.id, { description })}
                  disabled={!isDraft}
                  disabledMessage={disabledMessage}
                />
              </div>
            </div>
            <div className="flex-grow-1" />
            <Stage name={stage?.title || ''} colour={stage?.colour || 'grey'} />
            {canRemoveStage(stage) && (
              <IconButton
                name="window close"
                disabled={!isDraft}
                disabledMessage={disabledMessage}
                onClick={() => removeStage(stage?.id || 0)}
              />
            )}
          </div>
          <div className="spacer-10" />
          <PermissionsHeader
            type={PermissionPolicyType.Assign}
            header={'Level 1 Assign'}
            stageNumber={stage?.number || 0}
          />
          <PermissionNameList stageNumber={stage?.number || 0} type={PermissionPolicyType.Assign} />
          <div className="spacer-10" />
          <PermissionReviewLevel stage={stage} />
        </div>
      ))}
    </div>
  )
}

export default PermissionsWrapper
