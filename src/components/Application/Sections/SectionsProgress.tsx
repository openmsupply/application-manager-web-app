import React from 'react'
import { Button, Grid, Icon, List, Progress } from 'semantic-ui-react'
import {
  ChangeRequestsProgress,
  Progress as ProgressType,
  SectionAndPage,
  SectionsStructure,
} from '../../../utils/types'
import strings from '../../../utils/constants'

interface SectionsProgressProps {
  changesRequested: boolean
  draftStatus: boolean
  firstStrictInvalidPage: SectionAndPage | null
  sections: SectionsStructure
  restartApplication: (location: SectionAndPage) => void
  resumeApplication: (location: SectionAndPage) => void
}

const SectionsProgress: React.FC<SectionsProgressProps> = ({
  changesRequested,
  draftStatus,
  firstStrictInvalidPage,
  sections,
  restartApplication,
  resumeApplication,
}) => {
  let isBeforeStrict = true

  const getIndicator = ({ completed, valid }: ProgressType) => {
    return completed ? (
      <Icon name={valid ? 'check circle' : 'exclamation circle'} color={valid ? 'green' : 'red'} />
    ) : (
      <Icon name="circle outline" />
    )
  }

  return (
    <List
      divided
      relaxed="very"
      items={Object.entries(sections).map(
        ([sectionCode, { details, progress, changeRequestsProgress }]) => {
          const isStrictSection = sectionCode === firstStrictInvalidPage?.sectionCode
          isBeforeStrict = isBeforeStrict
            ? firstStrictInvalidPage === null || !isStrictSection
            : false

          const sectionActionProps: ActionProps = {
            changeRequestsProgress,
            generalProgress: progress,
            resumeApplication,
            sectionCode,
          }

          return {
            key: `list-item-${sectionCode}`,
            icon: progress ? getIndicator(progress) : null,
            header: (
              <Grid stackable style={{ minHeight: 50 }}>
                <Grid.Column style={{ minWidth: 100 }} floated="left" width={4}>
                  <p>{details.title}</p>
                </Grid.Column>
                {(draftStatus || changesRequested) && progress && <SectionProgress {...progress} />}
                <Grid.Column style={{ minWidth: 120, padding: 0 }} verticalAlign="middle" width={2}>
                  {changesRequested ? (
                    <ActionChangesRequested
                      {...sectionActionProps}
                      isDraftStatus={draftStatus}
                      restartApplication={restartApplication}
                    />
                  ) : draftStatus ? (
                    <ActionGeneral
                      {...sectionActionProps}
                      isBeforeStrict={isBeforeStrict}
                      isStrictSection={isStrictSection}
                    />
                  ) : null}
                </Grid.Column>
              </Grid>
            ),
          }
        }
      )}
    />
  )
}

interface SectionEditProps {
  sectionCode: string
  resumeApplication: (location: SectionAndPage) => void
}

const SectionEdit: React.FC<SectionEditProps> = ({ sectionCode, resumeApplication }) => {
  return (
    <Icon
      name="pencil square"
      color="blue"
      style={{ minWidth: 100 }}
      onClick={() => resumeApplication({ sectionCode, pageNumber: 1 })}
    />
  )
}

const SectionProgress: React.FC<ProgressType> = ({
  doneRequired,
  doneNonRequired,
  totalSum,
  valid,
}) => {
  const totalDone = doneRequired + doneNonRequired
  return totalDone > 0 && totalSum > 0 ? (
    <Grid.Column style={{ width: 200, paddingRight: '5%' }} floated="right" width={4}>
      <Progress
        style={{ width: 200 }}
        percent={(100 * totalDone) / totalSum}
        size="tiny"
        success={valid}
        error={!valid}
      />
    </Grid.Column>
  ) : null
}

interface ActionProps {
  changeRequestsProgress?: ChangeRequestsProgress
  generalProgress?: ProgressType
  resumeApplication: (location: SectionAndPage) => void
  sectionCode: string
}

type ActionChangesRequestedProps = ActionProps & {
  isDraftStatus: boolean
  restartApplication: (location: SectionAndPage) => void
}

const ActionChangesRequested: React.FC<ActionChangesRequestedProps> = (props) => {
  const {
    sectionCode,
    generalProgress,
    changeRequestsProgress,
    isDraftStatus,
    restartApplication,
    resumeApplication,
  } = props
  if (!changeRequestsProgress) return null
  const { totalChangeRequests, doneChangeRequests } = changeRequestsProgress
  const totalRemainingUpdate = totalChangeRequests - doneChangeRequests || 0
  if (totalRemainingUpdate > 0)
    return (
      <Button
        color="blue"
        content={`${strings.LABEL_APPLICATION_UPDATE} (${totalRemainingUpdate})`}
        onClick={() =>
          isDraftStatus
            ? resumeApplication({
                sectionCode,
                pageNumber: generalProgress?.firstStrictInvalidPage || 1,
              })
            : restartApplication({
                sectionCode,
                pageNumber: generalProgress?.firstStrictInvalidPage || 1,
              })
        }
      />
    )
  else if (isDraftStatus) return <SectionEdit {...props} />

  return null
}

type ActionGeneralProps = ActionProps & {
  isStrictSection: boolean
  isBeforeStrict: boolean
}

// General is for Draft application - without changes requested (so not submitted yet)
const ActionGeneral: React.FC<ActionGeneralProps> = (props) => {
  const { sectionCode, generalProgress, isStrictSection, isBeforeStrict, resumeApplication } = props
  if (isStrictSection)
    return (
      <Button
        color="blue"
        content={strings.BUTTON_APPLICATION_RESUME}
        onClick={() =>
          resumeApplication({
            sectionCode,
            pageNumber: generalProgress?.firstStrictInvalidPage || 1,
          })
        }
      />
    )

  if (generalProgress?.completed && isBeforeStrict) return <SectionEdit {...props} />

  return null
}

export default SectionsProgress
