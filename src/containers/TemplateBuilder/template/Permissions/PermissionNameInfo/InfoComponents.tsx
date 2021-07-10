import React from 'react'
import {
  PermissionJoin,
  Template,
  TemplateAction,
  TemplateElement,
  TemplatePermission,
} from '../../../../../utils/generated/graphql'
import Evaluation from '../../../shared/Evaluation'
import { Parameters } from '../../../shared/Parameters'
import TextIO from '../../../shared/TextIO'

type TemplateInfoProps = {
  template: Template | null
}

export const TemplateInfo: React.FC<TemplateInfoProps> = ({ template }) => (
  <div className="flex-row-start-start">
    <TextIO title="Template" text={`${template?.code} - ${template?.name} `} />
    <TextIO
      title="Version"
      icon="info circle"
      link={`/admin/template/${template?.id}/permissions`}
      text={String(template?.version)}
    />
    <TextIO title="Status" text={String(template?.status)} />
  </div>
)

type PermissionUserAndOrganistaionProps = {
  permissionJoin: PermissionJoin
}

export const PermissionUserAndOrganisationInfo: React.FC<PermissionUserAndOrganistaionProps> = ({
  permissionJoin,
}) => (
  <div className="config-container-alternate">
    <div className="flex-row-start-start">
      <TextIO title="Username" text={permissionJoin?.user?.username || ''} />
      <TextIO
        title="Name"
        text={`${permissionJoin?.user?.firstName} ${permissionJoin?.user?.lastName}`}
      />
      {permissionJoin?.organisation?.name && (
        <TextIO title="Organisation" text={permissionJoin?.organisation?.name || ''} />
      )}
    </div>
  </div>
)

type PermissionActionsProps = {
  templateAction: TemplateAction
}

export const PermissionActionInfo: React.FC<PermissionActionsProps> = ({ templateAction }) => {
  return (
    <div className="config-container-alternate">
      <div className="flex-row-start-start">
        <TemplateInfo template={templateAction?.template as Template} />
        <TextIO title="Action" text={templateAction?.actionCode || ''} />
        <TextIO title="Trigger" text={templateAction?.trigger || ''} />
      </div>
      <Evaluation
        label="condition"
        currentElementCode={''}
        evaluation={templateAction?.condition}
        setEvaluation={() => {}}
      />
      <Parameters
        key="parametersElement"
        currentElementCode={''}
        parameters={templateAction?.parameterQueries || {}}
        setParameters={() => {}}
      />
    </div>
  )
}

type TemplateElementProps = {
  templateElement: TemplateElement
}

export const TemplateElementInfo: React.FC<TemplateElementProps> = ({ templateElement }) => {
  return (
    <div className="config-container-alternate">
      <div className="flex-row-start-start">
        <TemplateInfo template={templateElement?.section?.template as Template} />
        <TextIO
          title="Template Element"
          text={`${templateElement?.code} - ${templateElement?.title}`}
        />
      </div>
      <Parameters
        key="parametersElement"
        currentElementCode={''}
        parameters={templateElement?.parameters || {}}
        setParameters={() => {}}
      />
    </div>
  )
}

type TemplatePermissionProps = {
  templatePermission: TemplatePermission
}

export const TemplatePermissionInfo: React.FC<TemplatePermissionProps> = ({
  templatePermission,
}) => {
  return (
    <div className="config-container-alternate">
      <div className="flex-row-start-start">
        <TemplateInfo template={templatePermission?.template as Template} />
        <TextIO title="Status" text={String(templatePermission?.template?.status)} />
        {Number(templatePermission?.stageNumber || 0) > 0 && (
          <TextIO title="Stage Number" text={String(templatePermission?.stageNumber)} />
        )}
        {Number(templatePermission?.levelNumber || 0) > 0 && (
          <TextIO title="Review Level" text={String(templatePermission?.levelNumber)} />
        )}
      </div>
    </div>
  )
}
