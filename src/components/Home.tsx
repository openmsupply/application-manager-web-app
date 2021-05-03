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
    userState: { currentUser, templatePermissions },
  } = useUserState()

  const { templatesData, loading } = useListTemplates(templatePermissions, false)

  if (loading) return <Loading />
  console.log(templatePermissions)

  if (!templatesData) return null

  return (
    <div
      style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}
    >
      {Object.entries(templatesData.templatesByCategory).map(
        ([templateCategoryName, templates]) => (
          <div
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
                <TemplateComponent template={template} />
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
          <Button style={{ marginLeft: 10 }} inverted size="small" primary>
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

            padding: 3,
            borderRadius: 5,
          }}
        >
          {template.filters?.map((filter) => (
            <FilterComponent template={template} filter={filter} />
          ))}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          textAlign: 'center',
          maxWidth: '100%',
          borderTop: '1px solid rgba(0,0,0,.08)',
          padding: 4,
        }}
      >
        <Link
          className="view_all_link"
          style={{ color: 'rgba(0,0,0,.6)', fontWeight: 600 }}
          to={`/applications?type=${template.code}`}
        >
          View All
        </Link>
      </div>
    </div>
  )
}

const FilterComponent: React.FC<{ template: TemplateDetails; filter: Filter }> = ({
  template,
  filter,
}) => {
  const templateType = template.code
  const { loading, applications } = useListApplications({
    type: templateType,
    ...filter.query,
  })

  const constructLink = () =>
    `/applications?type=${templateType}&${Object.entries(filter.query)
      .map(([key, value]) => `${key}=${value}`)
      .join('&')}`

  if (loading) return null
  if (applications.length === 0) return null

  console.log(filter.iconColor)
  return (
    <div style={{ display: 'flex', margin: 2 }}>
      {filter.icon && (
        <Icon color={filter.iconColor as SemanticCOLORS} name={filter.icon as SemanticICONS} />
      )}

      <Link to={constructLink()}>{`${applications.length} ${filter.title}`}</Link>
    </div>
  )
}

// const roleList: { tooltip: string; icon: SemanticICONS; role: PermissionPolicyType }[] = [
//   {
//     tooltip: 'Can Apply',
//     icon: 'edit',
//     role: PermissionPolicyType.Apply,
//   },
//   {
//     tooltip: 'Can Review',
//     icon: 'gavel',
//     role: PermissionPolicyType.Review,
//   },
//   {
//     tooltip: 'Can Assign',
//     icon: 'user plus',
//     role: PermissionPolicyType.Assign,
//   },
// ]

// const Roles: React.FC<{ permissions: PermissionPolicyType[] }> = ({ permissions }) => (
//   <Label
//     floating
//     style={{
//       left: 'auto',
//       right: 0,
//       background: 'none',
//       top: '-1em',
//       margin: 0,
//       padding: 0,
//     }}
//   >
//     {roleList.map((roleInfo) => {
//       if (!permissions.find((permission) => matchTemplatePermission(permission, roleInfo.role)))
//         return null
//       return (
//         <Popup
//           content={roleInfo.tooltip}
//           trigger={
//             <Icon
//               name={roleInfo.icon}
//               circular
//               style={{ background: 'white', padding: 2, margin: 2, color: 'rgb(120, 120, 120)' }}
//             />
//           }
//         />
//       )
//     })}
//   </Label>
// )

export default Home
