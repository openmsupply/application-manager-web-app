import { truncate } from 'lodash'
import React, { useEffect, useState } from 'react'
import ReactJson from 'react-json-view'
import {
  Accordion,
  Button,
  Checkbox,
  Dropdown,
  Header,
  Icon,
  Input,
  Label,
  Modal,
  Popup,
} from 'semantic-ui-react'

import { Loading, PageElements } from '../../../components'
import ConsolidateReviewDecision from '../../../components/PageElements/Elements/ConsolidateReviewDecision'
import config from '../../../config'
import { useUserState } from '../../../contexts/UserState'
import pluginProvider from '../../../formElementPlugins/pluginProvider'
import {
  TemplateElementCategory,
  TemplateStatus,
  useCreateSectionMutation,
  useDeleteWholeApplicationMutation,
  useGetTemplateElementsByPluginQuery,
  useRestartApplicationMutation,
  useUpdateTemplateElementMutation,
  useUpdateTemplateMutation,
  useUpdateTemplateSectionMutation,
} from '../../../utils/generated/graphql'
import useCreateApplication from '../../../utils/hooks/useCreateApplication'
import useGetApplicationStructure from '../../../utils/hooks/useGetApplicationStructure'
import useLoadApplication from '../../../utils/hooks/useLoadApplication'
import { calculateTemplateDetails } from '../../../utils/hooks/useLoadTemplate'
import { ElementState, EvaluatorNode, FullStructure, User } from '../../../utils/types'
import { handleCreate } from '../../Application/ApplicationCreate'
import { parseAndRenderEvaluation, renderEvaluationElement } from '../evaluatorGui/renderEvaluation'
import semanticComponentLibrary from '../evaluatorGui/semanticComponentLibrary'
import { getTypedEvaluation } from '../evaluatorGui/typeHelpers'
import { JsonTextBox, OnBlurInput } from './General'
import { TemplateInfo } from './TemplateWrapper'

type MoveElement = {
  id: number
  index: number
  page: MovePage
  section: MoveSection
  isLastInPage: boolean
  isFirstInPage: boolean
  nextElement: MoveElement | null
  previousElement: MoveElement | null
}
type MovePage = {
  pageNumber: number
  isFirst: boolean
  isLast: boolean
  section: MoveSection
  elements: MoveElement[]
  startPageBreaks: MoveElement[]
  endPageBreaks: MoveElement[]
}
type MoveSection = {
  id: number
  pages: { [pageNumber: number]: MovePage }
  isFirst: boolean
  isLast: boolean
  index: number
  elements: MoveElement[]
  nextSection: MoveSection | null
  previousSection: MoveSection | null
}

type MoveStructure = {
  sections: { [code: string]: MoveSection }
  elements: { [id: number]: MoveElement }
}

const getMoveStructure = (templateInfo: TemplateInfo) => {
  const result: MoveStructure = { sections: {}, elements: {} }

  const templateSections = templateInfo?.templateSections?.nodes || []
  let previousSection: MoveSection | null = null
  templateSections.forEach((templateSection, index) => {
    const templateElements = templateSection?.templateElementsBySectionId?.nodes || []
    const section: MoveSection = {
      id: templateSection?.id || 0,
      pages: {},
      index: templateSection?.index || 0,
      isFirst: index === 0,
      previousSection,
      elements: [],
      nextSection: null,
      isLast: templateSections.length - 1 === index,
    }
    if (previousSection) previousSection.nextSection = section
    previousSection = section

    let pageNumber = 0

    result.sections[templateSection?.code || ''] = section

    let previousElement: MoveElement | null = null

    let previousElementIsPageBreak = true
    let isFirstPage = true

    templateElements.forEach((templateElement, index) => {
      const isLastInSection = index === templateElements.length - 1
      const isPageBreak = templateElement?.elementTypePluginCode === 'pageBreak'

      const isFirstElementAfterPageBreak = !isPageBreak && previousElementIsPageBreak

      if (isFirstElementAfterPageBreak) {
        pageNumber++
        const previousPage = section.pages[pageNumber - 1] || null
        section.pages[pageNumber] = {
          pageNumber,
          section,
          isFirst: isFirstPage,
          isLast: isLastInSection,
          startPageBreaks: previousPage ? previousPage.endPageBreaks : [],
          endPageBreaks: [],
          elements: [],
        }
        isFirstPage = false
      }

      const pageExists = section.pages[pageNumber]

      const element: MoveElement = {
        id: templateElement?.id || 0,
        index: templateElement?.index || 0,
        page: section.pages[pageNumber],
        isFirstInPage: !pageExists || section.pages[pageNumber].elements.length === 0,
        isLastInPage: false,
        previousElement,
        nextElement: null,
        section,
      }

      if (isPageBreak) {
        if (previousElement) previousElement.isLastInPage = true
        if (pageExists) section.pages[pageNumber].endPageBreaks.push(element)
      } else {
        result.elements[templateElement?.id || 0] = element
        section.pages[pageNumber].elements.push(element)
        section.elements.push(element)
        if (previousElement) previousElement.nextElement = element
        previousElement = element
      }

      if (isLastInSection) {
        if (pageExists) section.pages[pageNumber].isLast = isLastInSection
        if (!isPageBreak) element.isLastInPage = true
      }

      previousElementIsPageBreak = isPageBreak
    })
  })
  return result
}

const CreateApplicationWrapper: React.FC<{
  templateInfo: TemplateInfo
  moveStructure: MoveStructure
}> = ({ templateInfo, moveStructure }) => {
  const [serial, setSerial] = useState(templateInfo?.configApplications?.nodes?.[0]?.serial || '')
  const isEditable = templateInfo?.status === TemplateStatus.Draft
  const { create } = useCreateApplication({
    onCompleted: () => {},
  })
  const [error, setError] = useState<Error | null>(null)
  const [deleteApplication] = useDeleteWholeApplicationMutation()
  const {
    userState: { currentUser },
  } = useUserState()

  useEffect(() => {
    if (!serial) {
      resetApplication()
    }
  }, [serial])

  const resetApplication = async () => {
    if (!templateInfo) return
    const existingId = templateInfo?.configApplications?.nodes?.[0]?.id
    if (existingId) {
      const result = await mutate(
        () => deleteApplication({ variables: { id: existingId } }),
        setError
      )
      if (!result) return
    }

    const templateDetails = await calculateTemplateDetails({
      currentUser,
      template: templateInfo as any,
    })

    const newSerial = await mutate(
      async () =>
        handleCreate({
          create,
          currentUser,
          template: templateDetails,
          isConfig: true,
        }),
      setError
    )

    if (!newSerial) {
      setError({ message: 'problem loading application', error: 'check your permissions' })
      return
    }

    setSerial(newSerial?.data?.createApplication?.application?.serial || '')
  }

  return (
    <>
      {!serial && <Loading />}
      {serial && (
        <ApplicationWrapper
          moveStructure={moveStructure}
          setError={setError}
          templateInfo={templateInfo}
          isEditable={isEditable}
          key={serial}
          serialNumber={serial}
          resetApplication={resetApplication}
        />
      )}
      <Modal open={!!error} onClick={() => setError(null)} onClose={() => setError(null)}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Label size="large" color="red">
            {String(error?.message)}
            <Icon name="close" onClick={() => setError(null)} />
          </Label>
          <div style={{ margin: 20 }}>{String(error?.error)}</div>
        </div>
      </Modal>
    </>
  )
}

const Form: React.FC<{ templateInfo: TemplateInfo }> = ({ templateInfo }) => {
  const [updateTemplateSection] = useUpdateTemplateSectionMutation()
  const [ready, setIsReady] = useState(false)

  const trimPageBreaks = async (pageBreaksToTrim: { [sectionId: number]: number[] }) => {
    const sectionAndElementIds = Object.entries(pageBreaksToTrim)

    if (sectionAndElementIds.length === 0) {
      setIsReady(true)
      return
    }

    for (const [sectionId, elementIds] of sectionAndElementIds) {
      await updateTemplateSection({
        variables: {
          id: Number(sectionId),
          sectionPatch: {
            templateElementsUsingId: {
              deleteById: elementIds.map((id) => ({ id })),
            },
          },
        },
      })
    }

    setIsReady(true)
  }

  useEffect(() => {
    if (templateInfo?.status !== TemplateStatus.Draft) {
      setIsReady(true)
      return
    }

    const pageBreaksToTrim: { [sectionId: number]: number[] } = {}
    const addToPageBreaksToTrim = (secitonId: number, elementIds: number[]) => {
      if (!pageBreaksToTrim[secitonId]) pageBreaksToTrim[secitonId] = []
      pageBreaksToTrim[secitonId] = [...pageBreaksToTrim[secitonId], ...elementIds]
    }
    const templateSection = templateInfo?.templateSections?.nodes || []
    let currentSectionId = 0
    templateSection.forEach((templateSection, index) => {
      currentSectionId = templateSection?.id || 0
      const templateElements = templateSection?.templateElementsBySectionId?.nodes || []

      let consequitivePageBreaks: number[] = []
      templateElements.forEach((templateElement, index) => {
        const isPageBreak = templateElement?.elementTypePluginCode === 'pageBreak'
        const isStartOfSection = index == 0
        const isEndOfSection = index === templateElements.length - 1
        if (isPageBreak) {
          if (isStartOfSection || isEndOfSection)
            addToPageBreaksToTrim(currentSectionId, [templateElement?.id || 0])
          consequitivePageBreaks.push(templateElement?.id || 0)
        } else {
          if (consequitivePageBreaks.length > 1)
            addToPageBreaksToTrim(currentSectionId, consequitivePageBreaks)
          consequitivePageBreaks = []
        }
      })
      if (consequitivePageBreaks.length > 1)
        addToPageBreaksToTrim(currentSectionId, consequitivePageBreaks)
    })

    trimPageBreaks(pageBreaksToTrim)
  }, [templateInfo])

  if (!ready) return <Loading />

  const moveStructure = getMoveStructure(templateInfo)
  console.log(moveStructure)

  return <CreateApplicationWrapper moveStructure={moveStructure} templateInfo={templateInfo} />
}
type Error = { message: string; error: string }
const ApplicationWrapper: React.FC<{
  serialNumber: string
  resetApplication: () => void
  isEditable: boolean
  templateInfo: TemplateInfo
  moveStructure: MoveStructure
  setError: (error: Error) => void
}> = ({ serialNumber, resetApplication, isEditable, setError, templateInfo, moveStructure }) => {
  const {
    userState: { currentUser },
  } = useUserState()

  const { structure } = useLoadApplication({
    serialNumber,
    currentUser: currentUser as User,
    networkFetch: true,
  })

  if (!structure) return <Loading />

  return (
    <Application
      moveStructure={moveStructure}
      isEditable={isEditable}
      templateInfo={templateInfo}
      setError={setError}
      structure={structure}
      resetApplication={resetApplication}
    />
  )
}

type SectionUpdateState = {
  code: string
  title: string
  index: number
  id?: number
}

const PageMove: React.FC<{
  moveStructure: MoveStructure
  sectionCode: string
  setSelectedPageNumber: (pageNumber: number) => void
  templateId: number
  setError: (error: Error) => void
  pageNumber: number
  isEditable: boolean
}> = ({ pageNumber, sectionCode, moveStructure, isEditable, setError, setSelectedPageNumber }) => {
  const [updateSection] = useUpdateTemplateSectionMutation()

  const movePageInSection = async (fromNumber: number, toNumber: number) => {
    const nextPage = moveStructure.sections[sectionCode].pages[fromNumber]
    const currentPage = moveStructure.sections[sectionCode].pages[toNumber]

    const elementsToDown = nextPage.elements
    const elementsToUp = currentPage.elements
    const downOffset = elementsToDown[0].index - elementsToUp[0].index
    const downIndexRange = elementsToDown[elementsToDown.length - 1].index - elementsToDown[0].index
    const upOffset = downIndexRange + 1 + nextPage.startPageBreaks.length

    const pageBreakOffset = downIndexRange + elementsToUp[0].index + 1

    const updates = [
      ...elementsToDown.map(({ id, index }) => ({
        id,
        patch: { index: index - downOffset },
      })),
      ...elementsToUp.map(({ id, index }) => ({ id, patch: { index: index + upOffset } })),
      ...nextPage.startPageBreaks.map(({ id }, index) => ({
        id,
        patch: { index: pageBreakOffset + index },
      })),
    ]

    setSelectedPageNumber(-1)
    await mutate(
      () =>
        updateSection({
          variables: {
            id: moveStructure.sections[sectionCode].id,
            sectionPatch: {
              templateElementsUsingId: {
                updateById: updates,
              },
            },
          },
        }),
      setError
    )
  }

  const moveToSection = async (newSection: MoveSection | null) => {
    if (!newSection) return

    const lastIndex =
      Object.values(newSection.pages)
        .find(({ isLast }) => isLast)
        ?.elements?.find(({ isLastInPage }) => isLastInPage)?.index || 0

    const pageElements = moveStructure.sections[sectionCode].pages[pageNumber].elements
    setSelectedPageNumber(-1)
    const result = await mutate(
      () =>
        updateSection({
          variables: {
            id: moveStructure.sections[sectionCode].id,
            sectionPatch: {
              templateElementsUsingId: {
                updateById: pageElements.map(({ id }, index) => ({
                  patch: {
                    index: lastIndex + 1 + index,
                  },
                  id,
                })),
              },
            },
          },
        }),
      setError
    )

    if (!result) return

    await mutate(
      () =>
        updateSection({
          variables: {
            id: newSection.id,
            sectionPatch: {
              templateElementsUsingId: {
                create: [
                  {
                    code: `pageBreak_${Math.floor(Math.random() * Math.pow(9, 9))}`,
                    index: lastIndex,
                    category: TemplateElementCategory.Information,
                    elementTypePluginCode: 'pageBreak',
                    title: 'Page Break',
                  },
                ],
                connectById: pageElements.map(({ id }) => ({
                  id,
                })),
              },
            },
          },
        }),
      setError
    )
  }

  if (!moveStructure?.sections[sectionCode]?.pages[pageNumber]) return null

  return (
    <>
      {!moveStructure.sections[sectionCode].isFirst && (
        <Icon
          name="angle double down"
          onClick={async () => {
            if (!isEditable) return

            moveToSection(moveStructure.sections[sectionCode].previousSection)
          }}
        />
      )}
      {!moveStructure.sections[sectionCode].isLast && (
        <Icon
          name="angle double up"
          onClick={async () => {
            if (!isEditable) return

            moveToSection(moveStructure.sections[sectionCode].nextSection)
          }}
        />
      )}
      {!moveStructure.sections[sectionCode].pages[pageNumber].isFirst && (
        <Icon
          name="angle down"
          onClick={async () => {
            if (!isEditable) return

            movePageInSection(pageNumber, pageNumber - 1)
          }}
        />
      )}
      {!moveStructure.sections[sectionCode].pages[pageNumber].isLast && (
        <Icon
          name="angle up"
          onClick={async () => {
            if (!isEditable) return

            movePageInSection(pageNumber + 1, pageNumber)
          }}
        />
      )}
    </>
  )
}

const ElementMove: React.FC<{
  moveStructure: MoveStructure
  elementId: number

  templateId: number
  setError: (error: Error) => void
  pageNumber: number
  isEditable: boolean
}> = ({ elementId, moveStructure, isEditable, setError }) => {
  const [updateSection] = useUpdateTemplateSectionMutation()

  const swapElement = async (nextElement: MoveElement | null) => {
    const thisElement = moveStructure.elements[elementId]
    if (!nextElement) return
    if (!thisElement) return

    await mutate(
      () =>
        updateSection({
          variables: {
            id: moveStructure.elements[elementId].section.id,
            sectionPatch: {
              templateElementsUsingId: {
                updateById: [
                  { id: nextElement.id, patch: { index: thisElement.index } },
                  { id: thisElement.id, patch: { index: nextElement.index } },
                ],
              },
            },
          },
        }),
      setError
    )
  }

  const moveToSection = async (section: MoveSection | null) => {
    if (!section) return
    const currentElement = moveStructure.elements[elementId]
    const lastIndex =
      Object.values(section.pages)
        .find(({ isLast }) => isLast)
        ?.elements?.find(({ isLastInPage }) => isLastInPage)?.index || 0

    const result = await mutate(
      () =>
        updateSection({
          variables: {
            id: moveStructure.elements[elementId].section.id,
            sectionPatch: {
              templateElementsUsingId: {
                updateById: [{ id: currentElement.id, patch: { index: lastIndex + 1 } }],
              },
            },
          },
        }),
      setError
    )

    if (!result) return

    await mutate(
      () =>
        updateSection({
          variables: {
            id: section.id,
            sectionPatch: {
              templateElementsUsingId: {
                connectById: [{ id: currentElement.id }],
              },
            },
          },
        }),
      setError
    )
    if (moveStructure.elements[elementId].page.isLast) {
    }
  }

  if (!moveStructure?.elements[elementId]?.section) return null

  return (
    <>
      {(!moveStructure.elements[elementId].section.isLast ||
        !moveStructure.elements[elementId].page.isLast) && (
        <Icon
          name="angle double down"
          onClick={async () => {
            if (!isEditable) return

            console.log(moveStructure.elements[elementId].page)
            if (moveStructure.elements[elementId].page.isLast) {
              moveToSection(moveStructure.elements[elementId].section.nextSection)
            } else {
              const thisPageNumber = moveStructure.elements[elementId].page.pageNumber
              const nextPage = moveStructure.elements[elementId].section.pages[thisPageNumber + 1]
              const pageBreak = nextPage.startPageBreaks[0]
              const pageBreakIndex = pageBreak.index

              const currentElement = moveStructure.elements[elementId]
              const currentIndex = currentElement.index
              const elementsBetweenPageBreak = moveStructure.elements[
                elementId
              ].section.elements.filter(
                ({ index }) => index < pageBreakIndex && index > currentIndex
              )

              await mutate(
                () =>
                  updateSection({
                    variables: {
                      id: moveStructure.elements[elementId].section.id,
                      sectionPatch: {
                        templateElementsUsingId: {
                          updateById: [
                            { id: currentElement.id, patch: { index: pageBreakIndex } },
                            { id: pageBreak.id, patch: { index: pageBreakIndex - 1 } },
                            ...elementsBetweenPageBreak.map(({ id, index }) => ({
                              id,
                              patch: { index: index - 1 },
                            })),
                          ],
                        },
                      },
                    },
                  }),
                setError
              )
            }
          }}
        />
      )}
      {(!moveStructure.elements[elementId].section.isFirst ||
        !moveStructure.elements[elementId].page.isFirst) && (
        <Icon
          name="angle double up"
          onClick={async () => {
            if (!isEditable) return

            if (moveStructure.elements[elementId].page.isFirst) {
              moveToSection(moveStructure.elements[elementId].section.previousSection)
            } else {
              const thisPageNumber = moveStructure.elements[elementId].page.pageNumber
              const previousPage =
                moveStructure.elements[elementId].section.pages[thisPageNumber - 1]
              const pageBreak = previousPage.endPageBreaks[0]
              const pageBreakIndex = pageBreak.index

              const currentElement = moveStructure.elements[elementId]
              const currentIndex = currentElement.index
              const elementsBetweenPageBreak = moveStructure.elements[
                elementId
              ].section.elements.filter(
                ({ index }) => index > pageBreakIndex && index < currentIndex
              )

              await mutate(
                () =>
                  updateSection({
                    variables: {
                      id: moveStructure.elements[elementId].section.id,
                      sectionPatch: {
                        templateElementsUsingId: {
                          updateById: [
                            { id: currentElement.id, patch: { index: pageBreakIndex } },
                            { id: pageBreak.id, patch: { index: pageBreakIndex + 1 } },
                            ...elementsBetweenPageBreak.map(({ id, index }) => ({
                              id,
                              patch: { index: index + 1 },
                            })),
                          ],
                        },
                      },
                    },
                  }),
                setError
              )
            }
          }}
        />
      )}
      {!moveStructure.elements[elementId].isFirstInPage && (
        <Icon
          name="angle up"
          onClick={async () => {
            if (!isEditable) return

            swapElement(moveStructure.elements[elementId].previousElement)
          }}
        />
      )}
      {!moveStructure.elements[elementId].isLastInPage && (
        <Icon
          name="angle down"
          onClick={
            async () => {
              if (!isEditable) return

              swapElement(moveStructure.elements[elementId].nextElement)
            }
            // movePageInSection(pageNumber + 1, pageNumber)
          }
        />
      )}
    </>
  )
}

const SectionEdit: React.FC<{
  section?: SectionUpdateState
  templateId: number
  templateInfo: TemplateInfo
  setError: (error: Error) => void
  isEditable: boolean
  setSelectedSectionCode: (sectionCode: string) => void
  fullStructure: FullStructure
}> = ({
  section,
  templateId,
  setError,
  isEditable,
  fullStructure,
  templateInfo,
  setSelectedSectionCode,
}) => {
  const [updateTemplate] = useUpdateTemplateMutation()
  const [updateState, setUpdateState] = useState<SectionUpdateState>({
    code: section?.code || '',
    index: section?.index || 0,
    title: section?.title || '',
    id: section?.id,
  })
  const [updateApplication] = useRestartApplicationMutation()
  const [updateTemplateSection] = useUpdateTemplateSectionMutation()

  const sections = templateInfo?.templateSections?.nodes || []
  const thisSection = sections.find((templateSection) => templateSection?.id === section?.id)

  const thisSectionIndex = thisSection?.index || 0
  const indexRange = (templateInfo?.templateSections?.nodes || []).reduce(
    ({ first, last, firstAbove, firstBelow }, section) => {
      const index = section?.index || 0
      return {
        first: index < first ? index : first,
        last: index > last ? index : last,
        firstAbove:
          firstAbove === null ||
          (thisSectionIndex < index && index - thisSectionIndex < firstAbove - thisSectionIndex)
            ? index
            : firstAbove,
        firstBelow:
          firstBelow === null ||
          (thisSectionIndex > index && thisSectionIndex - index < thisSectionIndex - firstBelow)
            ? index
            : firstBelow,
      }
    },
    { first: 0, firstBelow: 0, last: 0, firstAbove: 0 }
  )

  return (
    <Popup
      content="Template form only editable on draft templates"
      key="notDraftEdit"
      disabled={isEditable}
      trigger={
        <div className="section-edit">
          {thisSectionIndex != indexRange.first && (
            <Icon
              name="angle down"
              onClick={async () => {
                if (!isEditable) return

                const currentUpdateById = {
                  patch: { index: indexRange.firstBelow || 0 },
                  id: section?.id || 0,
                }
                const firstBelowUpdateById = sections
                  .filter((section) => section?.index === indexRange.firstBelow)
                  .map((section) => ({
                    patch: { index: thisSectionIndex || 0 },
                    id: section?.id || 0,
                  }))

                await mutate(
                  () =>
                    updateTemplate({
                      variables: {
                        id: templateId,
                        templatePatch: {
                          templateSectionsUsingId: {
                            updateById: [currentUpdateById, ...firstBelowUpdateById],
                          },
                        },
                      },
                    }),
                  setError
                )
              }}
            />
          )}
          {thisSectionIndex != indexRange.last && (
            <Icon
              name="angle up"
              onClick={async () => {
                if (!isEditable) return

                const currentUpdateById = {
                  patch: { index: indexRange.firstAbove || 0 },
                  id: section?.id || 0,
                }
                const firstAboveUpdateById = sections
                  .filter((section) => section?.index === indexRange.firstAbove)
                  .map((section) => ({
                    patch: { index: thisSectionIndex || 0 },
                    id: section?.id || 0,
                  }))

                await mutate(
                  () =>
                    updateTemplate({
                      variables: {
                        id: templateId,
                        templatePatch: {
                          templateSectionsUsingId: {
                            updateById: [currentUpdateById, ...firstAboveUpdateById],
                          },
                        },
                      },
                    }),
                  setError
                )
              }}
            />
          )}
          <OnBlurInput
            key="sectionCode"
            initialValue={updateState.code}
            label="Code"
            disabled={!isEditable}
            update={(value: string) => setUpdateState({ ...updateState, code: value })}
          />
          <OnBlurInput
            key="sectionTitle"
            initialValue={updateState.title}
            label="Title"
            disabled={!isEditable}
            update={(value: string) => setUpdateState({ ...updateState, title: value })}
          />

          <Icon
            name="edit"
            onClick={async () => {
              if (!isEditable) return

              await mutate(
                () =>
                  updateTemplate({
                    variables: {
                      id: templateId,
                      templatePatch: {
                        templateSectionsUsingId: {
                          updateById: [{ patch: updateState, id: updateState.id || 0 }],
                        },
                      },
                    },
                  }),
                setError
              )
            }}
          />

          <Icon
            name="delete"
            onClick={async () => {
              if (!isEditable) return

              const applicationResponseIds = Object.values(
                fullStructure.sections[section?.code || ''].pages
              )
                .map((page) => page.state)
                .flat()
                .filter((pageElement) => !!pageElement?.latestApplicationResponse?.id)
                .map((pageElement) => pageElement.latestApplicationResponse.id)

              console.log(applicationResponseIds)
              const elementsInSection = thisSection?.templateElementsBySectionId?.nodes || []

              if (applicationResponseIds.length > 0) {
                const result = await mutate(
                  () =>
                    updateApplication({
                      variables: {
                        serial: fullStructure.info.serial,
                        applicationPatch: {
                          applicationResponsesUsingId: {
                            deleteById: applicationResponseIds.map((id) => ({ id })),
                          },
                        },
                      },
                    }),
                  setError
                )

                if (!result) return
              }

              if (elementsInSection.length > 0) {
                const result = await mutate(
                  () =>
                    updateTemplateSection({
                      variables: {
                        id: section?.id || 0,
                        sectionPatch: {
                          templateElementsUsingId: {
                            deleteById: elementsInSection.map((element) => ({
                              id: element?.id || 0,
                            })),
                          },
                        },
                      },
                    }),
                  setError
                )

                if (!result) return
              }

              const result = await mutate(
                () =>
                  updateTemplate({
                    variables: {
                      id: templateId,
                      templatePatch: {
                        templateSectionsUsingId: {
                          deleteById: [{ id: section?.id || 0 }],
                        },
                      },
                    },
                  }),
                setError
              )

              if (!result) return

              setSelectedSectionCode('')
            }}
          />
        </div>
      }
    />
  )
}

type Mutate = (doMutation: () => Promise<any>, setError: (error: Error) => void) => Promise<any>

const mutate: Mutate = async (doMutation, setError) => {
  try {
    const result = await doMutation()
    if (result?.errors) {
      setError({
        message: 'error',
        error: JSON.stringify(result.errors),
      })
      return null
    }
    return result
  } catch (e) {
    setError({ message: 'error', error: e })
    return null
  }
}

type ElementUpdateState = {
  code: string
  index: number
  title: string
  category: TemplateElementCategory
  elementTypePluginCode: string
  visibilityCondition: EvaluatorNode
  isRequired: EvaluatorNode
  isEditable: EvaluatorNode
  validation: EvaluatorNode
  validationMessage: string
  helpText: string
  parameters: object
  defaultValue: EvaluatorNode
  id: number
}

const Application: React.FC<{
  structure: FullStructure
  resetApplication: () => void
  isEditable: boolean
  setError: (error: Error) => void
  templateInfo: TemplateInfo
  moveStructure: MoveStructure
}> = ({ structure, resetApplication, isEditable, setError, templateInfo, moveStructure }) => {
  const { fullStructure } = useGetApplicationStructure({
    structure,
    shouldRevalidate: false,
    minRefetchTimestampForRevalidation: 0,
    forceRun: true,
  })

  const [selectedSectionCode, setSelectedSectionCode] = useState('')
  const [selectedPageNumber, setSelectedPageNumber] = useState(-1)
  const [elementTemplateState, setElementTemplateState] = useState<{
    isSearching: boolean
    pluginCode: string
    options: {
      text: string
      key: number
      value?: number
      valueFull?: {
        category: TemplateElementCategory
        helpText: string
        parameters: object
        defaultValue: EvaluatorNode
        visibilityCondition: EvaluatorNode
        validationMessage: string
        isRequired: EvaluatorNode
        isEditable: EvaluatorNode
        validation: EvaluatorNode
      }
    }[]
  }>({
    isSearching: false,
    pluginCode: '',
    options: [],
  })

  const [updateState, setUpdateState] = useState<ElementUpdateState | null>(null)
  const [updateTemplateElement] = useUpdateTemplateElementMutation()
  const [createSection] = useCreateSectionMutation()
  const [updateApplication] = useRestartApplicationMutation()
  const [updateTemplateSection] = useUpdateTemplateSectionMutation()

  const { data: elementSearchData } = useGetTemplateElementsByPluginQuery({
    skip: !elementTemplateState.isSearching,
    variables: { pluginCode: elementTemplateState.pluginCode },
  })

  useEffect(() => {
    const newState = { isSearching: false }
    console.log(elementSearchData, elementTemplateState)
    if (
      elementTemplateState.isSearching &&
      (!elementSearchData?.templateElements?.nodes ||
        elementSearchData.templateElements?.nodes.length === 0)
    )
      return setElementTemplateState({
        ...elementTemplateState,
        ...newState,
        options: [{ text: 'No existing matching template elements found', key: -2 }],
      })

    if (!elementSearchData?.templateElements?.nodes) return

    const newOptions = elementSearchData.templateElements?.nodes.map((templateElement) => ({
      text: `${templateElement?.templateCode} - ${templateElement?.code} - ${templateElement?.title}`,
      key: templateElement?.id || 0,
      value: templateElement?.id || 0,
      valueFull: {
        category: templateElement?.category as TemplateElementCategory,
        helpText: templateElement?.helpText || '',
        parameters: templateElement?.parameters || {},
        defaultValue: templateElement?.defaultValue || '',
        visibilityCondition: templateElement?.visibilityCondition || true,
        validationMessage: templateElement?.validationMessage || '',
        isRequired: templateElement?.isRequired || false,
        isEditable: templateElement?.isEditable || true,
        validation: templateElement?.validation || true,
      },
    }))

    setElementTemplateState({
      ...elementTemplateState,
      ...newState,
      options: newOptions,
    })
  }, [elementSearchData])

  useEffect(() => {
    if (selectedPageNumber - 1) return
    if (!fullStructure?.sections[selectedSectionCode]?.pages[selectedPageNumber]) {
      setSelectedPageNumber(-1)
    }
  }, [selectedPageNumber, fullStructure])

  const templateId = fullStructure?.info.template.id || 0
  const selectedSection = fullStructure?.sections[selectedSectionCode]
  const sections = templateInfo?.templateSections?.nodes || []
  const thisSection = sections.find(
    (templateSection) => templateSection?.code === selectedSectionCode
  )

  const createNewSection = async () => {
    if (!isEditable) return
    let lastIndex = Object.values(fullStructure?.sections || []).reduce(
      (lastIndex, { details }) => (lastIndex > details.index ? lastIndex : details.index),
      0
    )
    await mutate(
      () =>
        createSection({
          variables: {
            templateId: templateId,
            index: lastIndex + 1,
            code: `newSection_${Math.floor(Math.random() * Math.pow(9, 9))}`,
          },
        }),
      setError
    )
  }

  const deletePage = async () => {
    if (!isEditable) return

    const elementsInPage =
      fullStructure?.sections[selectedSectionCode || ''].pages[selectedPageNumber]?.state || []

    const applicationResponseIds = elementsInPage
      .filter((pageElement) => !!pageElement?.latestApplicationResponse?.id)
      .map((pageElement) => pageElement.latestApplicationResponse.id)

    if (applicationResponseIds.length > 0) {
      const result = await mutate(
        () =>
          updateApplication({
            variables: {
              serial: fullStructure?.info?.serial || '',
              applicationPatch: {
                applicationResponsesUsingId: {
                  deleteById: applicationResponseIds.map((id) => ({ id })),
                },
              },
            },
          }),
        setError
      )

      if (!result) return
    }

    if (elementsInPage.length > 0) {
      const lastElementIndex = elementsInPage[elementsInPage.length - 1]?.element.elementIndex
      let pageBreakId = 0
      let stopSearch = false
      ;(thisSection?.templateElementsBySectionId?.nodes || []).forEach((element) => {
        if (stopSearch) return
        if ((element?.index || 0) > lastElementIndex) {
          stopSearch = true
          if (element?.elementTypePluginCode === 'pageBreak') pageBreakId = element?.id || 0
        }
      })

      const result = await mutate(
        () =>
          updateTemplateSection({
            variables: {
              id: thisSection?.id || 0,
              sectionPatch: {
                templateElementsUsingId: {
                  deleteById: [
                    ...elementsInPage.map((element) => ({
                      id: element?.element.id || 0,
                    })),
                    { id: pageBreakId },
                  ],
                },
              },
            },
          }),
        setError
      )
      if (!result) return
    }

    setSelectedPageNumber(-1)
  }

  const createNewPage = async () => {
    if (!isEditable) return

    const elementsInSection = thisSection?.templateElementsBySectionId?.nodes || []
    const newPageIndex = (elementsInSection[elementsInSection.length - 1]?.index || 0) + 1

    await mutate(
      () =>
        updateTemplateSection({
          variables: {
            id: selectedSection?.details.id || 0,
            sectionPatch: {
              templateElementsUsingId: {
                create: [
                  {
                    code: `pageBreak_${Math.floor(Math.random() * Math.pow(9, 9))}`,
                    index: newPageIndex,
                    category: TemplateElementCategory.Information,
                    elementTypePluginCode: 'pageBreak',
                    title: 'Page Break',
                  },
                  {
                    code: `placeholderElement_${Math.floor(Math.random() * Math.pow(9, 9))}`,
                    index: newPageIndex + 1,
                    category: TemplateElementCategory.Information,
                    parameters: {
                      title:
                        'Placeholder Element (page must contain at least one element to exist)',
                    },
                    elementTypePluginCode: 'textInfo',
                    title: 'Page Break',
                  },
                ],
              },
            },
          },
        }),
      setError
    )
  }

  if (!fullStructure || !fullStructure.responsesByCode) return <Loading />

  return (
    <>
      <Popup
        content="Template form only editable on draft templates"
        key="not draft"
        disabled={isEditable}
        trigger={
          <div key="sections" className="template-sections-header" onClick={createNewSection}>
            <Header as="h3">Sections</Header> <Icon name="add" />
            <div className="button-container">
              <Button inverted primary onClick={resetApplication}>
                Reset Application
              </Button>
            </div>
          </div>
        }
      />
      <div key="section" className="template-sections">
        {Object.values(fullStructure?.sections || []).map((section) => (
          <Label
            key={section.details.id}
            onClick={() => {
              setSelectedSectionCode(section.details.code)
              setSelectedPageNumber(-1)
            }}
            className={`${section.details.code === selectedSectionCode ? 'selected' : ''}`}
          >
            {section.details.title}
          </Label>
        ))}
      </div>

      {!!selectedSectionCode && (
        <SectionEdit
          setSelectedSectionCode={setSelectedSectionCode}
          templateInfo={templateInfo}
          setError={setError}
          fullStructure={fullStructure}
          isEditable={isEditable}
          key={selectedSectionCode}
          templateId={templateId}
          section={selectedSection?.details as SectionUpdateState}
        />
      )}

      {!!selectedSectionCode && (
        <>
          <Popup
            content="Template form only editable on draft templates"
            key="notDraftEdit"
            disabled={isEditable}
            trigger={
              <div key="pages" className="template-pages-header" onClick={createNewPage}>
                <Header as="h3">Pages</Header> <Icon name="add" />
              </div>
            }
          />
          <div key="page" className="template-pages">
            {Object.entries(selectedSection?.pages || []).map(([index, page]) => (
              <Label
                key={index}
                onClick={() => {
                  setSelectedPageNumber(Number(index))
                }}
                className={`${Number(index) === selectedPageNumber ? 'selected' : ''}`}
              >
                {`Page ${index}`}
              </Label>
            ))}
          </div>
        </>
      )}

      {selectedPageNumber !== -1 && (
        <>
          <Popup
            content="Template form only editable on draft templates"
            key="notDraftEdit"
            disabled={isEditable}
            trigger={
              <div className="template-page-edit">
                <PageMove
                  isEditable={isEditable}
                  setError={setError}
                  setSelectedPageNumber={setSelectedPageNumber}
                  moveStructure={moveStructure}
                  templateId={templateId}
                  sectionCode={selectedSectionCode}
                  pageNumber={selectedPageNumber}
                />
                <Header as="h5">{`Page ${selectedPageNumber}`}</Header>
                <Icon name="delete" onClick={deletePage} />
              </div>
            }
          />
          <div className="config-wrapper">
            <PageElements
              canEdit={true}
              renderConfigElement={(element: ElementState) => (
                <Popup
                  content="Template form only editable on draft templates"
                  key="not draft"
                  disabled={isEditable}
                  trigger={
                    <div className="config-container" style={{ margin: 5 }}>
                      <ElementMove
                        elementId={element.id}
                        isEditable={isEditable}
                        setError={setError}
                        moveStructure={moveStructure}
                        templateId={templateId}
                        pageNumber={selectedPageNumber}
                      />
                      <Icon
                        size="large"
                        className="template-elment-settings"
                        name="setting"
                        onClick={() =>
                          setUpdateState({
                            code: element.code,
                            index: element.elementIndex,
                            title: element.title,
                            category: element.category,
                            elementTypePluginCode: element.pluginCode,
                            visibilityCondition: element.isVisibleExpression,
                            isRequired: element.isRequiredExpression,
                            isEditable: element.isEditableExpression,
                            validation: element.validationExpression,
                            helpText: element.helpText || '',
                            validationMessage: element.validationMessage || '',
                            parameters: element.parameters,
                            defaultValue: element.defaultValueExpression,
                            id: element.id,
                          })
                        }
                      />
                      {!element.isVisible && (
                        <Popup
                          content="Visibility criteria did not match"
                          key="not draft"
                          trigger={<Icon name="eye slash" />}
                        />
                      )}
                    </div>
                  }
                />
              )}
              elements={getCurrentPageElements(
                fullStructure,
                selectedSectionCode,
                selectedPageNumber
              )}
              responsesByCode={fullStructure.responsesByCode}
              applicationData={fullStructure.info}
            />
            <Button
              inverted
              primary
              onClick={() => {
                const thisPage =
                  moveStructure.sections[selectedSectionCode].pages[selectedPageNumber] || []
                const thisPageElements = thisPage.elements
                const lastElementIndex = thisPageElements[thisPageElements.length - 1]?.index || 0
                const elementsAfterLastIndex = [
                  ...thisPage.endPageBreaks,
                  ...moveStructure.sections[selectedSectionCode].elements,
                ].filter(({ index }) => index > lastElementIndex)

                mutate(
                  () =>
                    updateTemplateSection({
                      variables: {
                        id: selectedSection?.details.id || 0,
                        sectionPatch: {
                          templateElementsUsingId: {
                            updateById: elementsAfterLastIndex.map(({ id, index }) => ({
                              id,
                              patch: { index: index + 1 },
                            })),
                            create: [
                              {
                                ...newElement,
                                code: `newElementCode_${Math.floor(
                                  Math.random() * Math.pow(9, 9)
                                )}`,
                                index: lastElementIndex + 1,
                                applicationResponsesUsingId: {
                                  create: [{ applicationId: fullStructure.info.id }],
                                },
                              },
                            ],
                          },
                        },
                      },
                    }),
                  setError
                )
              }}
            >
              New Element
            </Button>
          </div>
        </>
      )}

      <Modal
        className="element-edit-modal"
        open={!!updateState}
        onClose={() => setUpdateState(null)}
      >
        {updateState && (
          <div className="element-update-container">
            <Label attached="top right">
              <a
                href="https://github.com/openmsupply/application-manager-web-app/wiki/Element-Type-Specs"
                target="_blank"
              >
                <Icon name="info circle" size="big" color="blue" />
              </a>
            </Label>
            <div key="elementPlugin" className="element-dropdown-container">
              <Label content="Type" />
              <Dropdown
                value={updateState.elementTypePluginCode}
                selection
                options={Object.values(pluginProvider.pluginManifest).map(
                  ({ code, displayName }) => ({
                    key: code,
                    value: code,
                    text: displayName,
                  })
                )}
                onChange={(_, { value }) =>
                  setUpdateState({ ...updateState, elementTypePluginCode: String(value) })
                }
              />
              <Dropdown
                style={{ margin: 4 }}
                text="From Existing"
                search
                selection
                icon="search"
                onClick={() => {
                  setElementTemplateState({
                    isSearching: true,
                    pluginCode: updateState.elementTypePluginCode,
                    options: [{ text: 'Loading', key: -1 }],
                  })
                }}
                options={elementTemplateState.options}
                onChange={(_, { value }) => {
                  const selected = elementTemplateState.options.find(
                    (option) => option?.value === value
                  )

                  if (selected?.valueFull) setUpdateState({ ...updateState, ...selected.valueFull })
                }}
              />
              <div key="elementCategory" className="element-dropdown-container">
                <Label content="Category" />
                <Dropdown
                  value={updateState.category}
                  selection
                  fluid
                  options={[
                    {
                      key: 'Information',
                      value: TemplateElementCategory.Information,
                      text: 'Information',
                    },
                    { key: 'Question', value: TemplateElementCategory.Question, text: 'Question' },
                  ]}
                  onChange={(_, { value }) =>
                    setUpdateState({ ...updateState, category: value as TemplateElementCategory })
                  }
                />
              </div>
              <div className="element-code-edit">
                <OnBlurInput
                  key="elementCode"
                  initialValue={updateState.code}
                  isPropUpdated={true}
                  label="Code"
                  update={(value: string) => setUpdateState({ ...updateState, code: value })}
                />
              </div>
              <OnBlurInput
                key="elementTitle"
                isPropUpdated={true}
                initialValue={updateState.title}
                label="Title"
                update={(value: string) => setUpdateState({ ...updateState, title: value })}
              />
            </div>
            <div className="element-edit-text-input">
              <OnBlurInput
                key="elementValidationMessage"
                isPropUpdated={true}
                initialValue={updateState.validationMessage}
                label="Validation Message"
                textAreaRows={3}
                isTextArea={true}
                update={(value: string) =>
                  setUpdateState({ ...updateState, validationMessage: value })
                }
              />
              <OnBlurInput
                key="elementHelpText"
                isPropUpdated={true}
                initialValue={updateState.helpText}
                label="Help Text"
                isTextArea={true}
                textAreaRows={3}
                update={(value: string) => setUpdateState({ ...updateState, helpText: value })}
              />
            </div>
            <EvaluationContainer
              key="elementIsEditable"
              label="isEditable"
              currentElementCode={updateState.code}
              fullStructure={fullStructure}
              evaluation={asObject(updateState.isEditable)}
              setEvaluation={(value: object) =>
                setUpdateState({ ...updateState, isEditable: value })
              }
            />

            <EvaluationContainer
              key="elementIsRequired"
              label="Is Required"
              currentElementCode={updateState.code}
              fullStructure={fullStructure}
              evaluation={asObject(updateState.isRequired)}
              setEvaluation={(value: object) =>
                setUpdateState({ ...updateState, isRequired: value })
              }
            />
            <EvaluationContainer
              key="elementIsValid"
              label="Is Valid"
              currentElementCode={updateState.code}
              fullStructure={fullStructure}
              evaluation={asObject(updateState.validation)}
              setEvaluation={(value: object) =>
                setUpdateState({ ...updateState, validation: value })
              }
            />

            <EvaluationContainer
              key="elementVisibility"
              label="Is Visible"
              currentElementCode={updateState.code}
              fullStructure={fullStructure}
              evaluation={asObject(updateState.visibilityCondition)}
              setEvaluation={(value: object) =>
                setUpdateState({ ...updateState, visibilityCondition: value })
              }
            />
            <EvaluationContainer
              key="defaultValue"
              label="Default Value"
              currentElementCode={updateState.code}
              fullStructure={fullStructure}
              evaluation={asObject(updateState.defaultValue)}
              setEvaluation={(value: object) =>
                setUpdateState({ ...updateState, defaultValue: value })
              }
            />
            <Parameters
              key="parametersElement"
              currentElementCode={updateState.code}
              fullStructure={fullStructure}
              parameters={asObject(updateState.parameters)}
              setParameters={(value: object) =>
                setUpdateState({ ...updateState, parameters: value })
              }
            />

            <div className="button-container">
              <Button
                inverted
                disabled={!isEditable}
                primary
                onClick={async () => {
                  const result = await mutate(
                    () =>
                      updateTemplateElement({
                        variables: { id: updateState.id, templateElementPatch: updateState },
                      }),
                    setError
                  )
                  if (result) setUpdateState(null)
                }}
              >
                Save
              </Button>
              <Button
                disabled={!isEditable}
                inverted
                primary
                onClick={async () => {
                  const applicationResponseId =
                    fullStructure?.elementsById?.[updateState.id || 0]?.latestApplicationResponse
                      ?.id || 0
                  if (applicationResponseId) {
                    const result = await mutate(
                      () =>
                        updateApplication({
                          variables: {
                            serial: fullStructure.info.serial,
                            applicationPatch: {
                              applicationResponsesUsingId: {
                                deleteById: [{ id: applicationResponseId }],
                              },
                            },
                          },
                        }),
                      setError
                    )

                    if (!result) return
                  }

                  const result = await mutate(
                    () =>
                      updateTemplateSection({
                        variables: {
                          id: thisSection?.id || 0,
                          sectionPatch: {
                            templateElementsUsingId: {
                              deleteById: [{ id: updateState.id || 0 }],
                            },
                          },
                        },
                      }),
                    setError
                  )

                  if (!result) return
                  setUpdateState(null)
                }}
              >
                Remove
              </Button>
              <Button inverted primary onClick={() => setUpdateState(null)}>
                Cancel
              </Button>
            </div>
            {!isEditable && (
              <Label color="red">Template form only editable on draft templates</Label>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}

const Parameters: React.FC<{
  parameters: any
  currentElementCode: string
  setParameters: (evaluation: object) => void
  fullStructure: FullStructure
}> = ({ parameters, setParameters, currentElementCode, fullStructure }) => {
  const [asGui, setAsGui] = useState(true)
  const [isActive, setIsActive] = useState(false)

  return (
    <Accordion style={{ borderRadius: 7, border: '2px solid black', padding: 5, margin: 5 }}>
      <Accordion.Title
        className="evaluation-container-title"
        style={{ justifyContent: 'center', alignItems: 'center' }}
        active={isActive}
        onClick={() => setIsActive(!isActive)}
      >
        <Header as="h3" style={{ margin: 0 }}>
          {`Parameters (${parameters ? Object.values(parameters).length : 0})`}
        </Header>
        <Icon size="large" style={{ margin: 0 }} name={isActive ? 'angle up' : 'angle down'} />
      </Accordion.Title>
      <Accordion.Content active={isActive}>
        <div className="flex-column" style={{ alignItems: 'center' }}>
          <div className="flex-row">
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 7,
                padding: 3,
                margin: 3,
                background: '#E8E8E8',
              }}
            >
              <Label style={{ whiteSpace: 'nowrap', margin: 3, marginRight: 2 }}>Show As GUI</Label>

              <Checkbox
                checked={asGui}
                toggle
                size="small"
                onChange={() => {
                  setAsGui(!asGui)
                }}
              />
            </div>
            {asGui && (
              <Button
                primary
                inverted
                onClick={() => {
                  setParameters({ ...parameters, newParameters: null })
                }}
              >
                Add Parameter
              </Button>
            )}
          </div>
          {!asGui && (
            <JsonTextBox
              key="elementParameters"
              isPropUpdated={true}
              initialValue={parameters}
              label=""
              update={(value: object) => setParameters(value)}
            />
          )}

          {asGui &&
            Object.entries(parameters)
              .sort(([key1], [key2]) => (key1 > key2 ? -1 : key1 === key2 ? 0 : 1))
              .map(([key, value]) => (
                <EvaluationContainer
                  setEvaluation={(value: any) =>
                    setParameters({ ...parameters, [key]: value?.value || value })
                  }
                  updateKey={(newKey) => {
                    const newParameters = { ...parameters }
                    delete newParameters[key]
                    setParameters({ ...newParameters, [newKey]: value })
                  }}
                  deleteKey={() => {
                    const newParameters = { ...parameters }
                    delete newParameters[key]
                    setParameters(newParameters)
                  }}
                  key={key}
                  evaluation={value}
                  currentElementCode={currentElementCode}
                  fullStructure={fullStructure}
                  label={key}
                />
              ))}
        </div>
      </Accordion.Content>
    </Accordion>
  )
}

const EvaluationContainer: React.FC<{
  evaluation: any
  currentElementCode: string
  setEvaluation: (evaluation: object) => void
  fullStructure: FullStructure
  label: string
  updateKey?: (key: string) => void
  deleteKey?: () => void
}> = ({
  evaluation,
  setEvaluation,
  label,
  currentElementCode,
  fullStructure,
  updateKey,
  deleteKey,
}) => {
  const {
    userState: { currentUser },
  } = useUserState()
  const [isActive, setIsActive] = useState(false)
  const [asGui, setAsGui] = useState(true)
  const objects = {
    responses: {
      ...fullStructure.responsesByCode,
      thisResponse: fullStructure.responsesByCode?.[currentElementCode]?.text,
    },
    currentUser,
    applicationData: fullStructure.info,
  }

  const typedEvaluation = getTypedEvaluation(evaluation)

  return (
    <Accordion style={{ borderRadius: 7, border: '1px solid black', padding: 5, margin: 5 }}>
      <Accordion.Title
        className="evaluation-container-title"
        style={{ justifyContent: 'center' }}
        active={isActive}
      >
        {!updateKey && <Label>{label}</Label>}
        {deleteKey && <Icon className="clickable" onClick={deleteKey} />}
        {updateKey &&
          semanticComponentLibrary.TextInput({
            text: label,
            setText: updateKey,
            title: 'Parameter Name',
          })}
        <div className="indicators-container as-row">
          <div key="type" className="indicator">
            <Label className="key" content="type" />
            <Label className="value" content={typedEvaluation.type} />
          </div>
          {typedEvaluation.type === 'operator' && (
            <div key="operator" className="indicator">
              <Label className="key" content="operator" />
              <Label className="value" content={typedEvaluation.asOperator.operator} />
            </div>
          )}

          {typedEvaluation.type !== 'operator' && (
            <div key="value" className="indicator">
              <Label className="key" content="value" />
              <Label
                className="value"
                content={truncate(String(evaluation?.value), { length: 200 })}
              />
            </div>
          )}
        </div>
        <Icon
          size="large"
          name={isActive ? 'angle up' : 'angle down'}
          onClick={() => setIsActive(!isActive)}
        />
      </Accordion.Title>
      <Accordion.Content active={isActive}>
        {isActive && (
          <div
            className="flex-row"
            style={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 7,
                  padding: 3,
                  margin: 3,
                  background: '#E8E8E8',
                }}
              >
                <Label style={{ whiteSpace: 'nowrap', margin: 3, marginRight: 2 }}>
                  Show As GUI
                </Label>

                <Checkbox
                  checked={asGui}
                  toggle
                  size="small"
                  onChange={() => {
                    setAsGui(!asGui)
                  }}
                />
              </div>
              {!asGui && (
                <JsonTextBox
                  key="elementParameters"
                  isPropUpdated={true}
                  initialValue={evaluation}
                  label="Plugin Parameters"
                  update={(value: object) => setEvaluation(value)}
                />
              )}
              {asGui &&
                parseAndRenderEvaluation(
                  evaluation,
                  (evaltionAsString: string) => setEvaluation(asObjectOrValue(evaltionAsString)),
                  semanticComponentLibrary,
                  {
                    objects,

                    APIfetch: fetch,
                    graphQLConnection: {
                      fetch: fetch.bind(window),
                      endpoint: config.serverGraphQL,
                    },
                  }
                )}
            </div>
            <div
              style={{
                marginLeft: 10,
                borderRadius: 7,
                border: '2px solid #E8E8E8',
                overflow: 'auto',
                maxHeight: '600px',
                minHeight: 200,
                maxWidth: '50%',
              }}
            >
              <Label>Object Properties</Label>

              <ReactJson src={objects} collapsed={2} />
            </div>
          </div>
        )}
      </Accordion.Content>
    </Accordion>
  )
}

const newElement = {
  title: 'New Element',
  category: TemplateElementCategory.Question,
  elementTypePluginCode: 'shortText',
  visibilityCondition: true,
  isRequired: false,
  isEditable: true,
  validation: true,
  validationMessage: 'no validation',
  helpText: '',
  parameters: { label: 'New Element' },
  defaultValue: {},
}

const asObjectOrValue = (value: string) => {
  console.log(value)
  try {
    return JSON.parse(value)
  } catch (e) {
    console.log('asObjectOrVaelu', { value: value })
    return { value: value }
  }
}

const asObject = (value: EvaluatorNode) =>
  typeof value === 'object' && value !== null
    ? value
    : { value: value || value === false ? false : null }

const getCurrentPageElements = (structure: FullStructure, section: string, page: number) => {
  return structure?.sections[section]?.pages[page]?.state || []
}
export default Form
