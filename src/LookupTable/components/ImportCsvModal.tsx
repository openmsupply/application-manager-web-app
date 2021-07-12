import React, { ChangeEvent, useEffect } from 'react'
import {
  Button,
  Dimmer,
  Form,
  Icon,
  Loader,
  Modal,
  Segment,
  Image,
  Message,
} from 'semantic-ui-react'
import { LookUpTableImportCsvContext } from '../contexts'
import config from '../../config'
import axios from 'axios'

const ImportCsvModal: React.FC<any> = ({
  onImportSuccess,
  onClose,
  open = false,
  tableLabel = '',
  tableStructureID = 0,
}: any) => {
  const { state, dispatch } = React.useContext(LookUpTableImportCsvContext)
  const { uploadModalOpen, file, tableName, submittable, submitting, errors, success } = state

  useEffect(() => {
    dispatch({ type: open ? 'OPEN_MODAL' : 'CLOSE_MODAL' })
  }, [open])

  useEffect(() => {
    dispatch({
      type: 'SUBMITTABLE',
      payload: uploadModalOpen && file !== null && (tableStructureID ? true : tableName !== ''),
    })
  }, [uploadModalOpen, file, tableName])

  const fileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target as HTMLInputElement
    if (!input.files?.length) return
    dispatch({ type: 'SET_FILE', payload: input.files[0] })
  }

  const onImportCSV = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    dispatch({ type: 'SUBMITTING', payload: true })

    let formData: any = new FormData()
    formData.append('file', file)
    if (!tableStructureID) formData.append('tableName', tableName)

    await axios
      .post(
        config.serverREST +
          '/lookup-table/import' +
          (tableStructureID ? '/' + String(tableStructureID) : ''),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      .then(function (response: any) {
        const successResponse = response.data
        onImportSuccess()
        dispatch({ type: 'SET_SUCCESS_MESSAGES', payload: JSON.parse(successResponse.message) })
      })
      .catch(function (error: any) {
        let myErrors = []
        if (error.response) {
          const errorResponse = error.response.data
          if (errorResponse.name === 'ValidationErrors') {
            myErrors = JSON.parse(errorResponse.message)
          } else {
            myErrors.push(errorResponse.message)
          }
        } else if (error.request) {
          myErrors.push(error.request.message)
        } else {
          myErrors.push(error.message)
        }

        dispatch({ type: 'SET_ERROR_MESSAGES', payload: myErrors })
      })
  }

  return (
    <Modal
      onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
      onOpen={() => dispatch({ type: 'OPEN_MODAL' })}
      open={uploadModalOpen}
    >
      <Modal.Header>
        {!tableLabel ? 'Import Lookup-table' : `Import into Lookup-table: ${tableLabel}`}
      </Modal.Header>
      <Modal.Content>
        {submitting ? (
          <Segment basic placeholder>
            <Dimmer active inverted>
              <Loader inverted>Submitting...</Loader>
            </Dimmer>
          </Segment>
        ) : errors.length > 0 ? (
          <Message error header="Errors found" list={[...errors]} />
        ) : success.length > 0 ? (
          <Message
            positive
            header={`Lookup table '${tableLabel || tableName}' has been successfully
              ${!tableLabel ? ' created' : ' updated'}.`}
            list={[...success]}
          />
        ) : (
          <Form>
            {!tableLabel && (
              <Form.Field>
                <label>Table name</label>
                <input
                  placeholder="Table name"
                  value={tableName || ''}
                  onChange={(event) =>
                    dispatch({ type: 'SET_TABLE_NAME', payload: event.target.value })
                  }
                />
              </Form.Field>
            )}
            <Form.Field>
              <label>File input & upload </label>

              <Button as="label" htmlFor="file" type="button" animated="fade">
                <Button.Content visible>
                  <Icon name="file" />
                </Button.Content>
                <Button.Content hidden>Choose a File</Button.Content>
              </Button>
              <input type="file" id="file" hidden onChange={(event) => fileChange(event)} />
              <Form.Input
                fluid
                label="File Chosen: "
                placeholder="Use the above bar to browse your file system"
                readOnly
                value={file?.name || ''}
              />
            </Form.Field>
          </Form>
        )}
      </Modal.Content>
      <Modal.Actions>
        <Button color="black" onClick={onClose}>
          Close
        </Button>
        {errors.length > 0 || success.length > 0 ? (
          <Button
            content={success ? 'Import another CSV' : 'Try again'}
            labelPosition="right"
            icon="download"
            color={success ? 'green' : 'orange'}
            onClick={(_) => dispatch({ type: 'OPEN_MODAL' })}
          />
        ) : (
          <Button
            content="Import CSV"
            labelPosition="right"
            icon="download"
            onClick={(event) => onImportCSV(event)}
            disabled={!submittable}
            positive
          />
        )}
      </Modal.Actions>
    </Modal>
  )
}

export default React.memo(ImportCsvModal)
