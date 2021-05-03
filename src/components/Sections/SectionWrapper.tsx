import React, { CSSProperties, useRef } from 'react'
import { Accordion, Grid, Header, Icon, Sticky } from 'semantic-ui-react'
import { ResponsesByCode, SectionState, Page, ApplicationDetails } from '../../utils/types'
import { PageElements } from '../'

interface SectionProps {
  section: SectionState
  extraSectionTitleContent?: (section: SectionState) => React.ReactNode
  extraPageContent?: (page: Page) => React.ReactNode
  scrollableAttachment?: (page: Page) => React.ReactNode
  responsesByCode: ResponsesByCode
  applicationData: ApplicationDetails
  isReview?: boolean
  serial: string
  isSummary?: boolean
  isActive: boolean
  toggleSection: () => void
  canEdit?: boolean
}

const SectionWrapper: React.FC<SectionProps> = ({
  section,
  responsesByCode,
  applicationData,
  isActive,
  toggleSection,
  extraSectionTitleContent,
  extraPageContent,
  isReview,
  serial,
  isSummary,
  scrollableAttachment,
  canEdit,
}) => {
  const { details, pages } = section
  const stickyRef = useRef(null)
  return (
    <div ref={stickyRef} key={`${section.details.id}`}>
      <Accordion style={sectionStyles.sup}>
        <Accordion.Title active={isActive} onClick={toggleSection}>
          <Sticky context={stickyRef} offset={120} bottomOffset={150}>
            <Grid columns="equal" style={sectionStyles.body}>
              <Grid.Column floated="left">
                <Header as="h2" content={details.title} style={sectionStyles.title} />
              </Grid.Column>
              <Grid.Column floated="right" textAlign="right">
                {extraSectionTitleContent && extraSectionTitleContent(section)}
              </Grid.Column>
              <Grid.Column floated="right" textAlign="right" width={1}>
                <Icon
                  style={sectionStyles.icon}
                  name={isActive ? 'angle up' : 'angle down'}
                  size="large"
                />
              </Grid.Column>
            </Grid>
          </Sticky>
        </Accordion.Title>
        <Accordion.Content active={isActive}>
          {Object.values(pages).map((page) => (
            <div key={`${section.details.id}Page_${page.number}Container`}>
              {scrollableAttachment && scrollableAttachment(page)}
              <p style={sectionStyles.page}>{page.name}</p>
              <PageElements
                key={`${section.details.id}Page_${page.number}`}
                elements={page.state}
                responsesByCode={responsesByCode}
                applicationData={applicationData}
                isReview={isReview}
                serial={serial}
                sectionAndPage={{ sectionCode: details.code, pageNumber: page.number }}
                isSummary={isSummary}
                canEdit={canEdit}
              />
              {extraPageContent && extraPageContent(page)}
            </div>
          ))}
        </Accordion.Content>
      </Accordion>
    </div>
  )
}

// Styles - TODO: Move to LESS || Global class style (semantic)
const sectionStyles = {
  sup: {
    borderRadius: 8,
    marginBottom: 10,
    padding: 10,
    border: 'none',
    boxShadow: 'none',
    backgroundColor: '#DCDDDD', // Invision
  } as CSSProperties,
  body: {
    margin: 0,
    borderRadius: 8,
    backgroundColor: '#DCDDDD', // Invision
  } as CSSProperties,
  title: {
    color: '#4A4A4A',
    fontSize: 18,
    fontWeight: 900,
    textTransform: 'uppercase',
    letterSpacing: 1,
  } as CSSProperties,
  icon: { color: 'rgb(100, 100, 100)' } as CSSProperties,
  page: {
    color: '#4A4A4A',
    fontSize: 15,
    fontWeight: 900,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 8,
  } as CSSProperties,
}

export default SectionWrapper
