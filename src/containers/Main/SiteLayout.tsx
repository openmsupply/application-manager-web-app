import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { Approval, Admin, Dashboard, NoMatch, Footer } from '../../components'
import { ApplicationCreate, ApplicationWrapper } from '../Application'
import { ApplicationProvider } from '../../contexts/ApplicationState'
import UserArea from '../User/UserArea'
import Login from '../User/Login'
import ListWrapper from '../List/ListWrapper'
import { FormElementUpdateTrackerProvider } from '../../contexts/FormElementUpdateTrackerState'
import { LookupTableRoutes } from '../../LookupTable'
import { Container } from 'semantic-ui-react'
import DevOptions from '../Dev/DevOptions'
import LayoutHelpers from '../../components/LayoutHelpers'
import Outcomes from '../Outcomes/Outcomes'

const SiteLayout: React.FC = () => {
  return (
    <Router>
      <Container id="main-container">
        <UserArea />
        <DevOptions />
        <Container id="content-area">
          <Switch>
            <Route exact path="/">
              <Dashboard />
            </Route>
            <Route exact path="/layout">
              <LayoutHelpers />
            </Route>
            <Route exact path="/login">
              <Login />
            </Route>
            <Route exact path="/applications">
              <ListWrapper />
            </Route>
            <Route path="/application/new">
              <ApplicationProvider>
                <ApplicationCreate />
              </ApplicationProvider>
            </Route>
            <Route path="/application/:serialNumber">
              <FormElementUpdateTrackerProvider>
                <ApplicationWrapper />
              </FormElementUpdateTrackerProvider>
            </Route>
            <Route exact path="/application/:serialNumber/approval">
              <Approval />
            </Route>
            <Route path="/admin">
              <Admin />
            </Route>
            <Route path="/outcomes">
              <Outcomes />
            </Route>
            <Route exact path="/products/:productId"></Route>
            <Route>
              <NoMatch />
            </Route>
            <Route>
              <NoMatch />
            </Route>
          </Switch>
        </Container>
        <Footer />
      </Container>
    </Router>
  )
}

export default SiteLayout
