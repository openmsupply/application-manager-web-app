import { USER_ROLES } from '../../data'
import { PermissionPolicyType } from '../../generated/graphql'
import { TemplatePermissions } from '../../types'

type UserRoles = {
  [role in USER_ROLES]: Array<PermissionPolicyType>
}

/**
 * @function: findUserRole
 * Deduce the current user Role to interact with applications.
 * Each UserRole define different view options and actions the user have access in the UI.
 * - @param permissions - Array with group of permissions the user have for a template
 * - @returns UserRole deduced from group of permissions or undefined.
 */

const userRoles: UserRoles = {
  applicant: [PermissionPolicyType.Apply],
  reviewer: [PermissionPolicyType.Review, PermissionPolicyType.Assign],
}

// permissions: Array<PermissionPolicyType>
const getUserRolesForType = (templatePermissions: TemplatePermissions, type: string): string[] => {
  const found = Object.entries(templatePermissions).find(([template]) => template === type)
  if (!found) return []

  const [_, permissions] = found

  // Compare array of permission checking if are the same
  const matching = Object.entries(userRoles).filter(([_, permissionList]) => {
    const common = permissionList.filter((permission) => permissions.includes(permission))
    return common.length > 0
  })
  const filteredRoles = matching.map(([role]) => role)
  return filteredRoles
}

const findUserRole = (
  templatePermissions: TemplatePermissions,
  type: string
): string | undefined => {
  const userRoles = getUserRolesForType(templatePermissions, type)
  return userRoles?.[0]
}

const checkExistingUserRole = (
  templatePermissions: TemplatePermissions,
  type: string,
  userRole: string
) => {
  const list = Object.values(USER_ROLES)
  const existing = list.includes(userRole as USER_ROLES)
  if (!existing) return false

  // If userRole correspond to one existing, check if user has permission
  const userRoles = getUserRolesForType(templatePermissions, type)
  return userRoles?.includes(userRole)
}

export { findUserRole, checkExistingUserRole }
