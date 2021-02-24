import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Grid, Header, Segment, Accordion, Icon } from 'semantic-ui-react'
import { SummaryViewWrapper } from '../../formElementPlugins'
import strings from '../../utils/constants'
import { TemplateElementCategory } from '../../utils/generated/graphql'
import { ResponsesByCode, SectionState } from '../../utils/types'

interface SectionSummaryProps {
  sectionPages: SectionState
  serialNumber: string
  allResponses: ResponsesByCode
  canEdit: boolean
}

const SectionSummary: React.FC<SectionSummaryProps> = ({
  sectionPages,
  serialNumber,
  allResponses,
  canEdit,
}) => {
  const { details: section, pages } = sectionPages
  const [isOpen, setIsOpen] = useState(true)

  const handleClick = () => {
    setIsOpen(!isOpen)
  }

  return (
    <Accordion styled fluid>
      <Segment.Group size="large">
        <Accordion.Title active={isOpen} onClick={handleClick}>
          <Grid>
            <Grid.Row>
              <Grid.Column width={15}>
                <Header as="h2" content={section.title} />
              </Grid.Column>
              <Grid.Column width={1}>
                <Icon name={isOpen ? 'angle up' : 'angle down'} size="large" />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Accordion.Title>
        <Accordion.Content active={isOpen}>
          {Object.entries(pages).map(([pageName, { state }]) => (
            <Segment key={`SectionSummary_${pageName}`}>
              <p>{pageName}</p>
              <Segment.Group>
                {state.map(({ element, response }) => {
                  const { category, isEditable } = element
                  const pageCode = pageName?.replace(' ', '')
                  return (
                    <Segment key={`SectionSummary_${element.code}`}>
                      <Grid columns={2} verticalAlign="middle">
                        <Grid.Row>
                          <Grid.Column width={13}>
                            <SummaryViewWrapper
                              element={element}
                              response={response}
                              allResponses={allResponses}
                            />
                          </Grid.Column>
                          <Grid.Column width={3}>
                            {category === TemplateElementCategory.Question &&
                              isEditable &&
                              canEdit && (
                                <Button
                                  content={strings.BUTTON_SUMMARY_EDIT}
                                  size="small"
                                  as={Link}
                                  to={`/application/${serialNumber}/${section.code}/${pageCode}`}
                                />
                              )}
                          </Grid.Column>
                        </Grid.Row>
                      </Grid>
                    </Segment>
                  )
                })}
              </Segment.Group>
            </Segment>
          ))}
        </Accordion.Content>
      </Segment.Group>
    </Accordion>
  )
}

export default SectionSummary
