import React from 'react'
import { Header, Icon, Label } from 'semantic-ui-react'
import { TemplateElementCategory } from '../../../../utils/generated/graphql'
import { IconButton } from '../../shared/components'
import { useOperationState } from '../../shared/OperationContext'
import { getRandomNumber } from '../../shared/OperationContextHelpers'
import { useTemplateState } from '../TemplateWrapper'
import { useFullApplicationState } from './ApplicationWrapper'
import { useFormState } from './Form'
import { useFormStructureState } from './FormWrapper'
import { MoveSection } from './moveStructure'

const disabledMessage = 'Can only edit draft procedure, please make it draft or duplicate'

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
              label: 'Placeholder Element (page must contain at least one element to exist)',
            },
            elementTypePluginCode: 'shortText',
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
          name="add"
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
          name="close"
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

// const deletePage = async () => {
//   if (!isEditable) return

//   const elementsInPage =
//     fullStructure?.sections[selectedSectionCode || ''].pages[selectedPageNumber]?.state || []

//   const applicationResponseIds = elementsInPage
//     .filter((pageElement) => !!pageElement?.latestApplicationResponse?.id)
//     .map((pageElement) => pageElement.latestApplicationResponse.id)

//   if (applicationResponseIds.length > 0) {
//     const result = await mutate(
//       () =>
//         updateApplication({
//           variables: {
//             serial: fullStructure?.info?.serial || '',
//             applicationPatch: {
//               applicationResponsesUsingId: {
//                 deleteById: applicationResponseIds.map((id) => ({ id })),
//               },
//             },
//           },
//         }),
//       setError
//     )

//     if (!result) return
//   }

//   if (elementsInPage.length > 0) {
//     const lastElementIndex = elementsInPage[elementsInPage.length - 1]?.element.elementIndex
//     let pageBreakId = 0
//     let stopSearch = false
//     ;(thisSection?.templateElementsBySectionId?.nodes || []).forEach((element) => {
//       if (stopSearch) return
//       if ((element?.index || 0) > lastElementIndex) {
//         stopSearch = true
//         if (element?.elementTypePluginCode === 'pageBreak') pageBreakId = element?.id || 0
//       }
//     })

//     const result = await mutate(
//       () =>
//         updateTemplateSection({
//           variables: {
//             id: thisSection?.id || 0,
//             sectionPatch: {
//               templateElementsUsingId: {
//                 deleteById: [
//                   ...elementsInPage.map((element) => ({
//                     id: element?.element.id || 0,
//                   })),
//                   { id: pageBreakId },
//                 ],
//               },
//             },
//           },
//         }),
//       setError
//     )
//     if (!result) return
//   }

//   setSelectedPageNumber(-1)
// }

// {selectedPageNumber !== -1 && (
//     <>
//       <Popup
//         content="Template form only editable on draft templates"
//         key="notDraftEdit"
//         disabled={isEditable}
//         trigger={
//           <div className="template-page-edit">
//             <PageMove
//               isEditable={isEditable}
//               setError={setError}
//               setSelectedPageNumber={setSelectedPageNumber}
//               moveStructure={moveStructure}
//               templateId={templateId}
//               sectionCode={selectedSectionCode}
//               pageNumber={selectedPageNumber}
//             />

//         }
//       />
//       <div className="config-wrapper">
//         <PageElements
//           canEdit={true}
//           renderConfigElement={(element: ElementState) => (
//             <Popup
//               content="Template form only editable on draft templates"
//               key="not draft"
//               disabled={isEditable}
//               trigger={
//                 <div className="config-container" style={{ margin: 5 }}>
//                   <ElementMove
//                     elementId={element.id}
//                     isEditable={isEditable}
//                     setError={setError}
//                     moveStructure={moveStructure}
//                     templateId={templateId}
//                     pageNumber={selectedPageNumber}
//                   />
//                   <Icon
//                     size="large"
//                     className="template-elment-settings"
//                     name="setting"
//                     onClick={() =>
//                       setUpdateState({
//                         code: element.code,
//                         index: element.elementIndex,
//                         title: element.title,
//                         category: element.category,
//                         elementTypePluginCode: element.pluginCode,
//                         visibilityCondition: element.isVisibleExpression,
//                         isRequired: element.isRequiredExpression,
//                         isEditable: element.isEditableExpression,
//                         validation: element.validationExpression,
//                         helpText: element.helpText || '',
//                         validationMessage: element.validationMessage || '',
//                         parameters: element.parameters,
//                         defaultValue: element.defaultValueExpression,
//                         id: element.id,
//                       })
//                     }
//                   />
//                   {!element.isVisible && (
//                     <Popup
//                       content="Visibility criteria did not match"
//                       key="not draft"
//                       trigger={<Icon name="eye slash" />}
//                     />
//                   )}
//                 </div>
//               }
//             />
//           )}
//           elements={getCurrentPageElements(
//             fullStructure,
//             selectedSectionCode,
//             selectedPageNumber
//           )}
//           responsesByCode={fullStructure.responsesByCode}
//           applicationData={fullStructure.info}
//         />
//         <Button
//           inverted
//           primary
//           onClick={() => {
//             const thisPage =
//               moveStructure.sections[selectedSectionCode].pages[selectedPageNumber] || []
//             const thisPageElements = thisPage.elements
//             const lastElementIndex = thisPageElements[thisPageElements.length - 1]?.index || 0
//             const elementsAfterLastIndex = [
//               ...thisPage.endPageBreaks,
//               ...moveStructure.sections[selectedSectionCode].elements,
//             ].filter(({ index }) => index > lastElementIndex)

//             mutate(
//               () =>
//                 updateTemplateSection({
//                   variables: {
//                     id: selectedSection?.details.id || 0,
//                     sectionPatch: {
//                       templateElementsUsingId: {
//                         updateById: elementsAfterLastIndex.map(({ id, index }) => ({
//                           id,
//                           patch: { index: index + 1 },
//                         })),
//                         create: [
//                           {
//                             ...newElement,
//                             code: `newElementCode_${Math.floor(
//                               Math.random() * Math.pow(9, 9)
//                             )}`,
//                             index: lastElementIndex + 1,
//                             applicationResponsesUsingId: {
//                               create: [{ applicationId: fullStructure.info.id }],
//                             },
//                           },
//                         ],
//                       },
//                     },
//                   },
//                 }),
//               setError
//             )
//           }}
//         >
//           New Element
//         </Button>
//       </div>
//     </>
//   )}

//   <Modal
//     className="element-edit-modal"
//     open={!!updateState}
//     onClose={() => setUpdateState(null)}
//   >
//     {updateState && (
//       <div className="element-update-container">
//         <Label attached="top right">
//           <a
//             href="https://github.com/openmsupply/application-manager-web-app/wiki/Element-Type-Specs"
//             target="_blank"
//           >
//             <Icon name="info circle" size="big" color="blue" />
//           </a>
//         </Label>
//         <div key="elementPlugin" className="element-dropdown-container">
//           <Label content="Type" />
//           <Dropdown
//             value={updateState.elementTypePluginCode}
//             selection
//             options={Object.values(pluginProvider.pluginManifest).map(
//               ({ code, displayName }) => ({
//                 key: code,
//                 value: code,
//                 text: displayName,
//               })
//             )}
//             onChange={(_, { value }) =>
//               setUpdateState({ ...updateState, elementTypePluginCode: String(value) })
//             }
//           />
//           <Dropdown
//             style={{ margin: 4 }}
//             text="From Existing"
//             search
//             selection
//             icon="search"
//             onClick={() => {
//               setElementTemplateState({
//                 isSearching: true,
//                 pluginCode: updateState.elementTypePluginCode,
//                 options: [{ text: 'Loading', key: -1 }],
//               })
//             }}
//             options={elementTemplateState.options}
//             onChange={(_, { value }) => {
//               const selected = elementTemplateState.options.find(
//                 (option) => option?.value === value
//               )

//               if (selected?.valueFull) setUpdateState({ ...updateState, ...selected.valueFull })
//             }}
//           />
//           <div key="elementCategory" className="element-dropdown-container">
//             <Label content="Category" />
//             <Dropdown
//               value={updateState.category}
//               selection
//               fluid
//               options={[
//                 {
//                   key: 'Information',
//                   value: TemplateElementCategory.Information,
//                   text: 'Information',
//                 },
//                 { key: 'Question', value: TemplateElementCategory.Question, text: 'Question' },
//               ]}
//               onChange={(_, { value }) =>
//                 setUpdateState({ ...updateState, category: value as TemplateElementCategory })
//               }
//             />
//           </div>
//           <div className="element-code-edit">
//             <OnBlurInput
//               key="elementCode"
//               initialValue={updateState.code}
//               isPropUpdated={true}
//               label="Code"
//               update={(value: string) => setUpdateState({ ...updateState, code: value })}
//             />
//           </div>
//           <OnBlurInput
//             key="elementTitle"
//             isPropUpdated={true}
//             initialValue={updateState.title}
//             label="Title"
//             update={(value: string) => setUpdateState({ ...updateState, title: value })}
//           />
//         </div>
//         <div className="element-edit-text-input">
//           <OnBlurInput
//             key="elementValidationMessage"
//             isPropUpdated={true}
//             initialValue={updateState.validationMessage}
//             label="Validation Message"
//             textAreaRows={3}
//             isTextArea={true}
//             update={(value: string) =>
//               setUpdateState({ ...updateState, validationMessage: value })
//             }
//           />
//           <OnBlurInput
//             key="elementHelpText"
//             isPropUpdated={true}
//             initialValue={updateState.helpText}
//             label="Help Text"
//             isTextArea={true}
//             textAreaRows={3}
//             update={(value: string) => setUpdateState({ ...updateState, helpText: value })}
//           />
//         </div>
//         <EvaluationContainer
//           key="elementIsEditable"
//           label="isEditable"
//           currentElementCode={updateState.code}
//           fullStructure={fullStructure}
//           evaluation={asObject(updateState.isEditable)}
//           setEvaluation={(value: object) =>
//             setUpdateState({ ...updateState, isEditable: value })
//           }
//         />

//         <EvaluationContainer
//           key="elementIsRequired"
//           label="Is Required"
//           currentElementCode={updateState.code}
//           fullStructure={fullStructure}
//           evaluation={asObject(updateState.isRequired)}
//           setEvaluation={(value: object) =>
//             setUpdateState({ ...updateState, isRequired: value })
//           }
//         />
//         <EvaluationContainer
//           key="elementIsValid"
//           label="Is Valid"
//           currentElementCode={updateState.code}
//           fullStructure={fullStructure}
//           evaluation={asObject(updateState.validation)}
//           setEvaluation={(value: object) =>
//             setUpdateState({ ...updateState, validation: value })
//           }
//         />

//         <EvaluationContainer
//           key="elementVisibility"
//           label="Is Visible"
//           currentElementCode={updateState.code}
//           fullStructure={fullStructure}
//           evaluation={asObject(updateState.visibilityCondition)}
//           setEvaluation={(value: object) =>
//             setUpdateState({ ...updateState, visibilityCondition: value })
//           }
//         />
//         <EvaluationContainer
//           key="defaultValue"
//           label="Default Value"
//           currentElementCode={updateState.code}
//           fullStructure={fullStructure}
//           evaluation={asObject(updateState.defaultValue)}
//           setEvaluation={(value: object) =>
//             setUpdateState({ ...updateState, defaultValue: value })
//           }
//         />
//         <Parameters
//           key="parametersElement"
//           currentElementCode={updateState.code}
//           fullStructure={fullStructure}
//           parameters={asObject(updateState.parameters)}
//           setParameters={(value: object) =>
//             setUpdateState({ ...updateState, parameters: value })
//           }
//         />

//         <div className="button-container">
//           <Button
//             inverted
//             disabled={!isEditable}
//             primary
//             onClick={async () => {
//               const result = await mutate(
//                 () =>
//                   updateTemplateElement({
//                     variables: { id: updateState.id, templateElementPatch: updateState },
//                   }),
//                 setError
//               )
//               if (result) setUpdateState(null)
//             }}
//           >
//             Save
//           </Button>
//           <Button
//             disabled={!isEditable}
//             inverted
//             primary
//             onClick={async () => {
//               const applicationResponseId =
//                 fullStructure?.elementsById?.[updateState.id || 0]?.latestApplicationResponse
//                   ?.id || 0
//               if (applicationResponseId) {
//                 const result = await mutate(
//                   () =>
//                     updateApplication({
//                       variables: {
//                         serial: fullStructure.info.serial,
//                         applicationPatch: {
//                           applicationResponsesUsingId: {
//                             deleteById: [{ id: applicationResponseId }],
//                           },
//                         },
//                       },
//                     }),
//                   setError
//                 )

//                 if (!result) return
//               }

//               const result = await mutate(
//                 () =>
//                   updateTemplateSection({
//                     variables: {
//                       id: thisSection?.id || 0,
//                       sectionPatch: {
//                         templateElementsUsingId: {
//                           deleteById: [{ id: updateState.id || 0 }],
//                         },
//                       },
//                     },
//                   }),
//                 setError
//               )

//               if (!result) return
//               setUpdateState(null)
//             }}
//           >
//             Remove
//           </Button>
//           <Button inverted primary onClick={() => setUpdateState(null)}>
//             Cancel
//           </Button>
//         </div>
//         {!isEditable && (
//           <Label color="red">Template form only editable on draft templates</Label>
//         )}
//       </div>
//     )}
//   </Modal>
// </>
// )
// }
