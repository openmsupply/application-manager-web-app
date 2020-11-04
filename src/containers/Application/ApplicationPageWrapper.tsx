import React, { useState, useEffect } from 'react'
import { useRouter } from '../../utils/hooks/useRouter'
import { ApplicationHeader, Loading } from '../../components'
import { Container, Grid, Label, Segment } from 'semantic-ui-react'
import useLoadApplication from '../../utils/hooks/useLoadApplication'
import useGetResponsesByCode from '../../utils/hooks/useGetResponsesByCode'
import { TemplateSectionPayload } from '../../utils/types'
import ElementsArea from './ElementsArea'
import { useApplicationState } from '../../contexts/ApplicationState'
import evaluateExpression from '@openmsupply/expression-evaluator'

const ApplicationPageWrapper: React.FC = () => {
  const { setApplicationState } = useApplicationState()
  const { elementsState, setElementsState }: any = useState({})
  const { query, push } = useRouter()
  const { mode, serialNumber, sectionCode, page } = query

  const { error, loading, application, templateSections } = useLoadApplication({
    serialNumber: serialNumber as string,
  })

  const {
    error: responsesError,
    loading: responsesLoading,
    responsesByCode,
    elementsExpressions,
  } = useGetResponsesByCode({
    serialNumber: serialNumber as string,
  })

  useEffect(() => {
    if (application) setApplicationState({ type: 'setApplicationId', id: application.id })
  }, [application])

  useEffect(() => {
    evaluateElementExpressions().then((result: any) => setElementsState(result))
  }, [responsesByCode])

  const currentSection = templateSections.find(({ code }) => code == sectionCode)

  const changePagePayload = {
    serialNumber: serialNumber as string,
    sectionCode: sectionCode as string,
    currentPage: Number(page),
    sections: templateSections,
    push,
  }

  const checkPagePayload = {
    sectionCode: sectionCode as string,
    currentPage: Number(page),
    sections: templateSections,
  }

  async function evaluateElementExpressions() {
    const promiseArray: Promise<any>[] = []
    elementsExpressions.forEach((element) => {
      promiseArray.push(evaluateSingleElement(element))
    })

    const evaluatedElements = await Promise.all(promiseArray)

    const elementsState: any = {}
    evaluatedElements.forEach((element) => {
      elementsState[element.code] = {
        id: element.id,
        category: element.category,
        isEditable: element.isEditable,
        isRequired: element.isRequired,
        isVisible: element.isVisible,
        // isValid: element.isValid,
      }
    })
    return elementsState
  }

  async function evaluateSingleElement(element: any) {
    const evaluationParameters = {
      objects: [responsesByCode], // TO-DO: Also send user/org objects etc.
      // graphQLConnection: TO-DO
    }
    const isEditable = evaluateExpression(element.isEditable)
    const isRequired = evaluateExpression(element.isRequired)
    const isVisible = evaluateExpression(element.visibilityCondition)
    // const isValid = evaluateExpression(element.validation)

    const results = await Promise.all([isEditable, isRequired, isVisible])

    const evaluatedElement = {
      code: element.code,
      id: element.id,
      category: element.category,
      isEditable: results[0],
      isRequired: results[1],
      isVisible: results[2],
      // isValid: results[3],
    }
    return evaluatedElement
  }

  return error ? (
    <Label content="Problem to load application" error={error} />
  ) : loading ? (
    <Loading />
  ) : application && serialNumber && currentSection ? (
    <Segment.Group>
      <ApplicationHeader mode={mode} serialNumber={serialNumber} name={application.name} />
      <Container>
        <Grid columns={2} stackable textAlign="center">
          <Grid.Row>
            <Grid.Column>
              <Segment>Place holder for progress</Segment>
            </Grid.Column>
            <Grid.Column>
              <ElementsArea
                applicationId={application.id}
                sectionTitle={currentSection.title}
                sectionTemplateId={currentSection.id}
                sectionPage={Number(page)}
                isFirstPage={checkFirstPage(checkPagePayload)}
                isLastPage={checkLastPage(checkPagePayload)}
                onPreviousClicked={() => previousButtonHandler(changePagePayload)}
                onNextClicked={() => nextPageButtonHandler(changePagePayload)}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    </Segment.Group>
  ) : (
    <Label content="Application's section can't be displayed" />
  )
}

interface checkPageProps {
  sectionCode: string
  currentPage: number
  sections: TemplateSectionPayload[]
}

function checkFirstPage({ sectionCode, currentPage, sections }: checkPageProps): boolean {
  const previousPage = currentPage - 1
  const currentSection = sections.find(({ code }) => code === sectionCode)
  if (!currentSection) {
    console.log('Problem to find currentSection!')
    return true
  }
  return previousPage > 0 ||
    (previousPage === 0 && sections.find(({ index }) => index === currentSection.index - 1))
    ? false
    : true
}

function checkLastPage({ sectionCode, currentPage, sections }: checkPageProps): boolean {
  const nextPage = currentPage + 1
  const currentSection = sections.find(({ code }) => code === sectionCode)
  if (!currentSection) {
    console.log('Problem to find currentSection!')
    return true
  }
  return nextPage <= currentSection.totalPages ||
    (nextPage > currentSection.totalPages &&
      sections.find(({ index }) => index === currentSection.index + 1))
    ? false
    : true
}

interface changePageProps {
  serialNumber: string
  sectionCode: string
  currentPage: number
  sections: TemplateSectionPayload[]
  push: (path: string) => void
}

function previousButtonHandler({
  serialNumber,
  currentPage,
  sectionCode,
  sections,
  push,
}: changePageProps) {
  const currentSection = sections.find(({ code }) => code === sectionCode)
  if (!currentSection) {
    console.log('Problem to find currentSection!')
    return
  }
  const previousPage = currentPage - 1
  //It should go back a section!
  if (previousPage === 0) {
    const foundSection = sections.find(({ index }) => index === currentSection.index - 1)
    if (foundSection) {
      const { code: previousSection, totalPages: lastPage } = foundSection
      push(`../../${serialNumber}/${previousSection}/page${lastPage}`)
    } else {
      console.log('Problem to load previous page (not found)!')
    }
  } else {
    push(`../../${serialNumber}/${sectionCode}/page${previousPage}`)
  }
}

function nextPageButtonHandler({
  serialNumber,
  currentPage,
  sectionCode,
  sections,
  push,
}: changePageProps) {
  const nextPage = currentPage + 1
  const currentSection = sections.find(({ code }) => code === sectionCode)
  if (!currentSection) {
    console.log('Problem to find currentSection!')
    return
  }
  if (nextPage > currentSection.totalPages) {
    const foundSection = sections.find(({ index }) => index === currentSection.index + 1)
    if (foundSection) {
      const { code: nextSection } = foundSection
      push(`../../${serialNumber}/${nextSection}/page1`)
    } else {
      push('../summary')
    }
  } else {
    push(`../../${serialNumber}/${sectionCode}/page${nextPage}`)
  }
}

export default ApplicationPageWrapper
