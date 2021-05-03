import React from 'react'
import { Link } from 'react-router-dom'

import { Button, Header, Icon, SemanticCOLORS, SemanticICONS } from 'semantic-ui-react'
import { useUserState } from '../contexts/UserState'
import { Filter, PermissionPolicyType } from '../utils/generated/graphql'
import useListApplications from '../utils/hooks/useListApplications'
import useListTemplates from '../utils/hooks/useListTemplates'
import { TemplateDetails } from '../utils/types'
import Loading from './Loading'

const Home: React.FC = () => {
  const {
    userState: { templatePermissions },
  } = useUserState()

  const { templatesData, loading } = useListTemplates(templatePermissions, false)

  if (loading) return <Loading />

  if (!templatesData) return null

  return (
    <div
      style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}
    >
      {Object.entries(templatesData.templatesByCategory).map(
        ([templateCategoryName, templates]) => (
          <div
            key={templateCategoryName}
            style={{
              display: 'flex',
              flexDirection: 'column',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              margin: 10,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              {templates[0].categoryIcon && (
                <Icon size="big" color="grey" name={templates[0].categoryIcon} />
              )}
              <Header style={{ margin: 2 }} as="h4">
                {templateCategoryName}
              </Header>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {templates.map((template) => (
                <TemplateComponent key={template.code} template={template} />
              ))}
            </div>
          </div>
        )
      )}
    </div>
  )
}

const matchTemplatePermission = (fromPermission: PermissionPolicyType, toPermission: string) =>
  String(fromPermission).toLowerCase() === String(toPermission).toLowerCase()

const TemplateComponent: React.FC<{ template: TemplateDetails }> = ({ template }) => {
  return (
    <div
      style={{
        maxWidth: 300,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 10,
        margin: 15,
        background: 'white',
        boxShadow: '0 1px 3px 0 #d4d4d5, 0 0 0 1px #d4d4d5',
      }}
    >
      {/* <Roles permissions={template.permissions || []} /> */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyItems: 'center',
          alignItems: 'start',
          padding: 10,
          paddingBottom: 3,
        }}
      >
        <p className="clickable">
          <strong>{`${template.name}`}</strong>
        </p>
        {template?.permissions?.find((permissionType) =>
          matchTemplatePermission(permissionType, 'apply')
        ) && (
          <Button
            style={{ marginLeft: 10 }}
            inverted
            size="small"
            as={Link}
            to={`/application/new?type=${template.code}`}
            primary
          >
            New
          </Button>
        )}
      </div>
      {(template.filters?.length || 0 > 0) && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            margin: 5,
            padding: 3,
            borderRadius: 5,
          }}
        >
          {template.filters?.map((filter) => (
            <FilterComponent key={filter.id} template={template} filter={filter} />
          ))}
        </div>
      )}
      <ViewAll template={template} />
    </div>
  )
}

const FilterComponent: React.FC<{ template: TemplateDetails; filter: Filter }> = ({
  template,
  filter,
}) => {
  const templateType = template.code
  const { loading, applicationCount } = useListApplications({
    type: templateType,
    perPage: 1,
    ...filter.query,
  })

  const applicationListUserRole =
    filter.userRole === PermissionPolicyType.Apply ? 'applicant' : 'reviewer'

  const constructLink = () =>
    `/applications?type=${templateType}&user-role=${applicationListUserRole}&${Object.entries(
      filter.query
    )
      .map(([key, value]) => `${key}=${value}`)
      .join('&')}`

  if (loading) return null
  if (applicationCount === 0) return null

  return (
    <div style={{ display: 'flex', margin: 2 }}>
      {filter.icon && (
        <Icon color={filter.iconColor as SemanticCOLORS} name={filter.icon as SemanticICONS} />
      )}

      <Link to={constructLink()}>{`${applicationCount} ${filter.title}`}</Link>
    </div>
  )
}

const rolesDisplay: {
  [key: string]: {
    tooltip: string
    icon: SemanticICONS
  }
} = {
  [PermissionPolicyType.Apply]: {
    tooltip: 'Can Apply',
    icon: 'edit',
  },
  [PermissionPolicyType.Review]: {
    tooltip: 'Can Review',
    icon: 'gavel',
  },
  [PermissionPolicyType.Assign]: {
    tooltip: 'Can Assign',
    icon: 'user plus',
  },
}

const ViewAll: React.FC<{ template: TemplateDetails }> = ({ template }) => {
  const permissions = template?.permissions

  const applicantRoles: string[] = []
  const reviewerRoles: string[] = []
  const allRoles = [
    PermissionPolicyType.Apply,
    PermissionPolicyType.Review,
    PermissionPolicyType.Assign,
  ]
  permissions?.forEach((permission) => {
    const role = allRoles.find((role) => matchTemplatePermission(permission, role))
    if (!role) return
    if (role === PermissionPolicyType.Apply) applicantRoles.push(role)
    else reviewerRoles.push(role)
  })

  const renderLink = (userRoles: string[], applicationListRole: string) => {
    if (userRoles.length === 0) return null
    return (
      <Link
        key={applicationListRole}
        className="view_all_link"
        style={{
          color: 'rgba(0,0,0,.6)',
          fontWeight: 600,
          display: 'flex',
          justifyContent: 'center',
          textAlign: 'center',
          flexGrow: 1,
          borderTop: '1px solid rgba(0,0,0,.08)',
          padding: 5,
        }}
        to={`/applications?type=${template.code}&user-role=${applicationListRole}`}
      >
        <div>
          {userRoles.map((role) => {
            const roleDisplay = rolesDisplay[role]
            return (
              <Icon
                name={roleDisplay.icon}
                style={{
                  paddingRight: 6,
                  color: 'rgba(0,0,0,.6)',
                }}
              />
            )
          })}
          View All
        </div>
      </Link>
    )
  }

  return (
    <div style={{ maxWidth: '100%', display: 'flex' }}>
      {renderLink(applicantRoles, 'applicant')}
      {renderLink(reviewerRoles, 'reviewer')}
    </div>
  )
}

export default Home
