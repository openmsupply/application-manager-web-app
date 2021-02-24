import React, { useEffect, useState } from 'react'
import { FullStructure, ResponsesByCode } from '../../utils/types'
import useGetFullApplicationStructure from '../../utils/hooks/useGetFullApplicationStructure'
import { ApplicationStatus } from '../../utils/generated/graphql'
import { useApplicationState } from '../../contexts/ApplicationState'
import { useUserState } from '../../contexts/UserState'
import { useRouter } from '../../utils/hooks/useRouter'
import { Loading, NoMatch } from '../../components'
import strings from '../../utils/constants'
import messages from '../../utils/messages'
import { Button, Grid, Header, Message, Segment, Sticky } from 'semantic-ui-react'

interface ApplicationProps {
  structure: FullStructure
  responses?: ResponsesByCode
}

const ApplicationPage: React.FC<ApplicationProps> = ({ structure }) => {
  const [isStrictPage, setIsStrictPage] = useState(null)
  const { error, isLoading, fullStructure, responsesByCode } = useGetFullApplicationStructure({
    structure,
  })
  const {
    userState: { currentUser },
  } = useUserState()
  const { push } = useRouter()

  console.log('Structure', fullStructure)

  useEffect(() => {
    if (!structure) return

    // Re-direct based on application status and progress
    if (structure.info.current?.status === ApplicationStatus.ChangesRequired)
      push(`/applicationNEW/${structure.info.serial}`)
    if (structure.info.current?.status !== ApplicationStatus.Draft)
      push(`/applicationNEW/${structure.info.serial}/summary`)

    // TO-DO: Redirect based on Progress (wait till Progress calculation is done)
  }, [structure])

  if (error) return <Message error header={strings.ERROR_APPLICATION_PAGE} list={[error]} />
  if (!fullStructure) return <Loading />

  return (
    <Segment.Group style={{ backgroundColor: 'Gainsboro', display: 'flex' }}>
      {/* <ModalWarning showModal={showModal} /> */}
      <Header textAlign="center">
        {currentUser?.organisation?.orgName || strings.TITLE_NO_ORGANISATION}
      </Header>
      <Grid
        stackable
        style={{
          backgroundColor: 'white',
          padding: 10,
          margin: '0px 50px',
          minHeight: 500,
          flex: 1,
        }}
      >
        <Grid.Column width={4}>
          <ProgressBar structure={fullStructure as FullStructure} />
        </Grid.Column>
        <Grid.Column width={10} stretched>
          <Segment basic>
            <PageElements structure={fullStructure as FullStructure} responses={responsesByCode} />
            <NavigationBox />
          </Segment>
        </Grid.Column>
        <Grid.Column width={2} />
      </Grid>
      <Sticky
        pushing
        style={{ backgroundColor: 'white', boxShadow: ' 0px -5px 8px 0px rgba(0,0,0,0.1)' }}
      >
        <Segment basic textAlign="right">
          <Button color="blue" onClick={() => {}}>
            {/* TO-DO */}
            {strings.BUTTON_SUMMARY}
          </Button>
        </Segment>
      </Sticky>
    </Segment.Group>
  )
}

const ProgressBar: React.FC<ApplicationProps> = ({ structure }) => {
  // Placeholder -- to be replaced with new component
  return <p>Progress Bar here</p>
}

const PageElements: React.FC<ApplicationProps> = ({ structure, responses }) => {
  // Placeholder -- to be replaced with new component
  return <p>Page Elements go here</p>
}

const NavigationBox: React.FC = () => {
  // Placeholder -- to be replaced with new component
  return <p>Navigation Buttons</p>
}

export default ApplicationPage