import React from 'react'
import { Switch, Route } from 'react-router-dom'
import { Message } from 'semantic-ui-react'

import { ApplicationContainer, Loading, NoMatch } from '../../components'
import { useUserState } from '../../contexts/UserState'
import useLoadApplication from '../../utils/hooks/useLoadApplication'
import { useRouter } from '../../utils/hooks/useRouter'
import { User } from '../../utils/types'
import { ApplicationHome, ApplicationSubmission, ApplicationPageWrapper } from './'
import strings from '../../utils/constants'
import { ReviewWrapper } from '../Review'

const ApplicationWrapper: React.FC = () => {
  const {
    match: { path },
    query: { serialNumber },
  } = useRouter()
  const {
    userState: { currentUser },
  } = useUserState()

  const { error, isLoading, structure, template } = useLoadApplication({
    serialNumber,
    currentUser: currentUser as User,
    networkFetch: true,
  })

  return error ? (
    <Message error header={strings.ERROR_APPLICATION_PAGE} list={[error]} />
  ) : isLoading ? (
    <Loading />
  ) : structure && template ? (
    <Switch>
      <Route path={`${path}/review`}>
        <ReviewWrapper structure={structure} />
      </Route>
      <Route exact path={path}>
        <ApplicationContainer template={template} currentUser={currentUser}>
          <ApplicationHome structure={structure} template={template} />
        </ApplicationContainer>
      </Route>
      <Route exact path={`${path}/submission`}>
        <ApplicationSubmission structure={structure} />
      </Route>
      <Route>
        <ApplicationContainer template={template} currentUser={currentUser}>
          <ApplicationPageWrapper structure={structure} />
        </ApplicationContainer>
      </Route>
    </Switch>
  ) : (
    <NoMatch />
  )
}

export default ApplicationWrapper
