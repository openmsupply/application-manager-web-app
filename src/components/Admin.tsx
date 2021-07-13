import React from 'react'
import { Link, Route, Switch } from 'react-router-dom'
import { Header } from 'semantic-ui-react'
import { NoMatch } from '.'
import TemplateWrapper from '../containers/TemplateBuilder/template/TemplateWrapper'
import Templates from '../containers/TemplateBuilder/Templates'
import { useUserState } from '../contexts/UserState'
import { useRouter } from '../utils/hooks/useRouter'
import { AdminLocalisations, AdminOutcomes, AdminPermissions, AdminPlugins } from './AdminOther'

const Admin: React.FC = () => {
  const {
    match: { path },
  } = useRouter()
  const {
    userState: { isAdmin },
  } = useUserState()

  if (!isAdmin) return <NoMatch />

  return (
    <Switch>
      <Route exact path={`${path}/templates`}>
        <Templates />
      </Route>
      <Route path={`${path}/template/:templateId`}>
        <TemplateWrapper />
      </Route>
      <Route path={`${path}/permissions`}>
        <AdminPermissions />
      </Route>
      <Route path={`${path}/outcomes`}>
        <AdminOutcomes />
      </Route>
      <Route path={`${path}/plugins`}>
        <AdminPlugins />
      </Route>
      <Route path={`${path}/localisations`}>
        <AdminLocalisations />
      </Route>
      <Route exact path={`${path}`}>
        <div id="admin-display">
          <Header as="h4">Admin</Header>
          <div className="admin-options-container">
            <Link className="clickable" to={`/admin/templates`}>
              <div className="admin-option">
                <Header as="h3" className="clickable">
                  {`Templates/Procedures and Builder`}
                </Header>
              </div>
            </Link>
            <Link className="clickable" to={`/lookup-tables`}>
              <div className="admin-option">
                <Header as="h3" className="clickable">
                  {`Lookup Tables`}
                </Header>
              </div>
            </Link>
            <Link className="clickable" to={`/admin/outcomes`}>
              <div className="admin-option">
                <Header as="h3" className="clickable">
                  {`Outcome Configurations`}
                </Header>
              </div>
            </Link>
            <Link className="clickable" to={`/admin/permissions`}>
              <div className="admin-option">
                <Header as="h3" className="clickable">
                  {`Permission Policies and Names`}
                </Header>
              </div>
            </Link>
            <Link className="clickable" to={`/admin/plugins`}>
              <div className="admin-option">
                <Header as="h3" className="clickable">
                  {`Plugins`}
                </Header>
              </div>
            </Link>
            <Link className="clickable" to={`/admin/localisations`}>
              <div className="admin-option">
                <Header as="h3" className="clickable">
                  {`Localisations`}
                </Header>
              </div>
            </Link>
          </div>
        </div>
      </Route>
      <Route>
        <NoMatch />
      </Route>
    </Switch>
  )
}

export default Admin
