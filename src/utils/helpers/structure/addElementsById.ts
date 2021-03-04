import { ElementsById, FullStructure } from '../../types'

const addElementsById = (structure: FullStructure) => {
  const pages = Object.values(structure.sections)
    .map((section) => Object.values(section.pages))
    .flat()
  const elementStates = Object.values(pages)
    .map((page) => page.state)
    .flat()

  const elementsById: ElementsById = {}

  elementStates.forEach((elementState) => {
    elementsById[elementState.element.id] = elementState
  })

  return { ...structure, elementsById }
}

export default addElementsById
