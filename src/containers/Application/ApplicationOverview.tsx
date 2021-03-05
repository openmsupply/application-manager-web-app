import React, { useEffect, useState } from 'react'
import { Button, Container, Form, Header, Message, ModalProps } from 'semantic-ui-react'
import { SectionSummary, Loading, ModalWarning, NoMatch } from '../../components'
import strings from '../../utils/constants'
import { useRouter } from '../../utils/hooks/useRouter'
import useSubmitApplication from '../../utils/hooks/useSubmitApplication'
import { useUserState } from '../../contexts/UserState'
import { SectionsStructure, User } from '../../utils/types'
import { ApplicationStatus, useUpdateResponseMutation } from '../../utils/generated/graphql'
import messages from '../../utils/messages'
import useLoadSectionsStructure from '../../utils/hooks/useLoadSectionsStructure'
import useRevalidateApplication from '../../utils/hooks/useRevalidateApplication'
import { checkSectionsProgress } from '../../utils/helpers/structure/checkSectionsProgress'
import { getResponsesInStrucutre } from '../../utils/helpers/structure/getElementsInStructure'

// TODO: Remove this

const ApplicationOverview: React.FC = () => {
  const [isRevalidated, setIsRevalidated] = useState(false)
  const [isSubmittedClicked, setIsSubmittedClicked] = useState(false)
  const [sections, setSections] = useState<SectionsStructure>()
  const [showModal, setShowModal] = useState<ModalProps>({ open: false })
  const { query, push } = useRouter()
  const { serialNumber } = query
  const {
    logout,
    userState: { currentUser },
  } = useUserState()

  const {
    error,
    application,
    allResponses,
    sectionsStructure,
    isApplicationReady,
  } = useLoadSectionsStructure({
    serialNumber: serialNumber as string,
    currentUser: currentUser as User,
    networkFetch: true,
  })

  const { validatedSections, isProcessing } = useRevalidateApplication({
    serialNumber: serialNumber as string,
    currentUser: currentUser as User,
    sectionsStructure: sectionsStructure as SectionsStructure,
    isApplicationReady,
    isRevalidated,
    setIsRevalidated,
  })

  // Update sectionStructure with progress after validation runs
  useEffect(() => {
    if (!isApplicationReady || !validatedSections) return
    const { sectionsWithProgress } = validatedSections
    setSections(sectionsWithProgress)
  }, [isApplicationReady, validatedSections])

  const [responseMutation] = useUpdateResponseMutation()

  const { error: submitError, processing, submitted, submit } = useSubmitApplication({
    serialNumber: serialNumber as string,
    currentUser: currentUser as User,
  })

  // Prior to run the submit mutation needs to re-run validation
  const handleSubmit = () => {
    setIsRevalidated(false)
    setIsSubmittedClicked(true)
  }

  // After validation runs will wither run submit mutation or show modal linked to the invalid page
  useEffect(() => {
    if (!isSubmittedClicked || !validatedSections) return
    const { sectionsWithProgress, elementsToUpdate } = validatedSections
    const { isCompleted, firstIncompleteLocation } = checkSectionsProgress(sectionsWithProgress)
    if (isCompleted) {
      const responses = getResponsesInStrucutre(sectionsWithProgress)
      submit(responses)
    } else {
      elementsToUpdate.forEach((updateElement) =>
        responseMutation({ variables: { ...updateElement } })
      )
      setShowModal({
        open: true,
        ...messages.SUBMISSION_FAIL,
        onClick: () => {
          if (firstIncompleteLocation) {
            const code = firstIncompleteLocation
            const { progress } = sectionsWithProgress[code]
            push(`/application/${serialNumber}/${code}/Page${progress?.linkedPage || 1}`)
          }
          setShowModal({ open: false })
        },
        onClose: () => setShowModal({ open: false }),
      })
    }
  }, [isSubmittedClicked, validatedSections, isRevalidated])

  // Finally change to Submission page after submission mutation ends
  useEffect(() => {
    if (submitted && !isProcessing) {
      if (currentUser?.username === strings.USER_NONREGISTERED) {
        logout()
      }
      push(`/application/${serialNumber}/submission`)
    }
  }, [submitted, isProcessing])

  return error ? (
    <NoMatch />
  ) : !isApplicationReady || isProcessing ? (
    <Loading />
  ) : submitError ? (
    <Message error header={strings.ERROR_APPLICATION_SUBMIT} list={[submitError]} />
  ) : serialNumber && application && sections && isRevalidated ? (
    <Container>
      <Header as="h1" content={strings.TITLE_APPLICATION_SUBMIT} />
      <Form>
        {Object.values(sections).map((sectionPages) => (
          <SectionSummary
            key={`ApplicationSection_${sectionPages.details.code}`}
            sectionPages={sectionPages}
            serialNumber={serialNumber}
            allResponses={allResponses || {}}
            canEdit={application.current?.status === ApplicationStatus.Draft}
          />
        ))}
        {application.current?.status === ApplicationStatus.Draft ? (
          <Button
            content={strings.BUTTON_APPLICATION_SUBMIT}
            loading={processing}
            onClick={handleSubmit}
          />
        ) : null}
        <ModalWarning showModal={showModal} />
      </Form>
    </Container>
  ) : (
    <Message error header={strings.ERROR_APPLICATION_OVERVIEW} />
  )
}

export default ApplicationOverview
