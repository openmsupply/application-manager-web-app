import React from 'react'
import { Switch, Route, useRouteMatch } from 'react-router-dom'
import { Header, Message } from 'semantic-ui-react'

import { Loading, NoMatch } from '../../components'
import { useUserState } from '../../contexts/UserState'
import useLoadApplication from '../../utils/hooks/useLoadApplicationNEW'
import { useRouter } from '../../utils/hooks/useRouter'
import { FullStructure, User } from '../../utils/types'
import strings from '../../utils/constants'

const ApplicationWrapper: React.FC = () => {
  const { query } = useRouter()
  const { path } = useRouteMatch()
  const { serialNumber } = query
  const {
    userState: { currentUser },
  } = useUserState()

  const { error, isLoading, structure, template } = useLoadApplication({
    serialNumber,
    currentUser: currentUser as User,
    networkFetch: true,
  })

  return error ? (
    <Message error header={strings.ERROR_APPLICATION_PAGE} />
  ) : isLoading ? (
    <Loading />
  ) : structure ? (
    <Switch>
      <Route exact path={path}>
        <ApplicationStartNEW structure={structure} />
      </Route>
      <Route exact path={`${path}/:sectionCode/Page:page`}>
        <ApplicationPageNEW structure={structure} />
      </Route>
      <Route exact path={`${path}/summary`}>
        <ApplicationSummaryNEW structure={structure} />
      </Route>
      <Route exact path={`${path}/summary/submission`}>
        <ApplicationSubmissionNEW structure={structure} />
      </Route>
      <Route>
        <NoMatch />
      </Route>
    </Switch>
  ) : (
    <NoMatch />
  )
}

interface ApplicationProps {
  structure: FullStructure
}

const ApplicationStartNEW: React.FC<ApplicationProps> = ({ structure }) => {
  return <Header>START PAGE</Header>
}

const ApplicationPageNEW: React.FC<ApplicationProps> = ({ structure }) => {
  return <Header>IN PROGRESS PAGE</Header>
}

const ApplicationSummaryNEW: React.FC<ApplicationProps> = ({ structure }) => {
  return <Header>SUMMARY PAGE</Header>
}

const ApplicationSubmissionNEW: React.FC<ApplicationProps> = ({ structure }) => {
  return <Header>SUBMISSION PAGE</Header>
}

export default ApplicationWrapper
