import React from 'react'
import { Link } from 'react-router-dom'
import { Header } from 'semantic-ui-react'

const Admin: React.FC = () => {
  return (
    <div id="outcomes-display">
      <Header as="h4">Admin</Header>
      <div className="outcomes-container">
        <Link className="clickable" to={`/admin/templates`}>
          <div className="outcome">
            <Header as="h3" className="clickable">
              {`Templates/Procedures and Builder`}
            </Header>
          </div>
        </Link>
        <Link className="clickable" to={`/lookup-tables`}>
          <div className="outcome">
            <Header as="h3" className="clickable">
              {`Lookup Tables`}
            </Header>
          </div>
        </Link>
        <Link className="clickable" to={`/admin/outcomes`}>
          <div className="outcome">
            <Header as="h3" className="clickable">
              {`Outcome Configurations`}
            </Header>
          </div>
        </Link>
        <Link className="clickable" to={`/admin/permissions`}>
          <div className="outcome">
            <Header as="h3" className="clickable">
              {`Permission Policies and Names`}
            </Header>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default Admin
