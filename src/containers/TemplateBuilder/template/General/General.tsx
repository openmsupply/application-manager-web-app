import React from 'react'

import {
  TemplateStatus,
  useGetTeplatesAvailableForCodeQuery,
} from '../../../../utils/generated/graphql'
import { ButtonWithFallback, TextIO } from '../../shared/components'
import { useOperationState } from '../../shared/OperationContext'
import { useTemplateState } from '../TemplateWrapper'
import Category from './Categories'
import Filters from './Filters'

const General: React.FC = () => {
  const { updateTemplate } = useOperationState()
  const { template } = useTemplateState()
  const { data: availableTemplatesData, refetch: refetchAvailable } =
    useGetTeplatesAvailableForCodeQuery({
      variables: { code: template.code },
    })

  const canSetAvailable =
    availableTemplatesData?.templates?.nodes?.length === 0 &&
    template.status !== TemplateStatus.Available

  const canSetDraft = template.status !== TemplateStatus.Draft && template.applicationCount === 0

  const canSetDisabled = template.status !== TemplateStatus.Disabled

  return (
    <div className="template-inner-config">
      <div key="actionButtons" className="flex-row">
        <ButtonWithFallback
          title="Make Available"
          disabledMessage="At least one template with the same code is already available, or this template already available"
          disabled={!canSetAvailable}
          onClick={() => {
            updateTemplate(template.id, { status: TemplateStatus.Available })
          }}
        />
        <ButtonWithFallback
          title="Make Draft"
          disabledMessage="Already has appications or is draft"
          disabled={!canSetDraft}
          onClick={async () => {
            if (await updateTemplate(template.id, { status: TemplateStatus.Draft }))
              refetchAvailable()
          }}
        />
        <ButtonWithFallback
          title="Disable"
          disabledMessage="Already disabled"
          disabled={!canSetDisabled}
          onClick={async () => {
            if (await updateTemplate(template.id, { status: TemplateStatus.Disabled }))
              refetchAvailable()
          }}
        />
      </div>
      <TextIO
        text={String(template.name)}
        title="Name"
        setText={(text) => updateTemplate(template.id, { name: text })}
      />

      <TextIO
        text={String(template.code)}
        disabled={!template.isDraft}
        disabledMessage="Can only change code of draft template"
        title="Code"
        setText={(text) => updateTemplate(template.id, { code: text })}
      />

      <Category />

      <Filters />
    </div>
  )
}

export default General
