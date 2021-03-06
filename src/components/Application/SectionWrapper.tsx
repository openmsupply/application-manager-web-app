import React, { useState } from 'react'
import { Accordion, Segment, Grid, Header, Icon } from 'semantic-ui-react'
import { PageElements } from '.'
import { ResponsesByCode, SectionStateNEW, PageNEW } from '../../utils/types'

interface SectionProps {
  section: SectionStateNEW
  extraSectionTitleContent?: (section: SectionStateNEW) => React.ReactNode
  extraPageContent?: (page: PageNEW) => React.ReactNode
  responsesByCode: ResponsesByCode
  isReview?: boolean
  serial: string
  isSummary?: boolean
  canEdit?: boolean
}

const SectionWrapper: React.FC<SectionProps> = ({
  section,
  responsesByCode,
  extraSectionTitleContent,
  extraPageContent,
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
          <Grid columns="equal">
            <Grid.Column floated="left">
              <Header as="h2" content={details.title} />
            </Grid.Column>
            <Grid.Column floated="right" textAlign="right">
              {extraSectionTitleContent && extraSectionTitleContent(section)}
            </Grid.Column>
            <Grid.Column floated="right" textAlign="right" width={1}>
              <Icon name={isOpen ? 'angle up' : 'angle down'} size="large" />
            </Grid.Column>
          </Grid>
        </Accordion.Title>
        <Accordion.Content active={isOpen}>
          {Object.values(pages).map((page) => (
            <Segment key={`Page_${page.number}`}>
              <p>{page.name}</p>
              <PageElements
                elements={page.state}
                responsesByCode={responsesByCode}
                isReview={isReview}
                serial={serial}
                sectionAndPage={{ sectionCode: details.code, pageNumber: page.number }}
                isSummary={isSummary}
                canEdit={canEdit}
              />

              {extraPageContent && extraPageContent(page)}
            </Segment>
          ))}
        </Accordion.Content>
      </Segment.Group>
    </Accordion>
  )
}

export default SectionWrapper
