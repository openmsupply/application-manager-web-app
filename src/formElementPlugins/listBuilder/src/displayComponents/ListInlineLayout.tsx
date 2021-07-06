import React, { useEffect, useState } from 'react'
import { Button, Icon, Accordion } from 'semantic-ui-react'
import { ApplicationDetails, ElementState, User } from '../../../../utils/types'
import { ListLayoutProps } from '../types'
import ApplicationViewWrapper from '../../../ApplicationViewWrapper'
import SummaryViewWrapper from '../../../SummaryViewWrapper'
import { buildElements, substituteValues } from '../helpers'
import '../styles.less'

const ListInlineLayout: React.FC<ListLayoutProps> = (props) => {
  const { listItems, displayFormat } = props
  return (
    <>
      {listItems.map((item, index) => (
        <ItemAccordion
          key={index} // Not ideal, but there isn't any other unique identifier
          index={index}
          item={item}
          header={displayFormat.title}
          {...props}
        />
      ))}
    </>
  )
}
export default ListInlineLayout

// Inner component -- one for each Item in list
const ItemAccordion: React.FC<any> = ({
  item,
  header,
  index,
  inputFields,
  isEditable = true,
  responses,
  currentUser,
  applicationData,
  Markdown,
  codes,
  editItem,
  deleteItem,
  editItemText,
  updateButtonText,
  deleteItemText,
  innerElementUpdate,
  updateList,
}) => {
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState(false)
  const [currentItemElementsState, setItemResponseElementsState] =
    useState<{ [key: string]: ElementState }>()

  const editItemInline = () => {
    setEdit(true)
    editItem(index, false)
  }

  const updateListInline = () => {
    updateList()
    setEdit(false)
  }

  const deleteItemInline = () => {
    deleteItem(index)
    setEdit(false)
    setOpen(false)
  }

  useEffect(() => {
    buildElements(
      inputFields,
      responses,
      item,
      currentUser as User,
      applicationData as ApplicationDetails
    ).then((elements) => setItemResponseElementsState(elements))
  }, [])

  if (!currentItemElementsState) return null
  return (
    <Accordion
      styled
      className="accordion-container fit-content"
      style={{ maxWidth: open ? 'none' : '100%' }}
    >
      <Accordion.Title active={open} onClick={() => setOpen(!open)}>
        <Icon name="dropdown" />
        <Markdown text={substituteValues(header, item)} semanticComponent="noParagraph" />
      </Accordion.Title>
      <Accordion.Content active={open}>
        {codes.map((code: string, cellIndex: number) =>
          edit ? (
            <ApplicationViewWrapper
              key={`list-${cellIndex}`}
              element={currentItemElementsState[code]}
              isStrictPage={false}
              allResponses={responses}
              currentResponse={item[code].value}
              onSaveUpdateMethod={innerElementUpdate(currentItemElementsState[code].code)}
              applicationData={applicationData}
            />
          ) : (
            <SummaryViewWrapper
              key={`item_accordion_${cellIndex}`}
              element={currentItemElementsState[code]}
              response={item[code].value}
              allResponses={responses}
            />
          )
        )}
        {!edit && isEditable && <Button primary content={editItemText} onClick={editItemInline} />}
        {edit && <Button primary content={updateButtonText} onClick={updateListInline} />}
        {isEditable && <Button secondary content={deleteItemText} onClick={deleteItemInline} />}
      </Accordion.Content>
    </Accordion>
  )
}
