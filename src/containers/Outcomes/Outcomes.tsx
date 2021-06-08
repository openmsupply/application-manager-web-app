import React from 'react'

import { Route, Switch } from 'react-router-dom'
import { Message } from 'semantic-ui-react'
import { Loading, NoMatch } from '../../components'
import { useRouter } from '../../utils/hooks/useRouter'
import useGetOutcomeDisplays from '../../utils/hooks/useGetOutcomeDisplays'
import strings from '../../utils/constants'
import OutcomeDetailsWrapper from './OutcomesDetailWrapper'
import OutcomeList from './OutcomesList'
import OutcomeTableWrapper from './OutcomesTableWrapper'

const Outcomes: React.FC = () => {
  const {
    match: { path },
  } = useRouter()

  const { displays, error } = useGetOutcomeDisplays()

  if (error) return <Message error title={strings.ERROR_GENERIC} list={[error]} />
  if (!displays) return <Loading />

  return (
    <Switch>
      <Route exact path={`${path}/:code/:id`}>
        <OutcomeDetailsWrapper displays={displays} />
      </Route>
      <Route exact path={`${path}/:code`}>
        <OutcomeTableWrapper displays={displays} />
      </Route>
      <Route exact path={`${path}`}>
        <OutcomeList displays={displays} />
      </Route>
      <Route>
        <NoMatch />
      </Route>
    </Switch>
  )
}

export default Outcomes
