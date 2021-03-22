import { PermissionPolicyType } from '../../generated/graphql'
import { UserRoles, TemplatePermissions } from '../../types'

/**
 * @function: findUserRole
 * Deduce the current user Role to interact with applications.
 * Each UserRole define different view options and actions the user have access in the UI.
 * - @param permissions - Array with group of permissions the user have for a template
 * - @returns UserRole deduced from group of permissions or undefined.
 */

const userRoles: UserRoles = {
  reviewer1: [PermissionPolicyType.Review],
  applicant: [PermissionPolicyType.Apply],

  reviewer2: [PermissionPolicyType.Review, PermissionPolicyType.Assign],
  supervisor: [PermissionPolicyType.Assign],
  consolidator: [PermissionPolicyType.Assign], //, PermissionPolicyType.Consolidate]
}

// permissions: Array<PermissionPolicyType>

export default (templatePermissions: TemplatePermissions, type: string): string | undefined => {
  const found = Object.entries(templatePermissions).find(([template]) => template === type)
  if (found) {
    const [_, permissions] = found
    const comparePermissions = permissions.map((permissionType) => permissionType.toUpperCase())

    // Compare array of permission checking if are the same
    const matching = Object.entries(userRoles).filter(([role, permissionList]) => {
      const common = permissionList.filter((permission) => comparePermissions.includes(permission))
      return common.length > 0
    })
    const filteredRoles = matching.map(([role]) => role)
    return filteredRoles?.[0] || undefined
  }
}
