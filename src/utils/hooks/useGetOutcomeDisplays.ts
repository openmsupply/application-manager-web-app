import { gql } from '@apollo/client'
import { useState, useEffect } from 'react'
import { useGetOutcomeDisplaysQuery } from '../generated/graphql'
import {
  OutcomeDisplaysStructure,
  TableDisplaysByCode,
  DetailDisplaysByCode,
  OutcomeDisplays,
  TableDisplaysQueryByCode,
  DetailDisplayQueryByCode,
  TableDisplay,
  TableQueryResult,
  DetailDisplay,
  DetailQueryResult,
  OutcomeDisplay,
  ApplicationLinkQueryResult,
  ApplicationLinkQueryByCode,
  OutcomeCountQueryResult,
  OutcomeCountQueryByCode,
} from '../types'

type UseGetOutcomeDisplays = () => {
  error: string
  displays: OutcomeDisplaysStructure | null
}

// Hook used to get outcome displays
const useGetOutcomeDisplays: UseGetOutcomeDisplays = () => {
  const [displays, setDisplays] = useState<OutcomeDisplaysStructure | null>(null)
  const { data, error } = useGetOutcomeDisplaysQuery({ fetchPolicy: 'network-only' })

  useEffect(() => {
    if (!data || !!error) return
    const tableDisplaysByCode: TableDisplaysByCode = {}
    const detailDisplaysByCode: DetailDisplaysByCode = {}
    const outcomeDisplays: OutcomeDisplays = []

    const tableDisplayQueryByCode: TableDisplaysQueryByCode = {}
    const detailDisplayQueryByCode: DetailDisplayQueryByCode = {}
    const applicationLinkQueryByCode: ApplicationLinkQueryByCode = {}
    const outcomeCountQueryByCode: OutcomeCountQueryByCode = {}

    const displayNodes = data?.outcomeDisplays?.nodes || []

    displayNodes.forEach((display) => {
      const displayCode = String(display?.code)
      const outcomeDisplay = {
        code: displayCode,
        detailColumnName: String(display?.detailColumnName),
        pluralTableName: String(display?.pluralTableName),
        tableName: String(display?.tableName),
        title: String(display?.title),
      }
      outcomeDisplays.push(outcomeDisplay)

      tableDisplaysByCode[displayCode] = (display?.outcomeDisplayTables?.nodes || []).map(
        (displayTable) => ({
          columnName: String(displayTable?.columnName),
          isTextColumn: !!displayTable?.isTextColumn,
          title: String(displayTable?.columnName),
        })
      )

      detailDisplaysByCode[displayCode] = (display?.outcomeDisplayDetails?.nodes || []).map(
        (displayDetail) => ({
          columnName: String(displayDetail?.columnName),
          isTextColumn: !!displayDetail?.isTextColumn,
          title: String(displayDetail?.columnName),
          elementTypePluginCode: String(displayDetail?.elementTypePluginCode),
          parameters: displayDetail?.parameters || {},
        })
      )

      tableDisplayQueryByCode[displayCode] = buildTableQuery(
        outcomeDisplay,
        tableDisplaysByCode[displayCode]
      )

      detailDisplayQueryByCode[displayCode] = buildDetailsQuery(
        outcomeDisplay,
        detailDisplaysByCode[displayCode]
      )

      applicationLinkQueryByCode[displayCode] = buildApplicationLinkQuery(outcomeDisplay)

      outcomeCountQueryByCode[displayCode] = buildCountQuery(outcomeDisplay)
    })

    setDisplays({
      outcomeDisplays,
      tableDisplaysByCode,
      detailDisplaysByCode,
      tableDisplayQueryByCode,
      detailDisplayQueryByCode,
      outcomeCountQueryByCode,
      applicationLinkQueryByCode,
    })
  }, [data])

  return {
    error: error?.message || '',
    displays,
  }
}

const getColumns = (columns: { columnName: string }[], extraColumns: string[]) => {
  const columnNamesObject: { [columnName: string]: boolean } = { id: true }
  columns.forEach(({ columnName }) => (columnNamesObject[columnName] = true))
  extraColumns.forEach((columnName) => (columnNamesObject[columnName] = true))

  return Object.keys(columnNamesObject).join(' ')
}

const buildTableQuery = ({ pluralTableName }: OutcomeDisplay, tableColumns: TableDisplay[]) => {
  const query = gql`
    query ${pluralTableName} {
      ${pluralTableName} {
        nodes {
          ${getColumns(tableColumns, ['id'])}
        }
      }
    }
  `

  const getNodes = (queryResult: TableQueryResult) => queryResult?.[pluralTableName]?.nodes || []

  return { query, getNodes }
}

const buildDetailsQuery = (
  { tableName, detailColumnName }: OutcomeDisplay,
  tableColumns: DetailDisplay[]
) => {
  const query = gql`
    query ${tableName} ($id: Int!) {
      ${tableName} (id: $id ) {
        ${getColumns(tableColumns, [detailColumnName])}
      }
    }
  `

  const getNode = (queryResult: DetailQueryResult) => queryResult?.[tableName] || {}

  return { query, getNode }
}

const buildCountQuery = ({ pluralTableName }: OutcomeDisplay) => {
  const query = gql`
      query ${pluralTableName}Count {
        ${pluralTableName} (first: 0) {
          totalCount
        }
      }
  `

  const getCount = (queryResult: OutcomeCountQueryResult) =>
    queryResult?.[pluralTableName]?.totalCount || 0

  return { query, getCount }
}

const buildApplicationLinkQuery = ({ tableName }: OutcomeDisplay) => {
  const capitalise = (text: string) => `${text.slice(0, 1).toUpperCase()}${text.slice(1)}`

  const applicationJoin = `application${capitalise(tableName)}Joins`

  const query = gql`
    query get${tableName} ($id: Int!) {
      ${tableName}(id: $id) {
        ${applicationJoin} {
          nodes {
            application {
              name
              serial
              template {
                name
              }
            }
          }
        }
      }
    }`

  const getApplications = (queryResult: ApplicationLinkQueryResult) => {
    const applicationJoins = queryResult?.[tableName]?.[applicationJoin]?.nodes || []
    if (applicationJoins.length === 0) return []
    return applicationJoins.map(({ application }) => ({
      name: String(application.name),
      serial: String(application.serial),
      templateName: String(application?.template?.name),
    }))
  }

  return { query, getApplications }
}

export default useGetOutcomeDisplays
