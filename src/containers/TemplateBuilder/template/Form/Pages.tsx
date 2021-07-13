import React from 'react'
import { Header, Icon, Label } from 'semantic-ui-react'
import { TemplateElementCategory } from '../../../../utils/generated/graphql'
import { IconButton } from '../../shared/IconButton'
import { useOperationState } from '../../shared/OperationContext'
import { getRandomNumber } from '../../shared/OperationContextHelpers'
import { disabledMessage, useTemplateState } from '../TemplateWrapper'
import { useFullApplicationState } from '../ApplicationWrapper'
import { useFormState } from './Form'
import { useFormStructureState } from './FormWrapper'
import { MoveSection } from './moveStructure'

const Pages: React.FC = () => {
  const { selectedPageNumber, selectedSectionId, setSelectedPageNumber } = useFormState()
  const { moveStructure } = useFormStructureState()
  const { updateTemplateSection } = useOperationState()

  const {
    template: { isDraft },
  } = useTemplateState()

  if (selectedSectionId === -1) return null
  const currentSection = moveStructure.sections[selectedSectionId]

  const createNewPage = async () => {
    const newPageIndex = currentSection.lastElementIndex + 1

    updateTemplateSection(currentSection.id, {
      templateElementsUsingId: {
        create: [
          {
            code: `pageBreak_${getRandomNumber()}`,
            index: newPageIndex,
            category: TemplateElementCategory.Information,
            elementTypePluginCode: 'pageBreak',
            title: 'Page Break',
          },
          {
            code: `placeholderElement_${getRandomNumber()}`,
            index: newPageIndex + 1,
            category: TemplateElementCategory.Question,
            parameters: {
              title: 'Placeholder Element (page must contain at least one element to exist)',
            },
            elementTypePluginCode: 'textInfo',
            title: 'Placeholder Element',
          },
        ],
      },
    })
  }
  return (
    <>
      <div className="spacer-10" />
      <div className="flex-row-start-center">
        <Header className="no-margin-no-padding" as="h3">
          Pages
        </Header>
        <IconButton
          disabled={!isDraft}
          disabledMessage={disabledMessage}
          name="add square"
          onClick={createNewPage}
        />

        {Object.values(currentSection.pages).map((_, index) => (
          <Label
            key={currentSection.pages[index + 1].elements[0].id}
            onClick={() => {
              setSelectedPageNumber(index + 1)
            }}
            className={`clickable ${index + 1 === selectedPageNumber ? 'builder-selected ' : ''}`}
          >
            {`Page ${index + 1}`}
          </Label>
        ))}
      </div>
      <Page />
    </>
  )
}

const Page: React.FC = () => {
  const { selectedPageNumber, selectedSectionId, setSelectedPageNumber } = useFormState()
  const {
    template: { isDraft },
  } = useTemplateState()
  const { structure } = useFullApplicationState()
  const { updateTemplateSection, updateApplication } = useOperationState()
  const { moveStructure } = useFormStructureState()

  if (selectedPageNumber === -1 || selectedSectionId === -1) return null
  const currentPage = moveStructure.sections[selectedSectionId].pages[selectedPageNumber]
  if (!currentPage) return null

  const deletePage = async () => {
    const selectedPage = Object.values(structure.sections).find(
      (section) => section.details.id === selectedSectionId
    )?.pages[selectedPageNumber]
    if (!selectedPage) return
    const applicationResponseIds = selectedPage.state
      .filter((pageElement) => !!pageElement?.latestApplicationResponse?.id)
      .map((pageElement) => pageElement.latestApplicationResponse.id)

    const elementsInPage = [...currentPage.elements, ...currentPage.endPageBreaks]
    setSelectedPageNumber(-1)
    if (applicationResponseIds.length > 0) {
      const result = await updateApplication(structure.info.serial, {
        applicationResponsesUsingId: {
          deleteById: applicationResponseIds.map((id) => ({ id })),
        },
      })

      if (!result) return
    }

    const result = await updateTemplateSection(selectedSectionId, {
      templateElementsUsingId: {
        deleteById: [
          ...elementsInPage.map((element) => ({
            id: element.id || 0,
          })),
        ],
      },
    })
    if (!result) return
  }
  return (
    <>
      <div className="spacer-10" />
      <div className="flex-row-start-center">
        <PageMove />
        <Header className="no-margin-no-padding" as="h5">{`Page ${selectedPageNumber}`}</Header>
        <IconButton
          disabled={!isDraft}
          disabledMessage={disabledMessage}
          name="window close"
          onClick={deletePage}
        />
      </div>
    </>
  )
}

const PageMove: React.FC = () => {
  const { selectedPageNumber, selectedSectionId, setSelectedPageNumber } = useFormState()
  const {
    template: { isDraft },
  } = useTemplateState()
  const { updateTemplateSection } = useOperationState()
  const { moveStructure } = useFormStructureState()

  if (selectedPageNumber === -1 || selectedSectionId === -1) return null

  const currentSection = moveStructure.sections[selectedSectionId]
  const currentPage = currentSection.pages[selectedPageNumber]

  if (!currentPage) return null

  const movePageInSection = async (fromNumber: number, toNumber: number) => {
    const nextPage = currentSection.pages[fromNumber]
    const currentPage = currentSection.pages[toNumber]

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

    updateTemplateSection(currentSection.id, {
      templateElementsUsingId: {
        updateById: updates,
      },
    })
  }

  const moveToSection = async (newSection: MoveSection | null) => {
    if (!newSection) return

    const lastIndex =
      Object.values(newSection.pages)
        .find(({ isLast }) => isLast)
        ?.elements?.find(({ isLastInPage }) => isLastInPage)?.index || 0

    const pageElements = currentPage.elements
    setSelectedPageNumber(-1)

    const result = await updateTemplateSection(currentSection.id, {
      templateElementsUsingId: {
        updateById: pageElements.map(({ id }, index) => ({
          patch: {
            index: lastIndex + 1 + index,
          },
          id,
        })),
      },
    })

    if (!result) return
    await updateTemplateSection(newSection.id, {
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
    })
  }

  return (
    <>
      {!currentSection.isFirst && (
        <IconButton
          name="angle double up"
          disabled={!isDraft}
          disabledMessage={disabledMessage}
          onClick={() => moveToSection(currentSection.previousSection)}
        />
      )}
      {!currentSection.isLast && (
        <IconButton
          name="angle double down"
          disabled={!isDraft}
          disabledMessage={disabledMessage}
          onClick={() => moveToSection(currentSection.nextSection)}
        />
      )}
      {!currentPage.isFirst && (
        <IconButton
          name="angle up"
          disabled={!isDraft}
          disabledMessage={disabledMessage}
          onClick={() => {
            movePageInSection(selectedPageNumber, selectedPageNumber - 1)
          }}
        />
      )}
      {!currentPage.isLast && (
        <IconButton
          name="angle down"
          disabled={!isDraft}
          disabledMessage={disabledMessage}
          onClick={() => {
            movePageInSection(selectedPageNumber + 1, selectedPageNumber)
          }}
        />
      )}
    </>
  )
}

export default Pages
