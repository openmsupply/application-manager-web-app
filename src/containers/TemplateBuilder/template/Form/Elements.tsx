import React, { useState } from 'react'
import { Popup, Icon } from 'semantic-ui-react'
import { PageElements } from '../../../../components'
import { TemplateElement, TemplateElementCategory } from '../../../../utils/generated/graphql'
import { ElementState } from '../../../../utils/types'
import ButtonWithFallback from '../../shared/ButtonWidthFallback'
import { IconButton } from '../../shared/IconButton'
import { useOperationState } from '../../shared/OperationContext'
import { getRandomNumber } from '../../shared/OperationContextHelpers'

import { disabledMessage, useTemplateState } from '../TemplateWrapper'
import { useFullApplicationState } from './ApplicationWrapper'
import ElementConfig from './ElementConfig'
import { useFormState } from './Form'
import { useFormStructureState } from './FormWrapper'
import { MoveElement, MoveSection } from './moveStructure'

type SetElementUpdateState = (elementUpdateState: TemplateElement | null) => void

const Elements: React.FC = () => {
  const { selectedPageNumber, selectedSectionId } = useFormState()
  const { structure } = useFullApplicationState()
  const {
    template: { isDraft },
  } = useTemplateState()
  const { moveStructure } = useFormStructureState()
  const { updateTemplateSection } = useOperationState()
  const [elementUpdateState, setElementUpdateState] = useState<TemplateElement | null>(null)

  if (selectedPageNumber === -1 || selectedSectionId === -1) return null
  const selectedSection = Object.values(structure.sections).find(
    (section) => section.details.id === selectedSectionId
  )
  if (!selectedSection) return null
  const selectedPage = selectedSection.pages[selectedPageNumber]
  if (!selectedPage) return null
  const currentSection = moveStructure.sections[selectedSectionId]
  const currentPage = currentSection.pages[selectedPageNumber]

  const createElement = () => {
    const thisPageElements = currentPage.elements
    const lastElementIndex = thisPageElements[thisPageElements.length - 1]?.index || 0
    const elementsAfterLastIndex = currentSection.allElements.filter(
      ({ index }) => index > lastElementIndex
    )

    updateTemplateSection(currentSection.id, {
      templateElementsUsingId: {
        updateById: elementsAfterLastIndex.map(({ id, index }) => ({
          id,
          patch: { index: index + 1 },
        })),
        create: [getNewElement(structure.info.id, lastElementIndex + 1)],
      },
    })
  }

  return (
    <div
      key={`${selectedSectionId}_${selectedPageNumber}`}
      className="builder-page-elements-wrapper"
    >
      <PageElements
        canEdit={true}
        renderConfigElement={(element: ElementState) => (
          <ElementConfigOptions
            elementId={element.id}
            isVisible={element.isVisible}
            setElementUpdatState={setElementUpdateState}
          />
        )}
        elements={selectedPage.state}
        responsesByCode={structure.responsesByCode || {}}
        applicationData={structure.info}
      />
      <ButtonWithFallback
        disabled={!isDraft}
        disabledMessage={disabledMessage}
        title="New Element"
        onClick={createElement}
      />
      <ElementConfig element={elementUpdateState} onClose={() => setElementUpdateState(null)} />
    </div>
  )
}

const ElementConfigOptions: React.FC<{
  elementId: number
  isVisible: boolean
  setElementUpdatState: SetElementUpdateState
}> = ({ elementId, isVisible, setElementUpdatState }) => {
  const {
    sections,
    template: { isDraft },
  } = useTemplateState()
  const currentElement =
    sections
      .map((section) => section.templateElementsBySectionId?.nodes || [])
      .flat()
      .find((element) => element?.id === elementId) || null

  if (!currentElement) return null

  return (
    <div className="element-config-options-container" key={elementId}>
      <ElementMove elementId={elementId} />
      <IconButton name="setting" onClick={() => setElementUpdatState(currentElement)} />
      {!isVisible && (
        <Popup content="Visibility criteria did not match" trigger={<Icon name="eye slash" />} />
      )}
    </div>
  )
}

const ElementMove: React.FC<{ elementId: number }> = ({ elementId }) => {
  const { updateTemplateSection } = useOperationState()
  const { selectedSectionId, selectedPageNumber } = useFormState()
  const { moveStructure } = useFormStructureState()
  const {
    template: { isDraft },
  } = useTemplateState()

  const currentElement = moveStructure.elements[elementId]
  if (selectedPageNumber === -1 || selectedSectionId === -1) return null

  const currentSection = moveStructure.sections[selectedSectionId]
  const currentPage = currentSection.pages[selectedPageNumber]

  if (!currentPage) return null

  const swapElement = async (nextElement: MoveElement | null) => {
    if (!nextElement) return
    if (!currentElement) return

    updateTemplateSection(selectedSectionId, {
      templateElementsUsingId: {
        updateById: [
          { id: nextElement.id, patch: { index: currentElement.index } },
          { id: elementId, patch: { index: nextElement.index } },
        ],
      },
    })
  }

  const moveToSection = async (section: MoveSection | null) => {
    if (!section) return

    const lastIndex =
      Object.values(section.pages)
        .find(({ isLast }) => isLast)
        ?.elements?.find(({ isLastInPage }) => isLastInPage)?.index || 0

    const result = await updateTemplateSection(selectedSectionId, {
      templateElementsUsingId: {
        updateById: [{ id: elementId, patch: { index: lastIndex + 1 } }],
      },
    })

    if (!result) return

    updateTemplateSection(section.id, {
      templateElementsUsingId: {
        connectById: [{ id: elementId }],
      },
    })
  }

  const doubleMove = (forward = true) => {
    console.log('yow')
    if ((!forward && currentPage.isLast) || (forward && currentPage.isFirst)) {
      moveToSection(forward ? currentSection.previousSection : currentSection.nextSection)
    } else {
      const toIndex = forward
        ? currentPage.startPageBreaks[0]?.index || 1
        : currentPage.endPageBreaks[currentPage.endPageBreaks.length - 1].index + 1

      const elementsToMove = currentSection.allElements.filter(
        ({ id, index }) => id !== elementId && toIndex <= index
      )

      updateTemplateSection(selectedSectionId, {
        templateElementsUsingId: {
          updateById: [
            { id: elementId, patch: { index: toIndex } },
            ...elementsToMove.map(({ id, index }) => ({
              id,
              patch: { index: index + 1 },
            })),
          ],
        },
      })
    }
  }

  return (
    <>
      {!(currentSection.isFirst && currentPage.isFirst) && (
        <IconButton
          disabled={!isDraft}
          disabledMessage={disabledMessage}
          name="angle double up"
          onClick={() => doubleMove(true)}
        />
      )}
      {!(currentSection.isLast && currentPage.isLast) && (
        <IconButton
          disabled={!isDraft}
          disabledMessage={disabledMessage}
          name="angle double down"
          onClick={() => doubleMove(false)}
        />
      )}

      {!currentElement.isFirstInPage && (
        <IconButton
          disabled={!isDraft}
          disabledMessage={disabledMessage}
          name="angle up"
          onClick={() => {
            swapElement(moveStructure.elements[elementId].previousElement)
          }}
        />
      )}
      {!currentElement.isLastInPage && (
        <IconButton
          disabled={!isDraft}
          disabledMessage={disabledMessage}
          name="angle down"
          onClick={async () => {
            swapElement(moveStructure.elements[elementId].nextElement)
          }}
        />
      )}
    </>
  )
}

const getNewElement = (applicationId: number, index: number) => ({
  title: 'New Element',
  category: TemplateElementCategory.Question,
  elementTypePluginCode: 'shortText',
  visibilityCondition: true,
  code: `newElementCode_${getRandomNumber()}`,
  isRequired: false,
  isEditable: true,
  validation: true,
  index,
  validationMessage: 'no validation',
  helpText: '',
  parameters: { label: 'New Element' },
  defaultValue: null,
  applicationResponsesUsingId: {
    create: [{ applicationId }],
  },
})

export default Elements
