import React, { useEffect, useState } from 'react'
import { Button, Header, Message, Container } from 'semantic-ui-react'
import { ApplicationProps, MethodToCallProps, ResponsesByCode, User } from '../../utils/types'
import useSubmitApplication from '../../utils/hooks/useSubmitApplication'
import { useUserState } from '../../contexts/UserState'
import { ApplicationStatus } from '../../utils/generated/graphql'
import { useRouter } from '../../utils/hooks/useRouter'
import { Loading, SectionWrapper } from '../../components'
import strings from '../../utils/constants'
import useQuerySectionActivation from '../../utils/hooks/useQuerySectionActivation'
import usePageTitle from '../../utils/hooks/usePageTitle'
import { Link } from 'react-router-dom'

const isProductionBuild = process.env.NODE_ENV === 'production' // To-do: add to config

const ApplicationSummary: React.FC<ApplicationProps> = ({
  structure: fullStructure,
  requestRevalidation,
}) => {
  const { replace, push, query } = useRouter()
  const [error, setError] = useState(false)

  const {
    userState: { currentUser },
  } = useUserState()

  usePageTitle(strings.PAGE_TITLE_APPLICATION.replace('%1', fullStructure.info.serial))

  const { submit } = useSubmitApplication({
    serialNumber: fullStructure?.info.serial as string,
    currentUser: currentUser as User,
  })

  const { isSectionActive, toggleSection } = useQuerySectionActivation({
    defaultActiveSectionCodes: Object.keys(fullStructure?.sections),
  })

  useEffect(() => {
    if (!fullStructure) return

    if (query.dev === 'true' && !isProductionBuild) return

    // Re-direct based on application status
    if (fullStructure.info.currentStage.status === ApplicationStatus.ChangesRequired)
      replace(`/application/${fullStructure.info.serial}`)

    // Re-direct if application is not valid
    if (fullStructure.info.firstStrictInvalidPage) {
      const { sectionCode, pageNumber } = fullStructure.info.firstStrictInvalidPage
      replace(`/application/${fullStructure.info.serial}/${sectionCode}/Page${pageNumber}`)
    }
  }, [fullStructure])

  const handleSubmit = () => {
    requestRevalidation &&
      requestRevalidation(
        async ({ firstStrictInvalidPage, setStrictSectionPage }: MethodToCallProps) => {
          if (firstStrictInvalidPage && query.dev !== 'true' && isProductionBuild) {
            const { sectionCode, pageNumber } = firstStrictInvalidPage
            setStrictSectionPage(firstStrictInvalidPage)
            replace(`/application/${fullStructure.info.serial}/${sectionCode}/Page${pageNumber}`)
          } else {
            try {
              await submit(fullStructure)
              push(`/application/${fullStructure?.info.serial}/submission`)
            } catch (e) {
              console.log(e)
              setError(true)
            }
          }
        }
      )
  }

  if (error) return <Message error header={strings.ERROR_APPLICATION_SUBMIT} list={[error]} />
  if (!fullStructure) return <Loading />
  const {
    sections,
    responsesByCode,
    info: {
      serial,
      currentStage: { status },
      isChangeRequest,
    },
  } = fullStructure
  return (
    <Container id="application-summary">
      <div id="application-summary-header">
        <Header as="h2" textAlign="center" content={strings.TITLE_APPLICATION_SUMMARY} />
        <p className="center-text">{strings.SUBTITLE_APPLICATION_SUMMARY}</p>
      </div>
      <div id="application-summary-content">
        <div id="application-sections">
          {Object.values(sections).map((section) => (
            <SectionWrapper
              key={`ApplicationSection_${section.details.id}`}
              isActive={isSectionActive(section.details.code)}
              toggleSection={toggleSection(section.details.code)}
              section={section}
              responsesByCode={responsesByCode as ResponsesByCode}
              applicationData={fullStructure.info}
              serial={serial}
              isSummary
              canEdit={status === ApplicationStatus.Draft}
              isUpdating={isChangeRequest}
            />
          ))}
        </div>
        {/* <ModalWarning showModal={showModal} /> */}

        {status === ApplicationStatus.Draft ? (
          <div id="application-submit">
            <Button
              primary
              className="button-wide"
              onClick={handleSubmit}
              content={strings.BUTTON_SUBMIT_APPLICATION}
            />
            <p>
              <Link to={`/application/${fullStructure.info.serial}`}>
                <strong>{strings.LABEL_APPLICATION_BACK}</strong>
              </Link>
            </p>
          </div>
        ) : null}
      </div>
    </Container>
  )
}

export default ApplicationSummary
