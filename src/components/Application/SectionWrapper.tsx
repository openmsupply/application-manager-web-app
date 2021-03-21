import React, { useRef } from 'react'
import { Accordion, Segment, Grid, Header, Icon, Sticky } from 'semantic-ui-react'
import { PageElements } from '.'
import { ResponsesByCode, SectionStateNEW, PageNEW } from '../../utils/types'

interface SectionProps {
  section: SectionStateNEW
  extraSectionTitleContent?: (section: SectionStateNEW) => React.ReactNode
  extraPageContent?: (page: PageNEW) => React.ReactNode
  scrollableAttachment?: (page: PageNEW) => React.ReactNode
  responsesByCode: ResponsesByCode
  isReview?: boolean
  serial: string
  isSummary?: boolean
  isActive: boolean
  toggleSection: () => void
  canEdit?: boolean
  isChangeRequest?: boolean
}

const SectionWrapper: React.FC<SectionProps> = ({
  section,
  responsesByCode,
  isActive,
  toggleSection,
  extraSectionTitleContent,
  extraPageContent,
  isReview,
  serial,
  isSummary,
  scrollableAttachment,
  canEdit,
  isChangeRequest,
}) => {
  const { details, pages } = section
  const stickyRef = useRef(null)
  return (
    <div ref={stickyRef} key={`${section.details.id}`}>
      <Accordion
        styled
        fluid
        style={{
          borderRadius: 8,
          marginBottom: 10,
          border: 'none',
          boxShadow: 'none',
          backgroundColor: 'rgb(248, 248, 248)',
        }}
      >
        <Accordion.Title active={isActive} onClick={toggleSection}>
          <Sticky context={stickyRef} offset={155}>
            <Grid
              columns="equal"
              style={{ borderRadius: 8, backgroundColor: 'rgb(248, 248, 248)' }}
            >
              <Grid.Column floated="left">
                <Header
                  as="h2"
                  content={details.title}
                  style={{
                    color: '#4A4A4A',
                    fontSize: 18,
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                />
              </Grid.Column>
              <Grid.Column floated="right" textAlign="right">
                {extraSectionTitleContent && extraSectionTitleContent(section)}
              </Grid.Column>
              <Grid.Column floated="right" textAlign="right" width={1}>
                <Icon
                  style={{ color: 'rgb(100, 100, 100)' }}
                  name={isActive ? 'angle up' : 'angle down'}
                  size="large"
                />
              </Grid.Column>
            </Grid>
          </Sticky>
        </Accordion.Title>

        <Accordion.Content active={isActive}>
          {Object.values(pages).map((page) => (
            <>
              {scrollableAttachment && scrollableAttachment(page)}
              <p
                style={{
                  color: '#4A4A4A',
                  fontSize: 15,
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  marginTop: 8,
                }}
              >
                {page.name}
              </p>
              <PageElements
                key={`${section.details.id}Page_${page.number}`}
                isChangeRequest={isChangeRequest}
                elements={page.state}
                responsesByCode={responsesByCode}
                isReview={isReview}
                serial={serial}
                sectionAndPage={{ sectionCode: details.code, pageNumber: page.number }}
                isSummary={isSummary}
                canEdit={canEdit}
              />

              {extraPageContent && extraPageContent(page)}
            </>
          ))}
        </Accordion.Content>
      </Accordion>
    </div>
  )
}

export default SectionWrapper
