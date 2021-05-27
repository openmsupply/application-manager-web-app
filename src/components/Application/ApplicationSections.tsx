import React from 'react'
import { Button, Header, Icon, List } from 'semantic-ui-react'
import {
  ChangeRequestsProgress,
  FullStructure,
  ApplicationProgress,
  SectionAndPage,
} from '../../utils/types'
import { ApplicationProgressBar } from '../'
import strings from '../../utils/constants'
import { useRouter } from '../../utils/hooks/useRouter'
import useRestartApplication from '../../utils/hooks/useRestartApplication'
import { ApplicationStatus } from '../../utils/generated/graphql'

interface ApplicationSectionsProps {
  fullStructure: FullStructure
}

const ApplicationSections: React.FC<ApplicationSectionsProps> = ({ fullStructure }) => {
  const { push } = useRouter()

  const {
    info: {
      serial,
      isChangeRequest,
      current: { status },
      firstStrictInvalidPage,
    },
    sections,
  } = fullStructure
  const isDraftStatus = status === ApplicationStatus.Draft

  const restartApplication = useRestartApplication(serial)

  const handleRestartClick = async ({ sectionCode, pageNumber }: SectionAndPage) => {
    await restartApplication(fullStructure)
    push(`/application/${serial}/${sectionCode}/Page${pageNumber}`)
  }

  const handleResumeClick = ({ sectionCode, pageNumber }: SectionAndPage) => {
    push(`/application/${serial}/${sectionCode}/Page${pageNumber}`)
  }

  let isBeforeStrict = true

  const getIndicator = ({ completed, valid }: ApplicationProgress) => {
    return completed ? (
      <Icon name={valid ? 'check circle' : 'exclamation circle'} color={valid ? 'green' : 'red'} />
    ) : (
      <Icon name="circle outline" />
    )
  }

  return (
    <List
      celled
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
            resumeApplication: handleResumeClick,
            sectionCode,
          }

          // TODO: Create local component Section
          return {
            key: `list-item-${sectionCode}`,
            content: (
              <div className="section-single-row-box-container">
                <div className="centered-flex-box-row flex-grow-1">
                  {progress ? getIndicator(progress) : null}
                  <Header content={details.title} />
                </div>
                {(isDraftStatus || isChangeRequest) && progress && (
                  <ApplicationProgressBar {...progress} />
                )}
                <div className="actions-box">
                  {isChangeRequest ? (
                    <ActionsChangesRequest
                      {...sectionActionProps}
                      isDraftStatus={isDraftStatus}
                      restartApplication={handleRestartClick}
                    />
                  ) : isDraftStatus ? (
                    <ActionGeneral
                      {...sectionActionProps}
                      isBeforeStrict={isBeforeStrict}
                      isStrictSection={isStrictSection}
                    />
                  ) : null}
                </div>
              </div>
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
      link
      inverted
      name="pencil square"
      size="large"
      color="blue"
      onClick={() => resumeApplication({ sectionCode, pageNumber: 1 })}
    />
  )
}

interface ActionProps {
  changeRequestsProgress?: ChangeRequestsProgress
  generalProgress?: ApplicationProgress
  resumeApplication: (location: SectionAndPage) => void
  sectionCode: string
}

type ActionisChangesRequestProps = ActionProps & {
  isDraftStatus: boolean
  restartApplication: (location: SectionAndPage) => void
}

const ActionsChangesRequest: React.FC<ActionisChangesRequestProps> = (props) => {
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
        inverted
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

export default ApplicationSections
