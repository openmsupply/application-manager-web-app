import React from 'react'
import { Button, Header, Label } from 'semantic-ui-react'
import { IconButton } from '../../shared/IconButton'

import { useOperationState } from '../../shared/OperationContext'
import { getRandomNumber } from '../../shared/OperationContextHelpers'
import TextIO from '../../shared/TextIO'
import { disabledMessage, useTemplateState } from '../TemplateWrapper'

import { useApplicationOperationState, useFullApplicationState } from './ApplicationWrapper'
import { useFormState } from './Form'
import { useFormStructureState } from './FormWrapper'

const Sections: React.FC = () => {
  const { resetApplication } = useApplicationOperationState()
  const { moveStructure } = useFormStructureState()
  const { updateTemplate } = useOperationState()
  const { structure } = useFullApplicationState()
  const { setSelectedSectionId, selectedSectionId, setSelectedPageNumber } = useFormState()
  const {
    template: { isDraft, id: templateId },
  } = useTemplateState()

  const createNewSection = () =>
    updateTemplate(templateId, {
      templateSectionsUsingId: {
        create: [
          {
            index: moveStructure.lastSectionIndex + 1,
            title: 'New Section',
            code: `newSection_${getRandomNumber()}`,
          },
        ],
      },
    })

  return (
    <>
      <div className="flex-row-start-center">
        <Header className="no-margin-no-padding" as="h3">
          Sections
        </Header>{' '}
        <IconButton
          disabled={!isDraft}
          disabledMessage={disabledMessage}
          name="add square"
          onClick={createNewSection}
        />
        <div className="flex-row-start-center-wrap flex-grow-1">
          {Object.values(structure.sections).map((section) => (
            <Label
              key={section.details.id}
              onClick={() => {
                setSelectedSectionId(section.details.id)
                setSelectedPageNumber(-1)
              }}
              className={`clickable ${
                section.details.id === selectedSectionId ? 'builder-selected ' : ''
              }`}
            >
              {section.details.title}
            </Label>
          ))}
        </div>
        <Button inverted primary onClick={resetApplication}>
          Reset Application
        </Button>
      </div>

      <Section />
    </>
  )
}

const Section: React.FC = () => {
  const { selectedSectionId, unselect } = useFormState()
  const { updateTemplate, updateTemplateSection, updateApplication } = useOperationState()
  const { structure } = useFullApplicationState()
  const {
    template: { isDraft, id: templateId },
    sections,
  } = useTemplateState()
  const { moveStructure } = useFormStructureState()

  if (selectedSectionId === -1) return null

  const selectedSection = Object.values(structure.sections).find(
    (section) => section.details.id === selectedSectionId
  )

  if (!selectedSection) return null

  const currentSection = moveStructure.sections[selectedSectionId]
  const canMoveForward = currentSection.index !== moveStructure.firstSectionIndex
  const canMoveBackward = currentSection.index !== moveStructure.lastSectionIndex

  const swapSections = (fromId: number, fromIndex: number, toId: number, toIndex: number) => {
    const currentUpdateById = {
      patch: { index: toIndex },
      id: fromId,
    }

    const previousUpdateById = {
      patch: { index: fromIndex },
      id: toId,
    }

    updateTemplate(templateId, {
      templateSectionsUsingId: { updateById: [currentUpdateById, previousUpdateById] },
    })
  }

  const moveSectionForward = () => {
    if (!currentSection.previousSection) return
    swapSections(
      currentSection.id,
      currentSection.index,
      currentSection.previousSection.id,
      currentSection.previousSection.index
    )
  }

  const moveSectionBackward = () => {
    if (!currentSection.nextSection) return
    swapSections(
      currentSection.id,
      currentSection.index,
      currentSection.nextSection.id,
      currentSection.nextSection.index
    )
  }

  const deleteSection = async () => {
    const applicationResponseIds = Object.values(selectedSection.pages)
      .map((page) => page.state)
      .flat()
      .filter((pageElement) => !!pageElement?.latestApplicationResponse?.id)
      .map((pageElement) => pageElement.latestApplicationResponse.id)

    const elementsInSection =
      sections.find((section) => section.id === currentSection.id)?.templateElementsBySectionId
        ?.nodes || []

    if (applicationResponseIds.length > 0) {
      const result = await updateApplication(structure.info.serial, {
        applicationResponsesUsingId: {
          deleteById: applicationResponseIds.map((id) => ({ id })),
        },
      })

      if (!result) return
    }

    if (elementsInSection.length > 0) {
      const result = await updateTemplateSection(currentSection.id, {
        templateElementsUsingId: {
          deleteById: elementsInSection.map((element) => ({
            id: element?.id || 0,
          })),
        },
      })
      if (!result) return
    }

    await updateTemplate(templateId, {
      templateSectionsUsingId: {
        deleteById: [{ id: currentSection.id || 0 }],
      },
    })
    unselect()
  }

  return (
    <div key={selectedSectionId} className="flex-row-start-center">
      {canMoveForward && (
        <IconButton
          disabled={!isDraft}
          disabledMessage={disabledMessage}
          name="angle up"
          onClick={moveSectionForward}
        />
      )}
      {canMoveBackward && (
        <IconButton
          disabled={!isDraft}
          disabledMessage={disabledMessage}
          name="angle down"
          onClick={moveSectionBackward}
        />
      )}
      <div className="long">
        <TextIO
          title="title"
          text={selectedSection.details.title}
          disabled={!isDraft}
          disabledMessage={disabledMessage}
          setText={(text) => {
            updateTemplate(templateId, {
              templateSectionsUsingId: {
                updateById: [{ id: selectedSectionId, patch: { title: text } }],
              },
            })
          }}
        />
      </div>
      <TextIO
        title="code"
        text={selectedSection.details.code}
        disabled={!isDraft}
        disabledMessage={disabledMessage}
        setText={(text) => {
          updateTemplate(templateId, {
            templateSectionsUsingId: {
              updateById: [{ id: selectedSectionId, patch: { code: text } }],
            },
          })
        }}
      />
      <IconButton
        disabled={!isDraft}
        disabledMessage={disabledMessage}
        name="window close"
        onClick={deleteSection}
      />
    </div>
  )
}

export default Sections
