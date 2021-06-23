import React from 'react'

import { useQuery } from '@apollo/client'
import { Message, Header, Form, Segment, Container } from 'semantic-ui-react'
import { Loading } from '../../components'
import { SummaryViewWrapper } from '../../formElementPlugins'
import strings from '../../utils/constants'
import { TemplateElementCategory } from '../../utils/generated/graphql'
import {
  ApplicationDetails,
  DetailDisplay,
  DetailDisplayQuery,
  ResponseFull,
} from '../../utils/types'
import config from '../../config'
import { defaultEvaluatedElement } from '../../utils/hooks/useLoadApplication'

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

  // if (error) return <Message error title={strings.ERROR_GENERIC} list={[error.message]} />
  // Silently ignore errors for demo
  if (error) return null
  if (!data) return <Loading />

  const detailData = detailQuery.getNode(data)

  return (
    <>
      <Header as="h4">{detailData[headerColumn]}</Header>
      <Container id="review-area">
        <Form className="form-area">
          <div className="detail-container">
            {detailDisplayColumns.map((detail, index) => {
              return (
                <Segment key={index} className="summary-page-element">
                  <SummaryViewWrapper
                    element={constructElement(detail, index)}
                    applicationData={
                      {
                        config /* TODO this is a hacky way of passing through server URL, I think it needs to be decoupled from applicationData. Config is needed for log_url in organisation to be displayed with imageDisplays plugin */,
                      } as ApplicationDetails
                    }
                    response={getDetailValue(detailData, detail.columnName, detail.isTextColumn)}
                    allResponses={{}}
                    displayTitle={true}
                  />
                </Segment>
              )
            })}
          </div>
        </Form>
      </Container>
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
  elementIndex: 0,
  page: 0,
  sectionIndex: 0,
  helpText: null,
  sectionCode: '0',
  ...defaultEvaluatedElement,
  isRequired: false,
})

export default OutcomeDetails
