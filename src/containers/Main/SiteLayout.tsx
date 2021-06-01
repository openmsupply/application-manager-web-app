import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import {
  Account,
  AdminPermissions,
  AdminUsers,
  Approval,
  Admin,
  Config,
  Dashboard,
  Notification,
  NotificationsList,
  NoMatch,
  Product,
  ProductList,
  Organisation,
  OrgMemberEdit,
  TemplateList,
  TemplateNew,
  Template,
  Footer,
} from '../../components'
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
import { Outcomes } from '../../components/Outcomes'

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
            <Route exact path="/admin">
              <Admin />
            </Route>
            <Route exact path="/admin/templates">
              <TemplateList />
            </Route>
            <Route exact path="/admin/templates/new">
              <TemplateNew />
            </Route>
            <Route exact path="/admin/templates/:templateId/:step">
              <Template />
            </Route>
            <Route exact path="/admin/users">
              <AdminUsers />
            </Route>
            <Route exact path="/admin/permissions">
              <AdminPermissions />
            </Route>
            <Route exact path="/admin/config">
              <Config />
            </Route>
            <Route exact path="/account">
              <Account />
            </Route>
            <Route exact path="/organisations/:orgName">
              <Organisation />
            </Route>
            <Route exact path="/organisations/:orgName/members">
              <OrgMemberEdit />
            </Route>
            <Route exact path="/notifications">
              <NotificationsList />
            </Route>
            <Route exact path="/notifications/:notificationId">
              <Notification />
            </Route>
            <Route exact path="/products">
              <ProductList />
            </Route>
            <Route path="/outcomes">
              <Outcomes />
            </Route>
            <Route exact path="/products/:productId"></Route>
            {/* Lookup Table routes wrapper */}
            <Route path="/lookup-tables">
              <LookupTableRoutes />
            </Route>
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
