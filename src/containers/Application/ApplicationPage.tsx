import React, { useEffect } from 'react'
import {
  FullStructure,
  SectionAndPage,
  MethodRevalidate,
  ApplicationProps,
} from '../../utils/types'

import { ApplicationStatus } from '../../utils/generated/graphql'
import { useUserState } from '../../contexts/UserState'
import { useRouter } from '../../utils/hooks/useRouter'
import { Loading } from '../../components'
import strings from '../../utils/constants'
import { Grid, Header, Segment } from 'semantic-ui-react'
import ProgressBarNEW from '../../components/Application/ProgressBarNEW'
import { PageElements } from '../../components/Application'
import { Navigation } from '../../components'
import { checkPageIsAccessible } from '../../utils/helpers/structure'

const ApplicationPage: React.FC<ApplicationProps> = ({
  structure: fullStructure,
  requestRevalidation,
  strictSectionPage,
}) => {
  const {
    userState: { currentUser },
  } = useUserState()
  const {
    query: { serialNumber, sectionCode, page },
    push,
    replace,
  } = useRouter()

  const pageNumber = Number(page)

  useEffect(() => {
    if (!fullStructure) return

    // Re-direct based on application status
    if (fullStructure.info.current?.status !== ApplicationStatus.Draft)
      replace(`/applicationNEW/${fullStructure.info.serial}`)

    // Re-direct if trying to access page higher than allowed
    if (!fullStructure.info.isLinear || !fullStructure.info?.firstStrictInvalidPage) return
    const firstIncomplete = fullStructure.info?.firstStrictInvalidPage
    const current = { sectionCode, pageNumber }
    if (!checkPageIsAccessible({ fullStructure, firstIncomplete, current })) {
      const { sectionCode, pageNumber } = firstIncomplete
      push(`/applicationNEW/${fullStructure.info.serial}/${sectionCode}/Page${pageNumber}`)
    }
  }, [fullStructure, sectionCode, page])

  if (!fullStructure || !fullStructure.responsesByCode) return <Loading />

  const {
    info: { isLinear },
  } = fullStructure

  return (
    <Segment.Group style={{ backgroundColor: 'Gainsboro', display: 'flex' }}>
      {/* <ModalWarning showModal={showModal} /> */}
      <Header textAlign="center">
        {currentUser?.organisation?.orgName || strings.TITLE_NO_ORGANISATION}
      </Header>
      <Grid
        stackable
        style={{
          backgroundColor: 'white',
          padding: 10,
          margin: '0px 50px',
          minHeight: 500,
          flex: 1,
        }}
      >
        <Grid.Column width={4}>
          <ProgressBarNEW
            structure={fullStructure}
            requestRevalidation={requestRevalidation as MethodRevalidate}
            strictSectionPage={strictSectionPage as SectionAndPage}
          />
        </Grid.Column>
        <Grid.Column width={10} stretched>
          <Segment vertical style={{ marginBottom: 20 }}>
            <Header content={fullStructure.sections[sectionCode].details.title} />
            <PageElements
              elements={getCurrentPageElements(fullStructure, sectionCode, pageNumber)}
              responsesByCode={fullStructure.responsesByCode}
              isStrictPage={
                sectionCode === strictSectionPage?.sectionCode &&
                pageNumber === strictSectionPage?.pageNumber
              }
              canEdit
            />
          </Segment>
        </Grid.Column>
        <Grid.Column width={2} />
      </Grid>
      <Navigation
        current={{ sectionCode, pageNumber }}
        isLinear={isLinear}
        sections={fullStructure.sections}
        serialNumber={serialNumber}
        requestRevalidation={requestRevalidation as MethodRevalidate}
      />
    </Segment.Group>
  )
}

export default ApplicationPage

const getCurrentPageElements = (structure: FullStructure, section: string, page: number) => {
  return structure.sections[section].pages[page].state
}
