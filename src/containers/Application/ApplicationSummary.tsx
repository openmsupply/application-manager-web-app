import React, { CSSProperties, useEffect, useState } from 'react'
import { ApplicationProps, MethodToCallProps, ResponsesByCode, User } from '../../utils/types'
import useSubmitApplication from '../../utils/hooks/useSubmitApplication'
import { useUserState } from '../../contexts/UserState'
import { ApplicationStatus } from '../../utils/generated/graphql'
import { useRouter } from '../../utils/hooks/useRouter'
import { Loading } from '../../components'
import { SectionWrapper } from '../../components/Application'
import strings from '../../utils/constants'
import { Button, Header, Message, Container, Segment } from 'semantic-ui-react'
import useQuerySectionActivation from '../../utils/hooks/useQuerySectionActivation'

const ApplicationSummary: React.FC<ApplicationProps> = ({
  structure: fullStructure,
  requestRevalidation,
}) => {
  const { replace, push } = useRouter()
  const [error, setError] = useState(false)

  const {
    userState: { currentUser },
  } = useUserState()

  const { submit } = useSubmitApplication({
    serialNumber: fullStructure?.info.serial as string,
    currentUser: currentUser as User,
  })

  const { isSectionActive, toggleSection } = useQuerySectionActivation({
    defaultActiveSectionCodes: Object.keys(fullStructure?.sections),
  })

  useEffect(() => {
    if (!fullStructure) return

    // Re-direct based on application status
    if (fullStructure.info.current?.status === ApplicationStatus.ChangesRequired)
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
          if (firstStrictInvalidPage) {
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
  const { sections, responsesByCode, info } = fullStructure
  return (
    <Container style={inlineStyles.container}>
      <Header textAlign="center" style={inlineStyles.header}>
        {currentUser?.organisation?.orgName || strings.TITLE_NO_ORGANISATION}
      </Header>
      <Segment className="sup" style={inlineStyles.top}>
        <Header
          as="h1"
          textAlign="center"
          style={inlineStyles.title1}
          content={strings.TITLE_APPLICATION_SUMMARY}
        />
        <Header
          textAlign="center"
          style={inlineStyles.title2}
          as="h3"
          content={strings.SUBTITLE_APPLICATION_SUMMARY}
        ></Header>
        {Object.values(sections).map((section) => (
          <SectionWrapper
            key={`ApplicationSection_${section.details.id}`}
            isActive={isSectionActive(section.details.code)}
            toggleSection={toggleSection(section.details.code)}
            section={section}
            responsesByCode={responsesByCode as ResponsesByCode}
            applicationData={fullStructure.info}
            serial={info.serial}
            isSummary
            canEdit={info.current?.status === ApplicationStatus.Draft}
          />
        ))}
        {/* <ModalWarning showModal={showModal} /> */}
      </Segment>
      {info.current?.status === ApplicationStatus.Draft ? (
        <Segment style={inlineStyles.bot}>
          <div style={inlineStyles.submit}>
            <Button
              style={inlineStyles.button}
              color="blue"
              onClick={handleSubmit}
              content={strings.BUTTON_SUBMIT}
            />
          </div>
        </Segment>
      ) : null}
    </Container>
  )
}

// Styles - TODO: Move to LESS || Global class style (semantic)
const inlineStyles = {
  container: { paddingBottom: 60 } as CSSProperties,
  header: {
    color: 'rgb(150,150,150)',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: 400,
    fontSize: 24,
    paddingTop: 25,
  } as CSSProperties,
  top: {
    background: 'white',
    border: 'none',
    borderRadius: 0,
    boxShadow: 'none',
    paddingTop: 25,
  } as CSSProperties,
  title1: { fontSize: 26, fontWeight: 900, letterSpacing: 1, marginBottom: 4 } as CSSProperties,
  title2: { marginTop: 4, color: '#4A4A4A', fontSize: 16, letterSpacing: 0.36 } as CSSProperties,
  bot: {
    background: 'white',
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    boxShadow: '0px -6px 3px -3px #AAAAAA',
    paddingTop: 10,
    paddingBottom: 10,
    zIndex: 1000,
  } as CSSProperties,
  submit: { display: 'flex', justifyContent: 'flex-end' } as CSSProperties,
  button: { alignSelf: 'flex-end', marginRight: 30 },
}

export default ApplicationSummary
