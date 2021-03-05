import React, { useState } from 'react'
import { Accordion, Segment, Grid, Header, Icon } from 'semantic-ui-react'
import { PageElements } from '.'
import { ResponsesByCode, ElementStateNEW, SectionStateNEW } from '../../utils/types'

interface SectionProps {
  section: SectionStateNEW
  responsesByCode: ResponsesByCode
  isReview?: boolean
  serial: string
  isSummary?: boolean
  canEdit?: boolean
}

const SectionWrapper: React.FC<SectionProps> = ({
  section,
  responsesByCode,
  isReview,
  serial,
  isSummary,
  canEdit,
}) => {
  const [isOpen, setIsOpen] = useState(true)

  const { details, pages } = section

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
                <Header as="h2" content={details.title} />
              </Grid.Column>
              <Grid.Column width={1}>
                <Icon name={isOpen ? 'angle up' : 'angle down'} size="large" />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Accordion.Title>
        <Accordion.Content active={isOpen}>
          {Object.values(pages).map((page) => (
            <Segment key={`Page_${page.number}`}>
              <p>{page.name}</p>
              <PageElements
                elements={page.state.map((elemState) => elemState.element) as ElementStateNEW[]}
                responsesByCode={responsesByCode}
                isReview={isReview}
                serial={serial}
                sectionAndPage={{ sectionCode: details.code, pageNumber: page.number }}
                isSummary={isSummary}
                canEdit={canEdit}
              />
            </Segment>
          ))}
        </Accordion.Content>
      </Segment.Group>
    </Accordion>
  )
}

export default SectionWrapper
