import React, { useState, useEffect } from 'react'
import { Accordion, Container, Grid, Header, Icon, Label, List, Sticky } from 'semantic-ui-react'
import {
  CurrentPage,
  Page,
  PageElements,
  SectionProgress,
  SectionsStructure,
} from '../../utils/types'
import { useApplicationState } from '../../contexts/ApplicationState'
import strings from '../../utils/constants'
import { useRouter } from '../../utils/hooks/useRouter'
import { validatePage } from '../../utils/helpers/validation/validatePage'
import getPreviousPage from '../../utils/helpers/application/getPreviousPage'

// TODO: Remove this
interface ProgressBarProps {
  serialNumber: string
  current: CurrentPage
  isLinear: boolean
  sections: SectionsStructure
  validateElementsInPage: (props: CurrentPage) => boolean
}

interface ClickedLinkParameters {
  canNavigate: boolean
  sectionCode: string
  pageNumber?: number
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  serialNumber,
  current,
  isLinear,
  sections,
  validateElementsInPage,
}) => {
  const { push } = useRouter()
  const {
    applicationState: {
      inputElementsActivity: { areTimestampsInSequence },
    },
  } = useApplicationState()
  const [progressLinkClicked, setProgressLinkClicked] = useState(false)
  const [clickedLinkParameters, setClickedLinkParameters] = useState<ClickedLinkParameters>({
    canNavigate: false,
    sectionCode: '',
    pageNumber: 0,
  })

  const getSectionDetails = () =>
    Object.values(sections as SectionsStructure).map(({ details: section }) => section)

  const isPreviousPageIsValid = (sectionCode: string, pageNumber: number) => {
    const sections = getSectionDetails()
    const previousPage = getPreviousPage({ sections, sectionCode, pageNumber })
    return previousPage ? validateElementsInPage(previousPage) : true // First page
  }

  // Make sure all responses are up-to-date (areTimestampsInSequence)
  // and only proceed when button is clicked AND responses are ready
  useEffect(() => {
    if (areTimestampsInSequence && progressLinkClicked) {
      handleLinkClick()
    }
  }, [areTimestampsInSequence, progressLinkClicked])

  const handleLinkClick = async () => {
    const { canNavigate, sectionCode, pageNumber } = clickedLinkParameters
    setProgressLinkClicked(false)
    const page = pageNumber ? pageNumber : 1
    if (canNavigate || isPreviousPageIsValid(sectionCode, page))
      push(`/application/${serialNumber}/${sectionCode}/Page${page}`)
  }

  const changeTo = (sectionCode: string, pageNumber?: number) => {
    setClickedLinkParameters({
      canNavigate: !isLinear,
      sectionCode,
      pageNumber,
    })
    setProgressLinkClicked(true)
  }

  const getPageIndicator = (pageState: PageElements) => {
    const pageStatus = validatePage(pageState)
    const indicator = {
      VALID: <Icon name="check circle" color="green" />,
      NOT_VALID: <Icon name="exclamation circle" color="red" />,
      INCOMPLETE: <Icon name="circle outline" />,
    }
    return pageStatus ? indicator[pageStatus] : null
  }

  const pageList = (
    sectionCode: string,
    pages: {
      [pageName: string]: Page
    }
  ) => {
    const isActivePage = (sectionCode: string, pageNumber: number) =>
      current.section.code === sectionCode && current.page === pageNumber

    return (
      <List style={{ paddingLeft: '50px' }} link>
        {Object.entries(pages).map(([pageName, { number, state }]) => {
          return (
            <List.Item
              active={isActivePage(sectionCode, number)}
              as="a"
              key={`ProgressSection_${sectionCode}_${number}`}
              onClick={() => changeTo(sectionCode, number)}
            >
              {getPageIndicator(state)}
              {pageName}
            </List.Item>
          )
        })}
      </List>
    )
  }

  const getSectionIndicator = (progress: SectionProgress | undefined, step: number) => {
    if (!progress?.completed)
      return (
        <Label circular as="a" basic color="blue" key={`progress_${step}`}>
          {step}
        </Label>
      )
    const { completed, valid } = progress
    if (completed && valid) return <Icon name="check circle" color="green" size="large" />
    if (completed && !valid) return <Icon name="exclamation circle" color="red" size="large" />
  }

  const sectionList = () => {
    const isActiveSection = (sectionCode: string) => current.section.code === sectionCode
    const isDisabled = (code: string, index: number) => {
      return isLinear && current.section.index < index && !isPreviousPageIsValid(code, 1)
    }

    return Object.values(sections).map(({ details, progress, pages }) => {
      const stepNumber = details.index + 1
      const { code, index, title } = details
      return {
        key: `progress_${stepNumber}`,
        title: {
          children: (
            <Grid>
              <Grid.Column width={4} textAlign="right" verticalAlign="middle">
                {getSectionIndicator(progress, stepNumber)}
              </Grid.Column>
              <Grid.Column width={12} textAlign="left" verticalAlign="middle">
                <Header as={isActiveSection(code) ? 'h3' : 'h4'} disabled={isDisabled(code, index)}>
                  {title}
                </Header>
              </Grid.Column>
            </Grid>
          ),
        },
        onTitleClick: () => changeTo(code),
        content: {
          content: pages ? pageList(code, pages) : null,
        },
      }
    })
  }

  return (
    <Sticky as={Container}>
      <Header as="h5" style={{ paddingLeft: 30 }}>
        {strings.TITLE_INTRODUCTION}
      </Header>
      <Accordion
        activeIndex={current.section.index} //TODO: Check if section index match section in list
        panels={sectionList()}
      />
    </Sticky>
  )
}

export default ProgressBar
