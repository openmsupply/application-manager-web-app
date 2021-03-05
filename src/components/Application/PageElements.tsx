import React from 'react'
import { Link } from 'react-router-dom'
import { ElementStateNEW, ResponsesByCode, SectionAndPage } from '../../utils/types'
import ApplicationViewWrapper from '../../formElementPlugins/ApplicationViewWrapperNEW'
import SummaryViewWrapperNEW from '../../formElementPlugins/SummaryViewWrapperNEW'
import { Form, Grid, Segment, Button } from 'semantic-ui-react'
import strings from '../../utils/constants'
import { TemplateElementCategory } from '../../utils/generated/graphql'

interface PageElementProps {
  elements: ElementStateNEW[]
  responsesByCode: ResponsesByCode
  isStrictPage?: boolean
  canEdit?: boolean
  isReview?: boolean
  isSummary?: boolean
  serial?: string
  sectionAndPage?: SectionAndPage
}

const PageElements: React.FC<PageElementProps> = ({
  elements,
  responsesByCode,
  isStrictPage,
  canEdit,
  isReview,
  isSummary,
  serial,
  sectionAndPage,
}) => {
  // Editable Application page
  if (canEdit && !isReview && !isSummary)
    return (
      <Form>
        {elements.map((element) => {
          return (
            <ApplicationViewWrapper
              key={`question_${element.code}`}
              element={element}
              isStrictPage={isStrictPage}
              allResponses={responsesByCode}
              currentResponse={responsesByCode?.[element.code]}
            />
          )
        })}
      </Form>
    )

  // Summary Page
  if (isSummary) {
    const { sectionCode, pageNumber } = sectionAndPage as SectionAndPage
    return (
      <Form>
        <Segment.Group>
          {elements.map((element) => (
            <Segment key={`question_${element.code}`}>
              <Grid columns={2} verticalAlign="middle">
                <Grid.Row>
                  <Grid.Column width={13}>
                    <SummaryViewWrapperNEW
                      element={element}
                      response={responsesByCode?.[element.code]}
                      allResponses={responsesByCode}
                    />
                  </Grid.Column>
                  <Grid.Column width={3}>
                    {element.category === TemplateElementCategory.Question && canEdit && (
                      <Button
                        content={strings.BUTTON_SUMMARY_EDIT}
                        size="small"
                        as={Link}
                        to={`/application/${serial}/${sectionCode}/Page${pageNumber}`}
                      />
                    )}
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Segment>
          ))}
        </Segment.Group>
      </Form>
    )
  }

  // Review Page -- TO-DO
  if (isReview)
    return (
      <Form>
        {elements.map((element) => {
          return <p>Review Element</p>
        })}
      </Form>
    )

  return null
}

export default PageElements
