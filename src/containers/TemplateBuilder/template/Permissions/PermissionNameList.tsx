import React from 'react'
import { PermissionPolicyType } from '../../../../utils/generated/graphql'

import { IconButton } from '../../shared/IconButton'
import { useOperationState } from '../../shared/OperationContext'

import TextIO from '../../shared/TextIO'
import { disabledMessage, useTemplateState } from '../TemplateWrapper'
import { getMatchingTemplatePermission } from './PermissionsHeader'
import ReviewTemplatePermission from './ReviewTemplatePermission'

type PermissionNameListProps = {
  type: PermissionPolicyType
  stageNumber?: number
  levelNumber?: number
}

const PermissionNameList: React.FC<PermissionNameListProps> = ({
  type,
  stageNumber,
  levelNumber,
}) => {
  const {
    template: { id: templateId, isDraft },
    templatePermissions,
  } = useTemplateState()
  const { updateTemplate } = useOperationState()

  const removeTemplatePermission = (id: number) => {
    updateTemplate(templateId, { templatePermissionsUsingId: { deleteById: [{ id }] } })
  }
  return (
    <div className="flex-column-start-start">
      {getMatchingTemplatePermission({ type, stageNumber, templatePermissions, levelNumber }).map(
        (templatePermission) => (
          <div key={templatePermission?.id} className="permission-config-container">
            <div className="flex-row-start-center">
              <TextIO
                title="Permission Name"
                text={templatePermission?.permissionName?.name || ''}
                icon="info circle"
              />
              <TextIO
                title="Permission Policy"
                text={templatePermission?.permissionName?.name || ''}
              />
              <IconButton
                name="window close"
                disabled={!isDraft}
                disabledMessage={disabledMessage}
                onClick={() => removeTemplatePermission(templatePermission?.id || 0)}
              />
            </div>
            {type === PermissionPolicyType.Review && levelNumber && (
              <ReviewTemplatePermission
                templatePermission={templatePermission}
                levelNumber={levelNumber}
              />
            )}
          </div>
        )
      )}
    </div>
  )
}

export default PermissionNameList
