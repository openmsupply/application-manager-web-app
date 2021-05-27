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
    userState: { currentUser, isNonRegistered },
  } = useUserState()

  const { error, isLoading, structure } = useLoadApplication({
    serialNumber,
    currentUser: currentUser as User,
    networkFetch: true,
  })

  return error ? (
    <Message error header={strings.ERROR_APPLICATION_PAGE} list={[error]} />
  ) : isLoading ? (
    <Loading />
  ) : structure ? (
    <Switch>
      <Route path={`${path}/review`}>
        <ReviewWrapper structure={structure} />
      </Route>
      <Route exact path={path}>
        <ApplicationContainer template={structure.info.template}>
          <ApplicationHome structure={structure} template={structure.info.template} />
        </ApplicationContainer>
      </Route>
      <Route exact path={`${path}/submission`}>
        <ApplicationContainer template={structure.info.template}>
          <ApplicationSubmission structure={structure} />
        </ApplicationContainer>
      </Route>
      <Route>
        <ApplicationContainer template={structure.info.template}>
          <ApplicationPageWrapper structure={structure} />
        </ApplicationContainer>
      </Route>
    </Switch>
  ) : (
    <NoMatch />
  )
}

export default ApplicationWrapper
