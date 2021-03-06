import React from 'react'
import { Switch, Route } from 'react-router-dom'
import { Header, Message } from 'semantic-ui-react'

import { Loading, NoMatch } from '../../components'
import { useUserState } from '../../contexts/UserState'
import useLoadApplication from '../../utils/hooks/useLoadApplicationNEW'
import { useRouter } from '../../utils/hooks/useRouter'
import { FullStructure, User } from '../../utils/types'
import { ApplicationHome, ApplicationPage, ApplicationSubmission, ApplicationSummary } from './'
import strings from '../../utils/constants'
import ReviewPageWrapperTest from '../../components/Review/ReviewPageWrapperTest'

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
      <Route exact path={path}>
        <ApplicationHome structure={structure} template={template} />
      </Route>
      <Route exact path={`${path}/:sectionCode/Page:page`}>
        <ApplicationPage structure={structure} />
      </Route>
      <Route exact path={`${path}/summary`}>
        <ApplicationSummary structure={structure} />
      </Route>
      <Route exact path={`${path}/submission`}>
        <ApplicationSubmission structure={structure} />
      </Route>
      <Route exact path={`${path}/reviewTest`}>
        <ReviewPageWrapperTest structure={structure} />
      </Route>
      <Route>
        <NoMatch />
      </Route>
    </Switch>
  ) : (
    <NoMatch />
  )
}

export default ApplicationWrapper
