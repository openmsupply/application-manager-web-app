import React, { useState } from 'react'
import { Header } from 'semantic-ui-react'

import {
  TemplateStatus,
  useGetTeplatesAvailableForCodeQuery,
} from '../../../../utils/generated/graphql'
import ButtonWithFallback from '../../shared/ButtonWidthFallback'
import Markdown from '../../../../utils/helpers/semanticReactMarkdown'
import { useOperationState } from '../../shared/OperationContext'
import TextIO from '../../shared/TextIO'
import { useApplicationState } from '../ApplicationWrapper'
import { useTemplateState } from '../TemplateWrapper'
import Category from './Categories'
import Filters from './Filters'
import { IconButton } from '../../shared/IconButton'
import MessagesConfig from './MessagesConfig'

const General: React.FC = () => {
  const { updateTemplate } = useOperationState()
  const { structure } = useApplicationState()
  const { template, fromQuery } = useTemplateState()
  const { data: availableTemplatesData, refetch: refetchAvailable } =
    useGetTeplatesAvailableForCodeQuery({
      variables: { code: template.code },
    })
  const [isMessageConfigOpen, setIsMessageConfigOpen] = useState(false)

  const canSetAvailable =
    availableTemplatesData?.templates?.nodes?.length === 0 &&
    template.status !== TemplateStatus.Available

  const canSetDraft = template.status !== TemplateStatus.Draft && template.applicationCount === 0

  const canSetDisabled = template.status !== TemplateStatus.Disabled

  return (
    <div className="flex-column-center-start">
      <div className="flex-row">
        <div className="spacer-10" />
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
      <div className="spacer-10" />
      <div className="longer">
        <TextIO
          text={String(template.name)}
          title="Name"
          setText={(text) => updateTemplate(template.id, { name: text })}
        />
      </div>
      <TextIO
        text={String(template.code)}
        disabled={!template.isDraft}
        disabledMessage="Can only change code of draft template"
        title="Code"
        setText={(text) => updateTemplate(template.id, { code: text })}
      />

      <Category />

      <Filters />
      <div className="spacer-20" />
      <div className="flex-row-start-center">
        <Header className="no-margin-no-padding" as="h3">
          Messages
        </Header>
        <IconButton name="setting" onClick={() => setIsMessageConfigOpen(true)} />
      </div>
      <div className="config-container">
        <Header className="no-margin-no-padding" as="h6">
          Start Message
        </Header>
        <div className="spacer-20" />
        <Markdown text={structure.info.startMessage || ''} />
      </div>

      <div className="config-container">
        <Header className="no-margin-no-padding" as="h6">
          Submission Message
        </Header>
        <div className="spacer-20" />
        <Markdown text={structure.info.submissionMessage || ''} />
      </div>
      <MessagesConfig isOpen={isMessageConfigOpen} onClose={() => setIsMessageConfigOpen(false)} />
    </div>
  )
}

export default General
