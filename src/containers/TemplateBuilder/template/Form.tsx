import React, { useEffect, useState } from 'react'
import { Button, Dropdown, Header, Icon, Label, Modal, Popup } from 'semantic-ui-react'
import { Loading, PageElements } from '../../../components'
import { useUserState } from '../../../contexts/UserState'
import pluginProvider from '../../../formElementPlugins/pluginProvider'
import {
  TemplateElement,
  TemplateElementCategory,
  TemplateStatus,
  useCreateSectionMutation,
  useDeleteWholeApplicationMutation,
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

  const templateId = fullStructure?.info.template.id || 0
  const selectedSection = fullStructure?.sections[selectedSectionCode]
  const [updateState, setUpdateState] = useState<ElementUpdateState | null>(null)
  const [updateTemplateElement] = useUpdateTemplateElementMutation()
  const [createSection] = useCreateSectionMutation()
  const [updateApplication] = useRestartApplicationMutation()
  const [updateTemplateSection] = useUpdateTemplateSectionMutation()

  useEffect(() => {
    if (selectedPageNumber - 1) return
    if (!fullStructure?.sections[selectedSectionCode]?.pages[selectedPageNumber]) {
      setSelectedPageNumber(-1)
    }
  }, [selectedPageNumber, fullStructure])

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

  const movePage = () => {}

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
                    <div className="config-container">
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

                console.log(elementsAfterLastIndex, lastElementIndex, thisPageElements)
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

      <Modal open={!!updateState} onClose={() => setUpdateState(null)}>
        {updateState && (
          <div className="element-update-container">
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
            </div>
            <div key="elementCategory" className="element-dropdown-container">
              <Label content="Category" />
              <Dropdown
                value={updateState.category}
                selection
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
            <OnBlurInput
              key="elementCode"
              initialValue={updateState.code}
              label="Code"
              update={(value: string) => setUpdateState({ ...updateState, code: value })}
            />
            <OnBlurInput
              key="elementTitle"
              initialValue={updateState.title}
              label="Title"
              update={(value: string) => setUpdateState({ ...updateState, title: value })}
            />
            <JsonTextBox
              key="elementIsVisible"
              initialValue={asObject(updateState.visibilityCondition)}
              label="isVisible"
              update={(value: object) =>
                setUpdateState({ ...updateState, visibilityCondition: value })
              }
            />
            <JsonTextBox
              key="elementIsEditable"
              initialValue={asObject(updateState.isEditable)}
              label="isEditable"
              update={(value: object) => setUpdateState({ ...updateState, isEditable: value })}
            />
            <JsonTextBox
              key="elementIsRequired"
              initialValue={asObject(updateState.isRequired)}
              label="isRequired"
              update={(value: object) => setUpdateState({ ...updateState, isRequired: value })}
            />
            <JsonTextBox
              key="elementIsValid"
              initialValue={asObject(updateState.validation)}
              label="isValid"
              update={(value: object) => setUpdateState({ ...updateState, validation: value })}
            />
            <OnBlurInput
              key="elementHelpText"
              initialValue={updateState.validationMessage}
              label="Validation Message"
              isTextArea={true}
              update={(value: string) =>
                setUpdateState({ ...updateState, validationMessage: value })
              }
            />
            <JsonTextBox
              key="elementDefaultValue"
              initialValue={asObject(updateState.defaultValue)}
              label="Default Value"
              update={(value: object) => setUpdateState({ ...updateState, defaultValue: value })}
            />
            <JsonTextBox
              key="elementParameters"
              initialValue={updateState.parameters}
              label="Plugin Parameters"
              update={(value: object) => setUpdateState({ ...updateState, parameters: value })}
            />
            <OnBlurInput
              key="elementHelpText"
              initialValue={updateState.helpText}
              label="Help Text"
              isTextArea={true}
              update={(value: string) => setUpdateState({ ...updateState, helpText: value })}
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

const asObject = (value: EvaluatorNode) =>
  typeof value === 'object' && value != null ? value : { value: value || null }

const getCurrentPageElements = (structure: FullStructure, section: string, page: number) => {
  return structure?.sections[section]?.pages[page]?.state || []
}
export default Form
