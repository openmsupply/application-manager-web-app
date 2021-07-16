import React from 'react'
import { Link } from 'react-router-dom'
import { Header, Button, Icon, Label } from 'semantic-ui-react'
import { useUserState } from '../contexts/UserState'
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
      <Header as="h2" content={strings.MENU_ITEM_DASHBOARD} />
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
  const { name, code, hasApplyPermission, filters, permissions, totalApplications } = template

  const userRole =
    permissions.filter((type) => type === PermissionPolicyType.Apply).length > 0
      ? USER_ROLES.APPLICANT
      : USER_ROLES.REVIEWER

  return (
    <div className="template">
      <div className="content">
        <div className="filters">
          <Label className="strong-label clickable">
            <a href={`/applications?type=${code}&user-role=${userRole}`}>
              {template?.namePlural || `${name} ${strings.LABEL_APPLICATIONS}`}
            </a>
            <Icon name="chevron right" />
          </Label>
          {filters.map((filter) => (
            <FilterComponent key={filter.id} template={template} filter={filter} />
          ))}
        </div>
        {totalApplications === 0 && hasApplyPermission && <StartNewTemplate template={template} />}
      </div>
      <div>
        {totalApplications > 0 && hasApplyPermission && (
          <Button as={Link} to={`/application/new?type=${code}`} inverted color="blue">
            <Icon name="plus" size="tiny" color="blue" />
            {strings.BUTTON_DASHBOARD_NEW}
          </Button>
        )}
      </div>
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
      <Link to={constructLink()}>{`${filter.title} (${applicationCount})`}</Link>
    </div>
  )
}

const StartNewTemplate: React.FC<{ template: TemplateInList }> = ({ template: { name, code } }) => (
  <div className="no-applications">
    <Label
      className="simple-label"
      content={strings.LABEL_DASHBOARD_NO_APPLICATIONS.replace('%1', name)}
    />
    <Link to={`/application/new?type=${code}`}>
      {strings.LABEL_DASHBOARD_START_NEW.replace('%1', name)}
    </Link>
  </div>
)

export default Dashboard
