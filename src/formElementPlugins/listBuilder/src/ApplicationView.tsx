import React, { useEffect, useState } from 'react'
import { Button, Modal, Form, Segment, Icon } from 'semantic-ui-react'
import { ApplicationViewProps } from '../../types'
import { User } from '../../../utils/types'
import { DisplayType, InputResponseField, ListItem, ListLayoutProps } from './types'
import { TemplateElement } from '../../../utils/generated/graphql'
import ApplicationViewWrapper from '../../ApplicationViewWrapper'
import {
  buildElements,
  getDefaultDisplayFormat,
  resetCurrentResponses,
  anyErrorItems,
  createTextString,
} from './helpers'
import { ListCardLayout, ListTableLayout, ListInlineLayout } from './displayComponents'
import strings from '../constants'
import { useUserState } from '../../../contexts/UserState'

const ApplicationView: React.FC<ApplicationViewProps> = ({
  element,
  parameters,
  onSave,
  onUpdate,
  Markdown,
  initialValue,
  currentResponse,
  applicationData,
  allResponses,
}) => {
  const { isEditable } = element
  const {
    label,
    description,
    createModalButtonText = strings.BUTTON_LAUNCH_MODAL,
    modalText,
    addButtonText = strings.BUTTON_ADD,
    updateButtonText = strings.BUTTON_UPDATE,
    deleteItemText = strings.BUTTON_DELETE,
    inputFields,
    displayFormat = getDefaultDisplayFormat(inputFields),
    displayType = DisplayType.CARDS,
  } = parameters
  const {
    userState: { currentUser },
  } = useUserState()
  const [currentInputResponses, setCurrentInputResponses] = useState<ListItem>(
    resetCurrentResponses(inputFields)
  )

  const [listItems, setListItems] = useState<ListItem[]>(initialValue?.list ?? [])
  const [selectedListItem, setSelectedListItem] = useState<number | null>(null)
  const [open, setOpen] = useState(false)
  const [inputError, setInputError] = useState(false)

  const [currentResponseElementsState, setCurrentResponseElementsState] = useState<any>()

  useEffect(() => {
    buildElements(
      inputFields,
      allResponses,
      currentInputResponses,
      currentUser as User,
      applicationData
    ).then((elements) => setCurrentResponseElementsState(elements))
  }, [currentInputResponses])

  useEffect(() => {
    onSave({
      text: listItems.length > 0 ? createTextString(listItems, inputFields) : undefined,
      list: listItems,
    })
  }, [listItems])

  // This is sent to ApplicationViewWrapper and runs instead of the default responseMutation
  const innerElementUpdate =
    (code: string) =>
    async ({ variables: response }: { variables: InputResponseField }) => {
      // need to get most recent state of currentInputResponse, thus using callback
      setCurrentInputResponses((currentInputResponses) => {
        const newResponses = { ...currentInputResponses, [code]: response }
        if (!anyErrorItems(newResponses, inputFields)) setInputError(false)
        return newResponses
      })
    }

  const updateList = async () => {
    if (anyErrorItems(currentInputResponses, inputFields)) {
      setInputError(true)
      return
    }
    // Add item
    if (selectedListItem === null) {
      setListItems([...listItems, currentInputResponses])
    } else {
      // Or update existing item
      const newList = [...listItems]
      newList[selectedListItem] = currentInputResponses
      setListItems(newList)
    }
    resetModalState()
  }

  const editItem = async (index: number) => {
    setSelectedListItem(index)
    setCurrentInputResponses(listItems[index])
    setOpen(true)
  }

  const deleteItem = async (index: number) => {
    setListItems(listItems.filter((_, i) => i !== index))
    resetModalState()
  }

  const resetModalState = () => {
    setCurrentInputResponses(resetCurrentResponses(inputFields))
    setOpen(false)
    setSelectedListItem(null)
    setInputError(false)
  }

  const listDisplayProps: ListLayoutProps = {
    listItems,
    displayFormat,
    editItem: isEditable ? editItem : () => {},
    deleteItem: isEditable ? deleteItem : () => {},
    fieldTitles: inputFields.map((e: TemplateElement) => e.title),
    codes: inputFields.map((e: TemplateElement) => e.code),
    Markdown,
    isEditable,
  }

  let DisplayComponent
  switch (displayType) {
    case DisplayType.TABLE:
      DisplayComponent = <ListTableLayout {...listDisplayProps} />
      break
    case DisplayType.INLINE:
      DisplayComponent = (
        <ListInlineLayout
          {...listDisplayProps}
          inputFields={inputFields}
          responses={allResponses}
          currentUser={currentUser as User}
          applicationData={applicationData}
          editItemText={strings.BUTTON_EDIT}
          deleteItemText={deleteItemText}
          currentResponseElementsState={currentResponseElementsState}
          innerElementUpdate={innerElementUpdate}
        />
      )
      break
    default:
      DisplayComponent = <ListCardLayout {...listDisplayProps} />
  }

  const ListInputForm = (
    <>
      <Markdown text={modalText} />
      {currentResponseElementsState &&
        inputFields.map((field: TemplateElement, index: number) => {
          const element = currentResponseElementsState?.[field.code]
          // console.log('Element', element)
          return (
            <ApplicationViewWrapper
              key={`list-${element.code}`}
              element={element}
              isStrictPage={inputError}
              allResponses={allResponses}
              currentResponse={currentInputResponses[element.code].value}
              onSaveUpdateMethod={innerElementUpdate(element.code)}
              applicationData={applicationData}
            />
          )
        })}
      <Button
        primary
        content={selectedListItem !== null ? updateButtonText : addButtonText}
        onClick={updateList}
      />
      {displayType === DisplayType.TABLE && selectedListItem !== null && (
        <Button secondary content={deleteItemText} onClick={() => deleteItem(selectedListItem)} />
      )}
      {displayType === DisplayType.INLINE && (
        <Button secondary content={strings.BUTTON_CANCEL} onClick={() => setOpen(false)} />
      )}
      {inputError && (
        <p className="alert">
          <Icon name="attention" />
          {strings.ERROR_LIST_ITEMS_NOT_VALID}
        </p>
      )}
    </>
  )

  return (
    <>
      <label>
        <Markdown text={label} semanticComponent="noParagraph" />
      </label>
      <Markdown text={description} />
      <Button
        primary
        content={createModalButtonText}
        onClick={() => setOpen(true)}
        disabled={!isEditable}
      />
      {displayType !== DisplayType.INLINE && (
        <Modal
          size="tiny"
          onClose={() => resetModalState()}
          onOpen={() => setOpen(true)}
          open={open}
        >
          <Segment>
            <Form>{ListInputForm}</Form>
          </Segment>
        </Modal>
      )}
      {displayType === DisplayType.INLINE && open && <Segment>{ListInputForm}</Segment>}
      {DisplayComponent}
    </>
  )
}

export default ApplicationView
