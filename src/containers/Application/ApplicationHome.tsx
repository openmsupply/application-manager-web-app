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
  const check = useRestartApplication(fullStructure?.info.serial as string)

  useEffect(() => {
    if (!fullStructure) return
    const { status } = fullStructure.info.current as StageAndStatus
    if (status !== ApplicationStatus.Draft && status !== ApplicationStatus.ChangesRequired)
      push(`/applicationNEW/${serialNumber}/summary`)
  }, [fullStructure])

  const handleResumeClick = ({ sectionCode, pageNumber }: SectionAndPage) => {
    push(`/applicationNEW/${serialNumber}/${sectionCode}/Page${pageNumber}`)
  }

  const handleSummaryClicked = () => {
    push(`/applicationNEW/${serialNumber}/summary`)
  }

  if (!fullStructure || !fullStructure.responsesByCode) return <Loading />

  const canUserEdit = fullStructure.info?.current?.status === ApplicationStatus.Draft

  const { firstStrictInvalidPage } = fullStructure.info

  const HomeMain: React.FC = () => {
    return (
      <>
        {fullStructure.info.current?.status !== ApplicationStatus.Submitted &&
          fullStructure.info.isChangeRequest && (
            <Header>
              There are issues with some of the information you supplied ... change request...{' '}
            </Header>
          )}
        <Segment>
          <Header as="h5">{strings.SUBTITLE_APPLICATION_STEPS}</Header>
          <Header as="h5">{strings.TITLE_STEPS.toUpperCase()}</Header>
          <SectionsProgress
            canEdit={canUserEdit}
            sections={fullStructure.sections}
            firstStrictInvalidPage={firstStrictInvalidPage}
            resumeApplication={handleResumeClick}
          />
          <Divider />
        </Segment>
        {!firstStrictInvalidPage && (
          <Sticky
            pushing
            style={{ backgroundColor: 'white', boxShadow: ' 0px -5px 8px 0px rgba(0,0,0,0.1)' }}
          >
            <Segment basic textAlign="right">
              <Button as={Link} color="blue" onClick={handleSummaryClicked}>
                {strings.BUTTON_SUMMARY}
              </Button>
              <p>{fullStructure.info.current?.status}</p>
              <Button
                onClick={async () => {
                  await check(fullStructure)
                  push(`/applicationNEW/${serialNumber}/S1/Page1`)
                }}
              >
                Check Changes Requested
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

export default ApplicationHome
