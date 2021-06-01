import React from 'react'
import { gql, useQuery } from '@apollo/client'
import { Link, Route, Switch } from 'react-router-dom'
import { Form, Header, Segment, Table } from 'semantic-ui-react'
import { Loading, NoMatch } from '.'

import {
  Outcome,
  useGetOutcomesQuery,
  OutcomeTableView,
  OutcomeDetailView,
  TemplateElementCategory,
} from '../utils/generated/graphql'
import { useRouter } from '../utils/hooks/useRouter'
import { SummaryViewWrapper } from '../formElementPlugins'
import { toCamelCase } from '../LookupTable/utils'

export const Outcomes: React.FC = () => {
  const {
    match: { path },
  } = useRouter()

  const { data } = useGetOutcomesQuery({ fetchPolicy: 'network-only' })
  if (!data) return <Loading />

  if (!data?.outcomes?.nodes) return null

  const outcomes = data.outcomes.nodes as Outcome[]

  return (
    <Switch>
      <Route exact path={`${path}/:code/:id`}>
        <OutcomeDetails outcomes={outcomes} />
      </Route>
      <Route exact path={`${path}/:code`}>
        <OutcomeTable outcomes={outcomes} />
      </Route>
      <Route exact path={`${path}`}>
        <OutcomeList outcomes={outcomes} />
      </Route>
      <Route>
        <NoMatch />
      </Route>
    </Switch>
  )
}

const OutcomeDetails: React.FC<{ outcomes: Outcome[] }> = ({ outcomes }) => {
  const {
    match: { path },
    push,
    query: { code, id },
  } = useRouter()
  const outcome = outcomes.find(({ code: codeToMatch }) => code === codeToMatch)
  const detailView = outcome?.outcomeDetailViews.nodes as OutcomeDetailView[]

  // needs better plural conversion
  const tableName = outcome?.tableName || ''

  const dynamicQuery = gql`
    query get${tableName} {
      ${tableName}(id: ${id}) {
        ${detailView.map(({ columnName }) => columnName).join(' ')} id ${outcome?.detailColumnName}
      }
    }
  `
  const { data } = useQuery(dynamicQuery, { fetchPolicy: 'network-only' })

  const applicationJoin = toCamelCase(`application_${tableName}_joins`)
  const applicationsQuery = gql`
    query get${tableName} {
      ${tableName}(id: ${id}) {
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
    }
  `
  const { data: applicationsData, error } = useQuery(applicationsQuery, {
    fetchPolicy: 'network-only',
  })

  if (!(data && (applicationsData || error))) return <Loading />
  let applicationsInfo = []
  if (!error) {
    console.log(applicationsData)
    const applicationJoins = applicationsData?.[tableName]?.[applicationJoin]?.nodes
    if (applicationJoins.length > 0) {
      const applications = applicationJoins.map((join: any) => join.application)
      applicationsInfo = applications.map((application: any) => ({
        serial: application.serial,
        templateName: application.template.name,
      }))
    }

    console.log(applicationsInfo)
  }

  const tableData = data?.[tableName]

  return (
    <div>
      <Header as="h3">{tableData[outcome?.detailColumnName || '']}</Header>
      <Form className="form-area">
        {detailView.map((detail, index) => {
          const element = {
            id: index,
            code: String(detail.id),
            pluginCode: detail.elementTypePluginCode as string,
            category: TemplateElementCategory.Information,
            title: detail.title as string,
            parameters: detail.parameters,
            validationExpression: true,
            validationMessage: '',
            isRequired: false,
            isEditable: true,
            isVisible: true,
            elementIndex: 0,
            page: 0,
            sectionIndex: 0,
            helpText: null,
            sectionCode: '0',
          }

          const value = tableData?.[detail.columnName || '']
          const response = detail.isTextColumn ? { text: value } : value
          return (
            <Segment className="summary-page-element">
              <SummaryViewWrapper
                element={element}
                response={response}
                allResponses={{}}
                displayTitle={true}
              />
            </Segment>
          )
        })}
      </Form>
      {applicationsInfo.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <Header as="h4">Applications</Header>
          <Table sortable stackable selectable>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell key={'serial'} colSpan={1}>
                  serial
                </Table.HeaderCell>
                <Table.HeaderCell key={'name'} colSpan={1}>
                  Application Type
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {applicationsInfo.map((row: any) => {
                return (
                  <Table.Row key={row} onClick={() => push(`/application/${row.serial}`)}>
                    <Table.Cell key={'serial'}>{row.serial}</Table.Cell>
                    <Table.Cell key={'name'}>{row.templateName}</Table.Cell>
                  </Table.Row>
                )
              })}
            </Table.Body>
          </Table>
        </div>
      )}
    </div>
  )
}

const OutcomeTable: React.FC<{ outcomes: Outcome[] }> = ({ outcomes }) => {
  const {
    match: { path },
    push,
    query: { code },
  } = useRouter()
  const outcome = outcomes.find(({ code: codeToMatch }) => code === codeToMatch)
  const tableView = outcome?.outcomeTableViews.nodes as OutcomeTableView[]

  // needs better plural conversion
  const plural = `${outcome?.tableName}s`
  const dynamicQuery = gql`
    query get${plural} {
      ${plural} {
        nodes {
          ${tableView.map(({ columnName }) => columnName).join(' ')} id
        }
      }
    }
  `
  const { data } = useQuery(dynamicQuery, { fetchPolicy: 'network-only' })

  if (!data) return <Loading />

  const nodes = data?.[plural].nodes

  return (
    <div>
      <Header as="h3">{outcome?.title}</Header>
      <Table sortable stackable selectable>
        <Table.Header>
          <Table.Row>
            {tableView.map(({ title }) => (
              <Table.HeaderCell key={title} colSpan={1}>
                {title}
              </Table.HeaderCell>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {nodes.map((row: any) => {
            return (
              <Table.Row key={row} onClick={() => push(`/outcomes/${code}/${row.id}`)}>
                {tableView.map(({ columnName }) => (
                  <Table.Cell key={columnName}>{row[columnName as string]}</Table.Cell>
                ))}
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table>
    </div>
  )
}

const OutcomeList: React.FC<{ outcomes: Outcome[] }> = ({ outcomes }) => {
  return (
    <div id="dashboard">
      {outcomes.map((outcome) => (
        <div className="template">
          <div className="title">
            <Link className="clickable" to={`/outcomes/${outcome?.code}`}>
              <Header
                className="clickable"
                onClick={() => {
                  console.log('yow')
                }}
                as="h5"
              >
                {outcome?.title}
              </Header>
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
