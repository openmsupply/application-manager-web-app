import React from 'react'
import { Link } from 'react-router-dom'
import { Header, Button, Icon, SemanticCOLORS, SemanticICONS } from 'semantic-ui-react'
import { useUserState } from '../contexts/UserState'
import constants from '../utils/constants'
import strings from '../utils/constants'
import { USER_ROLES } from '../utils/data'
import { PermissionPolicyType, Filter } from '../utils/generated/graphql'
import useListApplications from '../utils/hooks/useListApplications'
import useListTemplates from '../utils/hooks/useListTemplates'
import usePageTitle from '../utils/hooks/usePageTitle'
import { TemplateDetails, TemplateInList } from '../utils/types'

const Dashboard: React.FC = () => {
  const {
    userState: { templatePermissions, isNonRegistered },
    logout,
  } = useUserState()
  const {
    templatesData: { templatesByCategory },
  } = useListTemplates(templatePermissions, false)
  if (isNonRegistered) {
    logout()
    return null
  }

  usePageTitle(strings.PAGE_TITLE_HOME)

  return (
    <div id="dashboard">
      {templatesByCategory.map(
        ({ templates, templateCategory: { icon: categoryIcon, title: categoryTitle } }) => (
          <div key={categoryTitle} className="template-category">
            <div className="title">
              {categoryIcon && <Icon size="large" color="grey" name={categoryIcon} />}
              <Header as="h4">{categoryTitle}</Header>
            </div>
            <div className="templates">
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

const TemplateComponent: React.FC<{ template: TemplateInList }> = ({ template }) => {
  const { name, code, hasApplyPermission, filters } = template
  return (
    <div className="template">
      <div className="title">
        <Header as="h5">{name}</Header>

        {hasApplyPermission && (
          <Button inverted size="small" as={Link} to={`/application/new?type=${code}`} primary>
            {constants.BUTTON_DASHBOARD_NEW}
          </Button>
        )}
      </div>

      <div className="filters">
        {filters.map((filter) => (
          <FilterComponent key={filter.id} template={template} filter={filter} />
        ))}
      </div>

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
    filter.userRole === PermissionPolicyType.Apply ? USER_ROLES.APPLICANT : USER_ROLES.REVIEWER

  const constructLink = () =>
    `/applications?type=${templateType}&user-role=${applicationListUserRole}&${Object.entries(
      filter.query
    )
      .map(([key, value]) => `${key}=${value}`)
      .join('&')}`

  if (loading) return null
  if (applicationCount === 0) return null

  return (
    <div className="filter">
      <Link to={constructLink()}>
        {filter.icon && (
          <Icon style={{ color: filter.iconColor }} name={filter.icon as SemanticICONS} />
        )}
        {`${applicationCount} ${filter.title}`}
      </Link>
    </div>
  )
}

const rolesDisplay: {
  [key: string]: {
    icon: SemanticICONS
  }
} = {
  [PermissionPolicyType.Apply]: {
    icon: 'edit',
  },
  [PermissionPolicyType.Review]: {
    icon: 'gavel',
  },
  [PermissionPolicyType.Assign]: {
    icon: 'user plus',
  },
}

const ViewAll: React.FC<{ template: TemplateInList }> = ({ template: { code, permissions } }) => {
  const applicantRoles = permissions.filter((type) => type === PermissionPolicyType.Apply)
  const reviewerRoles = permissions.filter((type) => type !== PermissionPolicyType.Apply)

  const renderLink = (permissionTypes: string[], applicationListRole: USER_ROLES) => {
    if (permissionTypes.length === 0) return null
    return (
      <Link
        key={applicationListRole}
        className="view-all clickable"
        to={`/applications?type=${code}&user-role=${applicationListRole}`}
      >
        <div>
          {permissionTypes.map((policyType) => {
            const roleDisplay = rolesDisplay[policyType]
            return <Icon key={policyType} name={roleDisplay.icon} size="small" />
          })}
          {constants.BUTTON_DASHBOARD_VIEW_ALL}
        </div>
      </Link>
    )
  }

  return (
    <div className="view-all-area">
      {renderLink(applicantRoles, USER_ROLES.APPLICANT)}
      {renderLink(reviewerRoles, USER_ROLES.REVIEWER)}
    </div>
  )
}

export default Dashboard
