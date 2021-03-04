import React, { useEffect } from 'react'
import { Button, Divider, Header, Message, Segment, Sticky } from 'semantic-ui-react'
import { FullStructure, SectionAndPage, StageAndStatus, TemplateDetails } from '../../utils/types'
import useGetFullApplicationStructure from '../../utils/hooks/useGetFullApplicationStructure'
import { ApplicationHeader, Loading } from '../../components'
import strings from '../../utils/constants'
import { useUserState } from '../../contexts/UserState'
import SectionsProgress from '../../components/Sections/SectionsProgress'
import { useRouter } from '../../utils/hooks/useRouter'
import { ApplicationStatus } from '../../utils/generated/graphql'
import { Link } from 'react-router-dom'

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

  const { firstStrictInvalidPage } = fullStructure.info

  const HomeMain: React.FC = () => {
    return (
      <>
        <Segment>
          <Header as="h5">{strings.SUBTITLE_APPLICATION_STEPS}</Header>
          <Header as="h5">{strings.TITLE_STEPS.toUpperCase()}</Header>
          <SectionsProgress
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
            </Segment>
          </Sticky>
        )}
      </>
    )
  }

  return error ? (
    <Message error title={strings.ERROR_APPLICATION_OVERVIEW} list={[error]} />
  ) : (
    <ApplicationHeader template={template} currentUser={currentUser} ChildComponent={HomeMain} />
  )
}

export default ApplicationHome
