import React from 'react'
import { Link, Route, Switch } from 'react-router-dom'
import { Header } from 'semantic-ui-react'
import { NoMatch } from '.'
import TemplateWrapper from '../containers/TemplateBuilder/template/TemplateWrapper'
import Templates from '../containers/TemplateBuilder/Templates'
import { useUserState } from '../contexts/UserState'
import { LookupTableRoutes } from '../LookupTable'
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

  const adminOption = [
    {
      route: 'templates',
      header: 'Templates/Procedures and Builder',
      Element: () => <Templates />,
    },
    {
      route: 'lookup-tables',
      header: 'Lookup Tables',
      Element: () => <LookupTableRoutes />,
    },
    {
      route: 'outcomes',
      header: 'Outcome Configurations',
      Element: () => <AdminOutcomes />,
    },
    {
      route: 'permissions',
      header: 'Permission Policies and Names',
      Element: () => <AdminPermissions />,
    },
    {
      route: 'plugins',
      header: 'Plugins',
      Element: () => <AdminPlugins />,
    },
    {
      route: 'localisations',
      header: 'Localisations',
      Element: () => <AdminLocalisations />,
    },
  ]

  return (
    <Switch>
      <Route path={`${path}/template/:templateId`}>
        <TemplateWrapper />
      </Route>
      {adminOption.map(({ route, Element }) => (
        <Route key={route} path={`${path}/${route}`}>
          <Element />
        </Route>
      ))}

      <Route exact path={`${path}`}>
        <div id="admin-display">
          <Header as="h4">Admin</Header>
          <div className="admin-options-container">
            {adminOption.map(({ route, header }) => (
              <Link className="clickable" key={route} to={`${path}/${route}`}>
                <div className="admin-option">
                  <Header as="h3" className="clickable">
                    {header}
                  </Header>
                </div>
              </Link>
            ))}
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
