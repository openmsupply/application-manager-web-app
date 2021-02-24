import { ApplicationElementStates } from '../../types'
interface GetPageElementsProps {
  elementsState: ApplicationElementStates
  sectionIndex: number
  pageNumber: number
}

export const getPageElements = ({
  elementsState,
  sectionIndex,
  pageNumber,
}: GetPageElementsProps) => {
  const result = Object.values(elementsState)
    .filter(({ isVisible }) => isVisible)
    .filter((element) => sectionIndex === element.sectionIndex && pageNumber === element.page)
    .sort((a, b) => a.elementIndex - b.elementIndex)

  return result
}
