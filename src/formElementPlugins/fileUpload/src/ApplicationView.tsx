import React, { useEffect, useState, useRef } from 'react'
import { Button, Icon, Grid, List, Image, Message, Segment, Loader } from 'semantic-ui-react'
import { nanoid } from 'nanoid'
import { ApplicationViewProps } from '../../types'
import strings from '../constants'
import config from '../../../config.json'
import { useUserState } from '../../../contexts/UserState'
import { useRouter } from '../../../utils/hooks/useRouter'
import PreviewModal from './PreviewModal'

interface FileResponseData {
  uniqueId: string
  filename: string
  fileUrl: string
  thumbnailUrl: string
  mimetype: string
}

interface FileUploadServerResponse {
  success: boolean
  fileData?: FileResponseData[]
}

interface FileInfo {
  key: string
  filename: string
  loading: boolean
  error: boolean
  errorMessage?: string | null
  fileData?: FileResponseData | null
}

const host = config.serverREST
const { uploadEndpoint } = config

const ApplicationView: React.FC<ApplicationViewProps> = ({
  code,
  parameters,
  onUpdate,
  value,
  setValue,
  isEditable,
  // currentResponse,
  validationState,
  onSave,
  Markdown,
  initialValue,
}) => {
  const { label, description, fileCountLimit, fileExtensions, fileSizeLimit } = parameters
  const [toggle, setToggle] = useState(false)
  // These values required for file upload query parameters:
  const {
    userState: { currentUser },
  } = useUserState()
  const {
    query: { serialNumber },
  } = useRouter()
  const application_response_id = initialValue.id

  const [uploadedFiles, setUploadedFiles] = useState<FileInfo[]>(
    generateInitialFileData(initialValue?.files)
  )
  const [newFile, setNewFile] = useState('')
  const fileInputRef = useRef<any>(null)

  useEffect(() => {
    // Only store files that aren't error or loading
    const fileDataToSave = uploadedFiles
      .filter(({ loading, error, fileData }) => !(loading || error) && fileData)
      .map(({ fileData }) => fileData)
    onSave({
      text: createTextString(fileDataToSave as FileResponseData[]),
      files: fileDataToSave,
    })
  }, [uploadedFiles])

  const errors = [
    {
      condition: (file: any) => uploadedFiles.map((f) => f.filename).includes(file.name),
      errorMessage: strings.ERROR_FILE_ALREADY_UPLOADED,
    },
    {
      condition: (file: any) =>
        fileExtensions && !fileExtensions.includes(file.name.split('.').pop().toLowerCase()),
      errorMessage: strings.ERROR_FILE_TYPE_NOT_PERMITTED,
    },
    {
      condition: (file: any) => file.size > fileSizeLimit * 1000,
      errorMessage: strings.ERROR_FILE_TOO_BIG,
    },
    {
      condition: (file: any, newFileData: FileInfo[]) => newFileData.length >= fileCountLimit,
      errorMessage: strings.ERROR_TOO_MANY_FILES,
    },
  ]

  const handleFiles = async (e: any) => {
    const newFileData: FileInfo[] = [...uploadedFiles]
    const files: any[] = Array.from(e.target.files)

    for (const file of files) {
      const error = errors.find((error) => error.condition(file, newFileData))
      if (error) {
        newFileData.unshift({
          key: nanoid(10),
          filename: file.name,
          loading: false,
          error: true,
          errorMessage: error.errorMessage,
        })
        file.error = true
      } else {
        const key = nanoid(10)
        newFileData.unshift({ key, filename: file.name, loading: true, error: false })
        file.key = key
      }
    }
    setUploadedFiles([...newFileData])
    files.forEach(async (file: any) => {
      if (file?.error) return
      const result: FileUploadServerResponse = await uploadFile(file)
      const index = newFileData.findIndex((f: any) => f.key === file.key)
      if (result.success) {
        newFileData[index] = {
          ...newFileData[index],
          loading: false,
          fileData: result?.fileData?.[0],
        }
      } else {
        newFileData[index] = {
          ...newFileData[index],
          loading: false,
          error: true,
          errorMessage: strings.ERROR_UPLOAD_PROBLEM,
        }
      }
      setUploadedFiles([...newFileData])
    })
  }

  const handleDelete = async (key: string) => {
    setUploadedFiles(uploadedFiles.filter((file) => file.key !== key))
  }

  return (
    <>
      <label>
        <Markdown text={label} semanticComponent="noParagraph" />
      </label>
      <Markdown text={description} />
      <Segment.Group>
        {/* Dummy input button required, as Semantic Button can't
        handle file input. Link between this input and Semantic
        Button done with useRef(fileInputRef) */}
        <input
          type="file"
          ref={fileInputRef}
          hidden
          name="file-upload"
          multiple={fileCountLimit > 1}
          onChange={handleFiles}
        />
        <Segment basic textAlign="center">
          <Button primary disabled={!isEditable} onClick={() => fileInputRef?.current?.click()}>
            <Icon name="upload" />
            {uploadedFiles.length === 0
              ? strings.BUTTON_CLICK_TO_UPLOAD
              : strings.BUTTON_UPLOAD_ANOTHER}
          </Button>
        </Segment>
        <List horizontal verticalAlign="top">
          {uploadedFiles.map((file) => {
            const { key, loading, error, errorMessage, filename, fileData } = file
            return (
              <List.Item key={key} style={{ maxWidth: 150 }}>
                <Grid verticalAlign="top" celled style={{ boxShadow: 'none' }}>
                  <Grid.Row style={{ boxShadow: 'none', marginLeft: 150 }} verticalAlign="bottom">
                    <Icon
                      link
                      name="delete"
                      circular
                      fitted
                      color="grey"
                      onClick={() => handleDelete(key)}
                    />
                  </Grid.Row>
                  {error && (
                    <>
                      <Grid.Row
                        centered
                        style={{ boxShadow: 'none', height: 120, padding: 10 }}
                        verticalAlign="middle"
                      >
                        <Message negative compact>
                          <p>{errorMessage}</p>
                        </Message>
                      </Grid.Row>
                      <Grid.Row centered style={{ boxShadow: 'none' }}>
                        <p style={{ wordBreak: 'break-word' }}>{filename}</p>
                      </Grid.Row>
                    </>
                  )}
                  {loading && (
                    <>
                      <Grid.Row
                        centered
                        style={{ boxShadow: 'none', height: 120 }}
                        verticalAlign="middle"
                      >
                        <Loader active size="medium">
                          Uploading
                        </Loader>
                      </Grid.Row>
                      <Grid.Row centered style={{ boxShadow: 'none' }}>
                        <p style={{ wordBreak: 'break-word' }}>{filename}</p>
                      </Grid.Row>
                    </>
                  )}
                  {fileData && (
                    <>
                      <Grid.Row centered style={{ boxShadow: 'none' }} verticalAlign="top">
                        <a href={host + fileData.fileUrl} target="_blank">
                          <Image
                            src={host + fileData.thumbnailUrl}
                            style={{ maxHeight: '120px' }}
                          />
                        </a>
                      </Grid.Row>
                      <Grid.Row centered style={{ boxShadow: 'none' }}>
                        <Button
                          onClick={() => {
                            setToggle(!toggle)
                            setNewFile(host + fileData.fileUrl)
                          }}
                          style={{
                            wordBreak: 'break-word',
                            border: 'none',
                            background: 'none',
                            color: 'blue',
                          }}
                        >
                          {filename}
                          {/* <a href={host + fileData.fileUrl} target="_blank">
                            {filename}
                          </a> */}
                        </Button>
                      </Grid.Row>
                    </>
                  )}
                </Grid>
              </List.Item>
            )
          })}
        </List>
      </Segment.Group>
      <PreviewModal toggle={toggle} newFile={newFile} />
    </>
  )
  async function uploadFile(file: any) {
    const fileData = new FormData()
    await fileData.append('file', file)
    const response = await fetch(
      `${host}${uploadEndpoint}?user_id=${currentUser?.userId}&application_serial=${serialNumber}&application_response_id=${application_response_id}`,
      { method: 'POST', body: fileData }
    )
    return await response.json()
  }
}

export default ApplicationView

const createTextString = (files: FileResponseData[]) =>
  files.reduce(
    (output, file) => output + (output === '' ? file.filename : ', ' + file.filename),
    ''
  )

const generateInitialFileData = (files: FileResponseData[]): FileInfo[] => {
  if (!files) return []
  return files.map((file) => ({
    key: nanoid(10),
    filename: file.filename,
    loading: false,
    error: false,
    errorMessage: null,
    fileData: file,
  }))
}
