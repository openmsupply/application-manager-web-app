// Adjust these constants to match existing style settings
// in order for Progress Bar to display correctly
const PIXELS_PER_PAGE = 27.8
const TOP_PAD = 5
const BOTTOM_PAD = 10

import React from 'react'
import { Accordion, Container, Grid, Icon, List, Sticky, Progress } from 'semantic-ui-react'
import strings from '../../utils/constants'
import styleConstants from '../../utils/data/styleConstants'
import { checkPageIsAccessible } from '../../utils/helpers/structure'
import { useRouter } from '../../utils/hooks/useRouter'
import {
  FullStructure,
  MethodRevalidate,
  MethodToCallProps,
  Page,
  ApplicationProgress,
  SectionAndPage,
} from '../../utils/types'

interface ProgressAreaProps {
  structure: FullStructure
  requestRevalidation: MethodRevalidate
  strictSectionPage: SectionAndPage | null
}

interface ProgressBarProps {
  percent: number
  length: number
  error?: boolean
}

enum ProgressType {
  section = 'SECTION',
  page = 'PAGE',
}

const ProgressArea: React.FC<ProgressAreaProps> = ({
  structure,
  requestRevalidation,
  strictSectionPage,
}) => {
  const {
    info: { isLinear },
    sections,
  } = structure

  const {
    query: { sectionCode: currentSectionCode, page },
    push,
  } = useRouter()

  const activeIndex =
    Object.values(sections).findIndex(({ details }) => details.code === currentSectionCode) || 0

  const handleChangeToPage = (sectionCode: string, pageNumber: number) => {
    if (!isLinear) {
      push(`/application/${structure.info.serial}/${sectionCode}/Page${pageNumber}`)
      return
    }

    // Use validationMethod to check if can change to page (on linear application) OR
    // display current page with strict validation
    requestRevalidation(({ firstStrictInvalidPage, setStrictSectionPage }: MethodToCallProps) => {
      if (!firstStrictInvalidPage) {
        setStrictSectionPage(null)
        push(`/application/${structure.info.serial}/${sectionCode}/Page${pageNumber}`)
        return
      }
      if (
        checkPageIsAccessible({
          fullStructure: structure,
          firstIncomplete: firstStrictInvalidPage,
          current: { sectionCode, pageNumber },
        })
      ) {
        setStrictSectionPage(null)
        push(`/application/${structure.info.serial}/${sectionCode}/Page${pageNumber}`)
      } else {
        setStrictSectionPage(firstStrictInvalidPage)
        push(
          `/application/${structure.info.serial}/${firstStrictInvalidPage.sectionCode}/Page${firstStrictInvalidPage.pageNumber}`
        )
      }
    })
  }

  // We want to be able to show FIVE states:
  //    (but some may show same icon)
  // error -> if at least one error or if not completed and strict
  // success -> if completed and valid
  // not started -> nothing has been filled in section/page
  // incomplete -> started but not invalid (probably display same as not started)
  // current -> "dot" in circle to show current section/page
  const getIndicator = (
    progress: ApplicationProgress,
    isStrict: boolean,
    isActive: boolean,
    type = ProgressType.section
  ) => {
    const { completed, valid } = progress
    const isStrictlylInvalid = !valid || (isStrict && !completed)
    const isStarted = progress.doneNonRequired + progress.doneRequired > 0
    const typeIndex = type === ProgressType.section ? 0 : 1

    if (isStrictlylInvalid) return progressIconMap.error[typeIndex]
    if (completed && valid) return progressIconMap.completed[typeIndex]
    if (isActive) return progressIconMap.current[typeIndex]
    if (isStarted) return progressIconMap.incomplete[typeIndex]
    return progressIconMap.notStarted[typeIndex]
  }

  const getPageList = (
    sectionCode: string,
    pages: { [pageNumber: string]: Page },
    isStrictSection: boolean,
    sectionProgress: ApplicationProgress
  ) => {
    const isActivePage = (sectionCode: string, pageNumber: number) =>
      currentSectionCode === sectionCode && Number(page) === pageNumber

    const checkPageIsStrict = (pageNumber: string) =>
      isStrictSection && strictSectionPage?.pageNumber === Number(pageNumber)

    const SectionProgressBar: React.FC<ProgressBarProps> = ({ percent, length, error }) => {
      return (
        <Progress
          percent={percent}
          size="tiny"
          success={!error}
          error={error || (isStrictSection && !sectionProgress.completed)}
          style={{ width: length }}
        />
      )
    }

    const calculateBarPercent = () =>
      sectionProgress.totalRequired === 0
        ? 100
        : (sectionProgress.doneRequired / sectionProgress.totalRequired) * 100

    const calculateBarLength = () => {
      const numPages = Object.keys(pages).length
      return PIXELS_PER_PAGE * numPages + TOP_PAD + BOTTOM_PAD
    }

    return (
      <div className="page-list-container">
        <div className="section-progress-bar">
          <SectionProgressBar
            percent={calculateBarPercent()}
            length={calculateBarLength()}
            error={!sectionProgress.valid}
          />
        </div>
        <List className="page-list">
          {Object.entries(pages).map(([number, { name: pageName, progress }]) => (
            <List.Item
              key={`ProgressSection_${sectionCode}_${number}`}
              active={isActivePage(sectionCode, Number(number))}
              onClick={() => handleChangeToPage(sectionCode, Number(number))}
            >
              <Grid className="page-row clickable">
                <Grid.Column
                  textAlign="right"
                  verticalAlign="middle"
                  className="progress-indicator-column"
                >
                  {progress ? (
                    getIndicator(
                      progress,
                      checkPageIsStrict(number),
                      isActivePage(sectionCode, Number(number)),
                      ProgressType.page
                    )
                  ) : (
                    <div className="progress-page-indicator" />
                  )}
                </Grid.Column>
                <Grid.Column
                  textAlign="left"
                  verticalAlign="middle"
                  className="progress-page-name-column"
                >
                  {pageName}
                </Grid.Column>
              </Grid>
            </List.Item>
          ))}
        </List>
      </div>
    )
  }

  const sectionsList = Object.values(sections).map(({ details, progress, pages }, index) => {
    const isStrictSection = !!strictSectionPage && strictSectionPage.sectionCode === details.code
    const { code, title } = details
    return {
      key: `progress_${index}`,
      title: {
        children: (
          <Grid className="progress-row clickable">
            <Grid.Column
              textAlign="right"
              verticalAlign="middle"
              className="progress-indicator-column"
            >
              {progress && getIndicator(progress, isStrictSection, index === activeIndex)}
            </Grid.Column>
            <Grid.Column textAlign="left" verticalAlign="middle" className="progress-name-column">
              {title}
            </Grid.Column>
          </Grid>
        ),
      },
      onTitleClick: () => handleChangeToPage(code, 1),
      content: {
        content: getPageList(code, pages, isStrictSection, progress as ApplicationProgress),
      },
    }
  })

  return (
    <Sticky
      as={Container}
      id="application-progress"
      offset={styleConstants.HEADER_OFFSET}
      className="hide-on-mobile"
    >
      <Grid className="progress-row">
        <Grid.Column
          // width={3}
          textAlign="right"
          verticalAlign="middle"
          className="progress-indicator-column"
        ></Grid.Column>
        <Grid.Column
          // width={13}
          textAlign="left"
          verticalAlign="middle"
          className="progress-name-column clickable"
          onClick={() => push(`/application/${structure.info.serial}`)}
        >
          {strings.TITLE_INTRODUCTION}
        </Grid.Column>
      </Grid>
      <Accordion activeIndex={activeIndex} panels={sectionsList} />
    </Sticky>
  )
}

// Maps types of indicators to specific Icon components
const progressIconMap = {
  error: [
    <Icon name={'exclamation circle'} color={'pink'} className="progress-indicator" />,
    <Icon name={'exclamation circle'} color={'pink'} className="progress-page-indicator" />,
  ],
  completed: [
    <Icon name="check circle" color="green" className="progress-indicator" />,
    <Icon name="circle" color="green" size="tiny" className="progress-page-indicator" />,
  ],
  notStarted: [
    <Icon name="circle outline" color="grey" className="progress-indicator" />,
    <div className="progress-page-indicator" />,
  ],
  incomplete: [
    <Icon name="circle outline" color="grey" className="progress-indicator" />,
    <div className="progress-page-indicator" />,
  ],
  current: [
    <Icon.Group className="progress-indicator">
      <Icon name="circle outline" color="grey" />
      <Icon
        name="circle"
        color="blue"
        size="mini"
        // Hack to make grouped icons align properly - Semantic bug
        style={{ transform: 'translateX(-72%) translateY(-56%)' }}
      />
    </Icon.Group>,
    <Icon name="circle" color="blue" size="tiny" className="progress-page-indicator" />,
  ],
}

export default ProgressArea
