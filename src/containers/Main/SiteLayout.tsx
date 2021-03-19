import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import {
  Account,
  AdminPermissions,
  AdminUsers,
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
import {
  ApplicationCreate,
  ApplicationCreateNEW,
  ApplicationPageWrapper,
  ApplicationWrapper,
} from '../Application'
import { ReviewOverview, ReviewPageWrapper } from '../Review'
import { ApplicationProvider } from '../../contexts/ApplicationState'
import ApplicationOverview from '../Application/ApplicationOverview'
import ApplicationSubmission from '../Application/ApplicationSubmission'
import UserArea from '../User/UserArea'
import ListWrapper from '../List/ListWrapper'
import ReviewSubmission from '../../components/Review/ReviewSubmission'
import { FormElementUpdateTrackerProvider } from '../../contexts/FormElementUpdateTrackerState'

const SiteLayout: React.FC = () => {
  return (
    <Router>
      <UserArea />
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route exact path="/login">
          <Login />
        </Route>
        <Route exact path="/applications">
          <ListWrapper />
        </Route>
        {/* Application router NEW*/}
        {/* Create application new route */}
        <Route path="/application/new">
          <ApplicationProvider>
            <ApplicationCreateNEW />
          </ApplicationProvider>
        </Route>
        {/* Other application routes nested in ApplicationWrapper */}
        <Route path="/application/:serialNumber">
          <FormElementUpdateTrackerProvider>
            <ApplicationWrapper />
          </FormElementUpdateTrackerProvider>
        </Route>
        {/* Application current routes - to be removed */}
        <Route exact path="/applicationOLD/new">
          <ApplicationProvider>
            <ApplicationCreate />
          </ApplicationProvider>
        </Route>
        <Route exact path="/applicationOLD/:serialNumber">
          <ApplicationProvider>
            <ApplicationPageWrapper />
          </ApplicationProvider>
        </Route>
        <Route exact path="/applicationOLD/:serialNumber/:sectionCode/Page:page">
          <ApplicationProvider>
            <ApplicationPageWrapper />
          </ApplicationProvider>
        </Route>
        <Route exact path="/applicationOLD/:serialNumber/submission">
          <ApplicationSubmission />
        </Route>
        <Route exact path="/applicationOLD/:serialNumber/summary">
          <ApplicationOverview />
        </Route>
        {/* Review current routes - to be removed */}
        <Route exact path="/applicationOLD/:serialNumber/review">
          <ReviewOverview />
        </Route>
        <Route exact path="/applicationOLD/:serialNumber/review/:reviewId">
          <ReviewPageWrapper />
        </Route>
        <Route exact path="/applicationOLD/:serialNumber/review/:reviewId/submission">
          <ReviewSubmission />
        </Route>
        <Route exact path="/applicationOLD/:serialNumber/consolidation/">
          <NoMatch />
        </Route>
        <Route exact path="/applicationOLD/:serialNumber/consolidation/:consolidationId">
          <NoMatch />
        </Route>
        {/* End of Review routes */}
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
        <Route exact path="/products/:productId">
          <Product />
        </Route>
        <Route>
          <NoMatch />
        </Route>
      </Switch>
    </Router>
  )
}

export default SiteLayout
