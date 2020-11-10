import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { Grid, Segment } from 'semantic-ui-react'
import {
  Account,
  AdminPermissions,
  AdminUsers,
  AppMenu,
  ApplicationList,
  Approval,
  Admin,
  Config,
  Home,
  Login,
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
} from '../../components'
import { ApplicationCreate, ApplicationPageWrapper } from '../Application'
import UserRegister from '../User/UserRegister'
import { ApplicationProvider } from '../../contexts/ApplicationState'
import ApplicationOverview from '../Application/ApplicationOverview'

const SiteLayout: React.FC = () => {
  return (
    <Router>
      <Grid>
        <Grid.Column width={4}>
          <AppMenu
            items={[
              ['Home', '/'],
              ['Applications List', '/applications'],
              ['Register', '/applications/new?type=UserRego1'],
            ]}
          />
        </Grid.Column>
        <Grid.Column stretched width={12}>
          <Segment>
            <Switch>
              <Route exact path="/">
                <Home />
              </Route>
              <Route exact path="/login">
                <Login />
              </Route>
              <Route exact path="/example">
                <UserRegister />
              </Route>
              <Route exact path="/applications">
                <ApplicationList />
              </Route>
              <Route exact path="/applications/new">
                <ApplicationProvider>
                  <ApplicationCreate />
                </ApplicationProvider>
              </Route>
              <Route exact path="/applications/:serialNumber">
                <ApplicationProvider>
                  <ApplicationPageWrapper />
                </ApplicationProvider>
              </Route>
              <Route exact path="/applications/:serialNumber/:sectionCode/page:page">
                <ApplicationProvider>
                  <ApplicationPageWrapper />
                </ApplicationProvider>
              </Route>
              <Route exact path="/applications/:serialNumber/summary">
                <ApplicationProvider>
                  <ApplicationOverview />
                </ApplicationProvider>
              </Route>
              <Route exact path="/applications/:serialNumber/approval">
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
              <Route exact path="/products/:productId">
                <Product />
              </Route>
              <Route>
                <NoMatch />
              </Route>
            </Switch>
          </Segment>
        </Grid.Column>
      </Grid>
    </Router>
  )
}

export default SiteLayout
