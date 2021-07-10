import React, { createContext, useContext, useEffect, useState } from 'react'
import { Loading } from '../../../../components'
import {
  PermissionPolicyType,
  useGetAllPermissionNamesQuery,
} from '../../../../utils/generated/graphql'

type PermissionNamesContext = {
  permissionNames: {
    [type in PermissionPolicyType]: { id: number; name: string; permissionPolicyId: number }[]
  }
}
const defaultContext: PermissionNamesContext = {
  permissionNames: { APPLY: [], REVIEW: [], ASSIGN: [] },
}
const Context = createContext<PermissionNamesContext>(defaultContext)

const PermissionsContext: React.FC = ({ children }) => {
  const [state, setState] = useState<PermissionNamesContext | null>(null)
  const { data } = useGetAllPermissionNamesQuery()

  useEffect(() => {
    const permissionNames = data?.permissionNames?.nodes
    if (!permissionNames) return

    const newState: PermissionNamesContext = defaultContext

    permissionNames.forEach((permissionName) => {
      newState.permissionNames[
        permissionName?.permissionPolicy?.type || PermissionPolicyType.Apply
      ].push({
        id: permissionName?.id || 0,
        name: permissionName?.name || '',
        permissionPolicyId: permissionName?.permissionPolicy?.id || 0,
      })

      setState(newState)
    })
  }, [data])

  if (!state) return <Loading />

  return <Context.Provider value={state}>{children}</Context.Provider>
}

export const usePermissionNameState = () => useContext(Context)
export default PermissionsContext
