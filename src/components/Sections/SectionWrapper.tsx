import React, { CSSProperties, useRef } from 'react'
import { Accordion, Grid, Header, Icon, Sticky } from 'semantic-ui-react'
import { ResponsesByCode, SectionState, Page, ApplicationDetails } from '../../utils/types'
import { useUserState } from '../../contexts/UserState'
import styleConstants from '../../utils/data/styleConstants'
import { PageElements } from '../'

interface SectionProps {
  toggleSection: () => void
  extraSectionTitleContent?: (section: SectionState) => React.ReactNode
  extraPageContent?: (page: Page) => React.ReactNode
  scrollableAttachment?: (page: Page) => React.ReactNode
  section: SectionState
  responsesByCode: ResponsesByCode
  applicationData: ApplicationDetails
  isActive: boolean
  isConsolidation?: boolean
  isReview?: boolean
  isSummary?: boolean
  isUpdating?: boolean
  serial: string
  canEdit?: boolean
  failed?: boolean
}

const SectionWrapper: React.FC<SectionProps> = ({
  toggleSection,
  extraSectionTitleContent,
  extraPageContent,
  scrollableAttachment,
  section,
  serial,
  responsesByCode,
  applicationData,
  isActive,
  isConsolidation = false,
  isReview = false,
  isSummary = false,
  isUpdating = false,
  canEdit = false,
  failed,
}) => {
  const { details, pages } = section
  const stickyRef = useRef(null)
  const {
    userState: { isNonRegistered },
  } = useUserState()
  return (
    <div ref={stickyRef} key={`${section.details.id}`}>
      <Accordion className="summary-section" style={sectionStyles.sup(!!failed)}>
        <Accordion.Title active={isActive} onClick={toggleSection}>
          <Sticky
            context={stickyRef}
            offset={!isNonRegistered ? styleConstants.HEADER_OFFSET : 0}
            bottomOffset={styleConstants.BOTTOM_OFFSET}
          >
            <Grid columns="equal" className="summary-section-header">
              <Grid.Column width={10}>
                <Header as="h4" content={details.title} />
              </Grid.Column>
              <Grid.Column textAlign="left">
                {extraSectionTitleContent && extraSectionTitleContent(section)}
              </Grid.Column>
              <Grid.Column textAlign="right" width={1}>
                <Icon name={isActive ? 'chevron up' : 'chevron down'} className="dark-grey" />
              </Grid.Column>
            </Grid>
          </Sticky>
        </Accordion.Title>
        <Accordion.Content active={isActive}>
          {Object.values(pages).map((page) => (
            <div key={`${section.details.id}Page_${page.number}Container`} className="summary-page">
              {scrollableAttachment && scrollableAttachment(page)}
              <Header as="h6" className="summary-page-header">
                {page.name}
              </Header>
              <PageElements
                key={`${section.details.id}Page_${page.number}`}
                elements={page.state}
                responsesByCode={responsesByCode}
                applicationData={applicationData}
                serial={serial}
                sectionAndPage={{ sectionCode: details.code, pageNumber: page.number }}
                isReview={isReview}
                isConsolidation={isConsolidation}
                isSummary={isSummary}
                isUpdating={isUpdating}
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
  sup: (failed: boolean) =>
    ({
      border: failed ? '2px solid pink' : 'none',
    } as CSSProperties),
}

export default SectionWrapper
