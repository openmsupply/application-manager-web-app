import React from 'react'

import { useQuery } from '@apollo/client'
import { Message, Header, Form, Segment } from 'semantic-ui-react'
import { Loading } from '../../components'
import { SummaryViewWrapper } from '../../formElementPlugins'
import strings from '../../utils/constants'
import { TemplateElementCategory } from '../../utils/generated/graphql'
import { DetailDisplay, DetailDisplayQuery, ResponseFull } from '../../utils/types'

const OutcomeDetails: React.FC<{
  detailDisplayColumns: DetailDisplay[]
  id: number
  headerColumn: string
  detailQuery: DetailDisplayQuery
}> = ({ detailDisplayColumns, id, headerColumn, detailQuery }) => {
  const { data, error } = useQuery(detailQuery.query, {
    variables: { id },
    fetchPolicy: 'network-only',
  })

  if (error) return <Message error title={strings.ERROR_GENERIC} list={[error.message]} />
  if (!data) return <Loading />

  const detailData = detailQuery.getNode(data)

  return (
    <>
      <Header as="h4">{detailData[headerColumn]}</Header>
      <Form className="form-area">
        <div className="detail-container">
          {detailDisplayColumns.map((detail, index) => {
            return (
              <Segment className="summary-page-element">
                <SummaryViewWrapper
                  element={constructElement(detail, index)}
                  response={getDetailValue(detailData, detail.columnName, detail.isTextColumn)}
                  allResponses={{}}
                  displayTitle={true}
                />
              </Segment>
            )
          })}
        </div>
      </Form>
    </>
  )
}

const getDetailValue = (
  row: { [columnName: string]: object | string },
  columnName: string,
  isTextValue: boolean
) => {
  const value = row[columnName]
  if (!value) return { id: 0, text: '' }
  return isTextValue || typeof value === 'string'
    ? ({ id: 0, text: value } as ResponseFull)
    : ({ id: 0, ...value } as ResponseFull)
}

const constructElement = (detail: DetailDisplay, index: number) => ({
  id: index,
  code: String(index),
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
})

export default OutcomeDetails
