//   const [elementTemplateState, setElementTemplateState] = useState<{
//     isSearching: boolean
//     pluginCode: string
//     options: {
//       text: string
//       key: number
//       value?: number
//       valueFull?: {
//         category: TemplateElementCategory
//         helpText: string
//         parameters: object
//         defaultValue: EvaluatorNode
//         visibilityCondition: EvaluatorNode
//         validationMessage: string
//         isRequired: EvaluatorNode
//         isEditable: EvaluatorNode
//         validation: EvaluatorNode
//       }
//     }[]
//   }>({
//     isSearching: false,
//     pluginCode: '',
//     options: [],
//   }

//   const [updateState, setUpdateState] = useState<ElementUpdateState | null>(null)

//   const { data: elementSearchData } = useGetTemplateElementsByPluginQuery({
//     skip: !elementTemplateState.isSearching,
//     variables: { pluginCode: elementTemplateState.pluginCode },
//   })

//   useEffect(() => {
//     const newState = { isSearching: false }
//     if (
//       elementTemplateState.isSearching &&
//       (!elementSearchData?.templateElements?.nodes ||
//         elementSearchData.templateElements?.nodes.length === 0)
//     )
//       return setElementTemplateState({
//         ...elementTemplateState,
//         ...newState,
//         options: [{ text: 'No existing matching template elements found', key: -2 }],
//       })

//     if (!elementSearchData?.templateElements?.nodes) return

//     const newOptions = elementSearchData.templateElements?.nodes.map((templateElement) => ({
//       text: `${templateElement?.templateCode} - ${templateElement?.code} - ${templateElement?.title}`,
//       key: templateElement?.id || 0,
//       value: templateElement?.id || 0,
//       valueFull: {
//         category: templateElement?.category as TemplateElementCategory,
//         helpText: templateElement?.helpText || '',
//         parameters: templateElement?.parameters || {},
//         defaultValue: templateElement?.defaultValue || '',
//         visibilityCondition: templateElement?.visibilityCondition || true,
//         validationMessage: templateElement?.validationMessage || '',
//         isRequired: templateElement?.isRequired || false,
//         isEditable: templateElement?.isEditable || true,
//         validation: templateElement?.validation || true,
//       },
//     }))

//     setElementTemplateState({
//       ...elementTemplateState,
//       ...newState,
//       options: newOptions,
//     })
//   }, [elementSearchData])

//   const newElement = {
//     title: 'New Element',
//     category: TemplateElementCategory.Question,
//     elementTypePluginCode: 'shortText',
//     visibilityCondition: true,
//     isRequired: false,
//     isEditable: true,
//     validation: true,
//     validationMessage: 'no validation',
//     helpText: '',
//     parameters: { label: 'New Element' },
//     defaultValue: {},
//   }

//   const getCurrentPageElements = (structure: FullStructure, section: string, page: number) => {
//     return structure?.sections[section]?.pages[page]?.state || []
//   }

// const ElementMove: React.FC<{
//   moveStructure: MoveStructure
//   elementId: number

//   templateId: number
//   setError: (error: Error) => void
//   pageNumber: number
//   isEditable: boolean
// }> = ({ elementId, moveStructure, isEditable, setError }) => {
//   const [updateSection] = useUpdateTemplateSectionMutation()

//   const swapElement = async (nextElement: MoveElement | null) => {
//     const thisElement = moveStructure.elements[elementId]
//     if (!nextElement) return
//     if (!thisElement) return

//     await mutate(
//       () =>
//         updateSection({
//           variables: {
//             id: moveStructure.elements[elementId].section.id,
//             sectionPatch: {
//               templateElementsUsingId: {
//                 updateById: [
//                   { id: nextElement.id, patch: { index: thisElement.index } },
//                   { id: thisElement.id, patch: { index: nextElement.index } },
//                 ],
//               },
//             },
//           },
//         }),
//       setError
//     )
//   }

//   const moveToSection = async (section: MoveSection | null) => {
//     if (!section) return
//     const currentElement = moveStructure.elements[elementId]
//     const lastIndex =
//       Object.values(section.pages)
//         .find(({ isLast }) => isLast)
//         ?.elements?.find(({ isLastInPage }) => isLastInPage)?.index || 0

//     const result = await mutate(
//       () =>
//         updateSection({
//           variables: {
//             id: moveStructure.elements[elementId].section.id,
//             sectionPatch: {
//               templateElementsUsingId: {
//                 updateById: [{ id: currentElement.id, patch: { index: lastIndex + 1 } }],
//               },
//             },
//           },
//         }),
//       setError
//     )

//     if (!result) return

//     await mutate(
//       () =>
//         updateSection({
//           variables: {
//             id: section.id,
//             sectionPatch: {
//               templateElementsUsingId: {
//                 connectById: [{ id: currentElement.id }],
//               },
//             },
//           },
//         }),
//       setError
//     )
//     if (moveStructure.elements[elementId].page.isLast) {
//     }
//   }

//   if (!moveStructure?.elements[elementId]?.section) return null

//   return (
//     <>
//       {(!moveStructure.elements[elementId].section.isLast ||
//         !moveStructure.elements[elementId].page.isLast) && (
//         <Icon
//           name="angle double down"
//           onClick={async () => {
//             if (!isEditable) return

//             if (moveStructure.elements[elementId].page.isLast) {
//               moveToSection(moveStructure.elements[elementId].section.nextSection)
//             } else {
//               const thisPageNumber = moveStructure.elements[elementId].page.pageNumber
//               const nextPage = moveStructure.elements[elementId].section.pages[thisPageNumber + 1]
//               const pageBreak = nextPage.startPageBreaks[0]
//               const pageBreakIndex = pageBreak.index

//               const currentElement = moveStructure.elements[elementId]
//               const currentIndex = currentElement.index
//               const elementsBetweenPageBreak = moveStructure.elements[
//                 elementId
//               ].section.elements.filter(
//                 ({ index }) => index < pageBreakIndex && index > currentIndex
//               )

//               await mutate(
//                 () =>
//                   updateSection({
//                     variables: {
//                       id: moveStructure.elements[elementId].section.id,
//                       sectionPatch: {
//                         templateElementsUsingId: {
//                           updateById: [
//                             { id: currentElement.id, patch: { index: pageBreakIndex } },
//                             { id: pageBreak.id, patch: { index: pageBreakIndex - 1 } },
//                             ...elementsBetweenPageBreak.map(({ id, index }) => ({
//                               id,
//                               patch: { index: index - 1 },
//                             })),
//                           ],
//                         },
//                       },
//                     },
//                   }),
//                 setError
//               )
//             }
//           }}
//         />
//       )}
//       {(!moveStructure.elements[elementId].section.isFirst ||
//         !moveStructure.elements[elementId].page.isFirst) && (
//         <Icon
//           name="angle double up"
//           onClick={async () => {
//             if (!isEditable) return

//             if (moveStructure.elements[elementId].page.isFirst) {
//               moveToSection(moveStructure.elements[elementId].section.previousSection)
//             } else {
//               const thisPageNumber = moveStructure.elements[elementId].page.pageNumber
//               const previousPage =
//                 moveStructure.elements[elementId].section.pages[thisPageNumber - 1]
//               const pageBreak = previousPage.endPageBreaks[0]
//               const pageBreakIndex = pageBreak.index

//               const currentElement = moveStructure.elements[elementId]
//               const currentIndex = currentElement.index
//               const elementsBetweenPageBreak = moveStructure.elements[
//                 elementId
//               ].section.elements.filter(
//                 ({ index }) => index > pageBreakIndex && index < currentIndex
//               )

//               await mutate(
//                 () =>
//                   updateSection({
//                     variables: {
//                       id: moveStructure.elements[elementId].section.id,
//                       sectionPatch: {
//                         templateElementsUsingId: {
//                           updateById: [
//                             { id: currentElement.id, patch: { index: pageBreakIndex } },
//                             { id: pageBreak.id, patch: { index: pageBreakIndex + 1 } },
//                             ...elementsBetweenPageBreak.map(({ id, index }) => ({
//                               id,
//                               patch: { index: index + 1 },
//                             })),
//                           ],
//                         },
//                       },
//                     },
//                   }),
//                 setError
//               )
//             }
//           }}
//         />
//       )}
//       {!moveStructure.elements[elementId].isFirstInPage && (
//         <Icon
//           name="angle up"
//           onClick={async () => {
//             if (!isEditable) return

//             swapElement(moveStructure.elements[elementId].previousElement)
//           }}
//         />
//       )}
//       {!moveStructure.elements[elementId].isLastInPage && (
//         <Icon
//           name="angle down"
//           onClick={
//             async () => {
//               if (!isEditable) return

//               swapElement(moveStructure.elements[elementId].nextElement)
//             }
//             // movePageInSection(pageNumber + 1, pageNumber)
//           }
//         />
//       )}
//     </>
//   )
// }

// type ElementUpdateState = {
//   code: string
//   index: number
//   title: string
//   category: TemplateElementCategory
//   elementTypePluginCode: string
//   visibilityCondition: EvaluatorNode
//   isRequired: EvaluatorNode
//   isEditable: EvaluatorNode
//   validation: EvaluatorNode
//   validationMessage: string
//   helpText: string
//   parameters: object
//   defaultValue: EvaluatorNode
//   id: number
// }
