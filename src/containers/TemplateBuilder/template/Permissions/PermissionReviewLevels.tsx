import React from 'react'
import { Header } from 'semantic-ui-react'
import { PermissionPolicyType, TemplateStage } from '../../../../utils/generated/graphql'
import { IconButton } from '../../shared/IconButton'
import { useOperationState } from '../../shared/OperationContext'
import TextIO from '../../shared/TextIO'
import { disabledMessage, useTemplateState } from '../TemplateWrapper'
import PermissionNameList from './PermissionNameList'
import PermissionsHeader, { getMatchingTemplatePermission } from './PermissionsHeader'

type PemrmissionReviewLevelProps = {
  stage: TemplateStage
}
type UpdateLevelName = (id: number, name: string) => void
type RemoveLevel = (id: number) => void
type CanRemoveLevel = (levelNumber: number) => boolean

const PermissionReviewLevel: React.FC<PemrmissionReviewLevelProps> = ({ stage }) => {
  const { updateTemplateStage } = useOperationState()
  const { templatePermissions } = useTemplateState()
  const reviewLevels = stage.templateStageReviewLevelsByStageId?.nodes || []

  const latestLevelNumber = reviewLevels.reduce(
    (max, current) => (max > (current?.number || 0) ? max : current?.number || 0),
    0
  )

  const canRemoveLevel: CanRemoveLevel = (levelNumber) =>
    levelNumber === latestLevelNumber &&
    getMatchingTemplatePermission({
      templatePermissions,
      type: PermissionPolicyType.Review,
      stageNumber: stage.number || 0,
      levelNumber,
    }).length === 0

  const {
    template: { isDraft },
  } = useTemplateState()

  const addLevel = () => {
    updateTemplateStage(stage?.id || 0, {
      templateStageReviewLevelsUsingId: {
        create: [{ name: `Level ${latestLevelNumber + 1}`, number: latestLevelNumber + 1 }],
      },
    })
  }

  const updateLevelName: UpdateLevelName = (id, name) => {
    updateTemplateStage(stage?.id || 0, {
      templateStageReviewLevelsUsingId: {
        updateById: [{ id, patch: { name } }],
      },
    })
  }

  const removeLevel: RemoveLevel = (id) => {
    updateTemplateStage(stage?.id || 0, {
      templateStageReviewLevelsUsingId: {
        deleteById: [{ id }],
      },
    })
  }

  return (
    <div className="flex-column-start-start">
      <div className="flex-row-start-center">
        <Header as="h4" className="no-margin-no-padding">
          Review Levels{' '}
        </Header>
        <IconButton
          name="add square"
          disabled={!isDraft}
          disabledMessage={disabledMessage}
          onClick={addLevel}
        />
      </div>
      <div className="spacer-10" />
      {reviewLevels.map((level) => (
        <div key={level?.id} className="review-level-config-container">
          <div className="flex-row-start-center">
            <PermissionsHeader
              type={PermissionPolicyType.Review}
              header={`Review Level ${level?.number}`}
              stageNumber={stage?.number || 0}
              levelNumber={level?.number}
            />
            <TextIO
              title="Level Name"
              text={level?.name}
              disabled={!isDraft}
              disabledMessage={disabledMessage}
              setText={(name) => updateLevelName(level?.id || 0, name)}
            />
            {canRemoveLevel(level?.number || 0) && (
              <IconButton
                disabled={!isDraft}
                disabledMessage={disabledMessage}
                name="window close"
                onClick={() => removeLevel(level?.id || 0)}
              />
            )}
          </div>
          <PermissionNameList
            type={PermissionPolicyType.Review}
            stageNumber={stage?.number || 0}
            levelNumber={level?.number}
          />
        </div>
      ))}
    </div>
  )
}

export default PermissionReviewLevel
