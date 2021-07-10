import React from 'react'
import { TemplatePermission } from '../../../../utils/generated/graphql'
import CheckboxIO from '../../shared/CheckboxIO'
import { useOperationState } from '../../shared/OperationContext'
import { useTemplateState, disabledMessage } from '../TemplateWrapper'

type ReviewTemplatePermssionProps = {
  templatePermission: TemplatePermission
  levelNumber: number
}

type SetSelfAssign = (canSelfAssign: boolean) => void
type SetAllowedSection = (sectionCode: string, isAllowed: boolean) => boolean

type SortSections = (sections: string[] | null) => string[] | null

const sortSections: SortSections = (sections) =>
  sections &&
  [...sections].sort((first, second) => (first === second ? 0 : first > second ? 1 : -1))

const ReviewTemplatePermission: React.FC<ReviewTemplatePermssionProps> = ({
  templatePermission,
  levelNumber,
}) => {
  const { updateTemplate } = useOperationState()
  const {
    template: { id: templateId, isDraft },
    sections,
  } = useTemplateState()

  const sectionCodes = sections.map((section) => section?.code || '')
  const selfAssignDisabled = levelNumber > 1

  const allowedSections = sortSections(
    (templatePermission?.allowedSections ? [...templatePermission?.allowedSections] : null) as
      | string[]
      | null
  )

  const setSelfAssign: SetSelfAssign = (canSelfAssign) => {
    updateTemplate(templateId, {
      templatePermissionsUsingId: {
        updateById: [
          { id: templatePermission?.id || 0, patch: { canSelfAssign, allowedSections: null } },
        ],
      },
    })
  }

  const getSelfAssignedDisabledMessage = () => {
    if (!isDraft) return disabledMessage
    if (selfAssignDisabled) return 'Level above one is only self assignable'
    return ''
  }
  const selfAssignedDisabledMessage = getSelfAssignedDisabledMessage()

  const getAllowedSectionsDisabledMessage = () => {
    if (!isDraft) return disabledMessage
    if (selfAssignDisabled) return 'Level above one is only self assignable'
    if (templatePermission?.canSelfAssign) return 'Self assignable review is for all sections'
    return ''
  }
  const allowedSectionsDisabledMessage = getAllowedSectionsDisabledMessage()

  const setAllowedSection: SetAllowedSection = (sectionCode, isAllowed) => {
    const getNewSections = () => {
      if (isAllowed) {
        if (!allowedSections) return [sectionCode]
        if (allowedSections.includes(sectionCode)) return null
        return [...allowedSections, sectionCode]
      } else {
        if (!allowedSections)
          return sectionCodes.filter((_sectionCode) => _sectionCode !== sectionCode)
        if (!allowedSections.includes(sectionCode)) return allowedSections
        if (allowedSections.length === 1) return null
        const index = allowedSections.indexOf(sectionCode)
        allowedSections.splice(index, 1)
        return allowedSections
      }
    }

    const newAllowedSections = sortSections(getNewSections())
    updateTemplate(templateId, {
      templatePermissionsUsingId: {
        updateById: [
          {
            id: templatePermission?.id || 0,
            patch: { allowedSections: newAllowedSections },
          },
        ],
      },
    })

    if (newAllowedSections === null) return true
    return newAllowedSections.includes(sectionCode)
  }

  return (
    <div className="flex-row-start-center">
      <CheckboxIO
        title="Self Assignable"
        setValue={(canSelfAssign) => setSelfAssign(canSelfAssign)}
        disabled={!!selfAssignedDisabledMessage}
        disabledMessage={selfAssignedDisabledMessage}
        value={!!templatePermission?.canSelfAssign}
      />
      {sectionCodes.map((sectionCode) => (
        <CheckboxIO
          key={sectionCode}
          title={sectionCode}
          isPropUpdated={true}
          setValue={(isAllowed) => setAllowedSection(sectionCode, isAllowed)}
          disabled={!!allowedSectionsDisabledMessage}
          disabledMessage={allowedSectionsDisabledMessage}
          value={allowedSections === null || allowedSections.includes(sectionCode)}
        />
      ))}
    </div>
  )
}

export default ReviewTemplatePermission
