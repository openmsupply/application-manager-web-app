import React from 'react'
import { Link } from 'react-router-dom'
import { Accordion, Container, Grid, Header, Label, List, Sticky } from 'semantic-ui-react'
import { TemplateSectionPayload } from '../../utils/types'

interface SectionPage {
  sectionIndex: number
  currentPage: number
}

interface ProgressBarProps {
  serialNumber: string
  templateSections: TemplateSectionPayload[]
  currentSectionPage?: SectionPage
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  serialNumber,
  templateSections,
  currentSectionPage,
}) => {
  const pageList = (section: string, totalPages: number) => {
    const pages = Array.from(Array(totalPages).keys(), (n) => n + 1)
    return (
      <List link>
        {pages.map((number) => (
          <List.Item
            active={true} // TODO: Change to only show active when visited in Non-linear application
            href={`/applications/${serialNumber}/${section}/Page${number}`}
            key={`page_${number}`}
          >{`Page ${number}`}</List.Item>
        ))}
      </List>
    )
  }

  const rootPanels = () => {
    const sectionItems = templateSections.map((section, index) => {
      const stepNumber = index + 1

      return {
        key: `progress_${stepNumber}`,
        title: {
          children: (
            <Grid>
              <Grid.Column width={4} textAlign="right" verticalAlign="middle">
                {getStepNumber(stepNumber)}
              </Grid.Column>
              <Grid.Column width={12} textAlign="left" verticalAlign="middle">
                <Header size="small" content={section.title} />
              </Grid.Column>
            </Grid>
          ),
        },
        onTitleClick: () => console.log('Clicked title', section.title),
        content: {
          content: (
            <Grid divided>
              <Grid.Column width={4}></Grid.Column>
              <Grid.Column width={12}>{pageList(section.code, section.totalPages)}</Grid.Column>
            </Grid>
          ),
        },
      }
    })

    const summaryNumber = sectionItems.length + 1
    sectionItems.push({
      key: 'progress_summary',
      title: {
        children: (
          <Grid>
            <Grid.Column width={4} textAlign="right" verticalAlign="middle">
              {getStepNumber(summaryNumber)}
            </Grid.Column>
            <Grid.Column width={12} textAlign="left" verticalAlign="middle">
              <Header size="small" content={'Review and submit'} />
            </Grid.Column>
          </Grid>
        ),
      },
      // Ideally these aren't needed - Couldn't find some way to remove this
      onTitleClick: () => console.log('Clicked on Summary'),
      content: {
        content: <Header as={Link} to={`applications/${serialNumber}/summary`} />,
      },
    })
    return sectionItems
  }

  return (
    <Sticky as={Container}>
      <Header as="h5" textAlign="center" content="Steps to complete form" />
      <Accordion
        activeIndex={
          currentSectionPage ? currentSectionPage.sectionIndex : templateSections.length + 1
        }
        panels={rootPanels()}
      />
    </Sticky>
  )
}

const getStepNumber = (stepNumber: number) => (
  //   isLastElement ? (
  <Label circular as="a" basic color="blue" key={`progress_${stepNumber}`}>
    {stepNumber}
  </Label>
)
//   ) : (
// Note: Attempt to use the vertical divider...
// <Divider vertical>
//   <Label circular as="a" basic color="blue" key={`progress_${stepNumber}`}>
//     {stepNumber}
//   </Label>
// </Divider>
//   )

export default ProgressBar
