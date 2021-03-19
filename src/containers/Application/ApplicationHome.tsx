import React, { useEffect } from 'react'
import { Button, Divider, Header, Message, Segment, Sticky } from 'semantic-ui-react'
import { FullStructure, SectionAndPage, StageAndStatus, TemplateDetails } from '../../utils/types'
import useGetFullApplicationStructure from '../../utils/hooks/useGetFullApplicationStructure'
import { ApplicationHeader, Loading } from '../../components'
import strings from '../../utils/constants'
import { useUserState } from '../../contexts/UserState'
import { SectionsProgress } from '../../components/Application/Sections'
import { useRouter } from '../../utils/hooks/useRouter'
import { ApplicationStatus } from '../../utils/generated/graphql'
import { Link } from 'react-router-dom'
import useRestartApplication from '../../utils/hooks/useRestartApplication'
import messages from '../../utils/messages'

interface ApplicationProps {
  structure: FullStructure
  template: TemplateDetails
}

const ApplicationHome: React.FC<ApplicationProps> = ({ structure, template }) => {
  const {
    query: { serialNumber },
    push,
  } = useRouter()
  const {
    userState: { currentUser },
  } = useUserState()

  const { error, fullStructure } = useGetFullApplicationStructure({
    structure,
  })

  const restartApplication = useRestartApplication(serialNumber)

  useEffect(() => {
    if (!fullStructure) return
    const { status } = fullStructure.info.current as StageAndStatus
    if (status !== ApplicationStatus.Draft && status !== ApplicationStatus.ChangesRequired)
      push(`/application/${serialNumber}/summary`)
  }, [fullStructure])

  const handleResumeClick = ({ sectionCode, pageNumber }: SectionAndPage) => {
    push(`/application/${serialNumber}/${sectionCode}/Page${pageNumber}`)
  }

  const handleSummaryClicked = () => {
    push(`/application/${serialNumber}/summary`)
  }

  if (!fullStructure || !fullStructure.responsesByCode) return <Loading />

  const {
    info: { current, isChangeRequest, firstStrictInvalidPage },
    sections,
  } = fullStructure

  const HomeMain: React.FC = () => {
    return (
      <>
        <ChangesRequestedTitle status={current?.status} isChangeRequest={isChangeRequest} />
        <Segment>
          <Header as="h5">{strings.SUBTITLE_APPLICATION_STEPS}</Header>
          <Header as="h5">{strings.TITLE_STEPS.toUpperCase()}</Header>
          <SectionsProgress
            changesRequested={isChangeRequest}
            draftStatus={current?.status === ApplicationStatus.Draft}
            sections={sections}
            firstStrictInvalidPage={firstStrictInvalidPage}
            restartApplication={async ({ sectionCode, pageNumber }) => {
              await restartApplication(fullStructure)
              push(`/applicationNEW/${serialNumber}/${sectionCode}/Page${pageNumber}`)
            }}
            resumeApplication={handleResumeClick}
          />
          <Divider />
        </Segment>
        {current?.status === ApplicationStatus.Draft && !firstStrictInvalidPage && (
          <Sticky
            pushing
            style={{ backgroundColor: 'white', boxShadow: ' 0px -5px 8px 0px rgba(0,0,0,0.1)' }}
          >
            <Segment basic textAlign="right">
              <Button as={Link} color="blue" onClick={handleSummaryClicked}>
                {strings.BUTTON_SUMMARY}
              </Button>
            </Segment>
          </Sticky>
        )}
      </>
    )
  }

  return error ? (
    <Message error title={strings.ERROR_GENERIC} list={[error]} />
  ) : (
    <ApplicationHeader template={template} currentUser={currentUser} ChildComponent={HomeMain} />
  )
}

interface ChangesRequestedTitleProps {
  status?: ApplicationStatus
  isChangeRequest: boolean
}

const ChangesRequestedTitle: React.FC<ChangesRequestedTitleProps> = ({
  status,
  isChangeRequest,
}) => {
  return status !== ApplicationStatus.Submitted && isChangeRequest ? (
    <Header content={messages.APPLICATION_CHANGES_REQUIRED} />
  ) : null
}

export default ApplicationHome
