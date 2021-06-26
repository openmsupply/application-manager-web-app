import { DateTime } from 'luxon'
import React from 'react'
import { useEffect, useState } from 'react'
import { Accordion, Button, Label } from 'semantic-ui-react'
import { TemplateStatus, useGetAllTemplatesQuery } from '../../utils/generated/graphql'

type Template = {
  name: string
  status: TemplateStatus
  id: number
  category: string
  version: number
  versionTimestamp: DateTime
  applicationCount: number
}
type TemplatesByCode = { [code: string]: Template[] }

const useGetTemplates = () => {
  const [templatesByCode, setTemplatesByCode] = useState<TemplatesByCode>({})

  const { data, error } = useGetAllTemplatesQuery({ fetchPolicy: 'network-only' })

  useEffect(() => {
    if (data && !error) {
      const templatesByCode: TemplatesByCode = {}

      const templateNodes = data?.templates?.nodes || []
      templateNodes.forEach((template) => {
        if (
          !template?.code ||
          !template.name ||
          !template.status ||
          !template?.version ||
          !template?.versionTimestamp
        ) {
          console.log('failed to load template', template)
          return
        }

        const {
          code,
          name,
          status,
          id,
          version,
          versionTimestamp,
          templateCategory,
          applications,
        } = template
        if (!templatesByCode[code]) templatesByCode[code] = []

        templatesByCode[code].push({
          name,
          status,
          id,
          category: templateCategory?.title || '',
          version,
          versionTimestamp: DateTime.fromISO(versionTimestamp),
          applicationCount: applications.totalCount || 0,
        })
      })

      setTemplatesByCode(templatesByCode)
    }
  }, [data])

  return {
    error,
    templatesByCode,
  }
}

const getTemplatesAccordionContent = (templatesByCode: TemplatesByCode) =>
  Object.entries(templatesByCode).map(([code, templates]) => {
    return {
      key: `panel-${code}`,

      title: {
        icon: '',
        content: (
          <>
            <div className="indicator-container">
              <Label className="key" content="code" />
              <Label className="value" content={code} />
            </div>
            <div className="indicator-container">
              <Label className="key" content="number of templates" />
              <Label className="value" content={templates.length} />
            </div>
            <div className="indicator-container">
              <Label className="key" content="number of applications" />
              <Label
                className="value"
                content={templates.reduce((sum, template) => sum + template.applicationCount, 0)}
              />
            </div>
          </>
        ),
      },
      content: {
        content: (
          <>
            {templates.map((template) => {
              const canRenderConfigure = template.status === TemplateStatus.Draft
              const canRenderMakeDraft = template.status === TemplateStatus.Available
              const canRenderDelete = template.applicationCount === 0
              return (
                <div className="template-container">
                  <div className="info-container">
                    <div className="indicator-container">
                      <Label className="key" content="name" />
                      <Label className="value" content={template.name} />
                    </div>
                    <div className="indicator-container">
                      <Label className="key" content="version" />
                      <Label className="value" content={template.version} />
                    </div>
                    <div className="indicator-container">
                      <Label className="key" content="status" />
                      <Label className="value" content={template.status} />
                    </div>
                    <div className="indicator-container">
                      <Label className="key" content="number of applications" />
                      <Label className="value" content={template.applicationCount} />
                    </div>
                    <div className="indicator-container">
                      <Label className="key" content="version timestamp" />
                      <Label
                        className="value"
                        content={template.versionTimestamp.toFormat('dd MMM yy')}
                      />
                    </div>
                  </div>
                  <div className="action-container">
                    {canRenderConfigure && (
                      <Button inverted primary>
                        Configure
                      </Button>
                    )}
                    {canRenderMakeDraft && (
                      <Button inverted primary>
                        Make Draft
                      </Button>
                    )}
                    {canRenderDelete && (
                      <Button inverted primary>
                        Delete
                      </Button>
                    )}
                    <Button inverted primary>
                      Duplicate
                    </Button>
                  </div>
                </div>
              )
            })}
          </>
        ),
      },
    }
  })

const Templates: React.FC = () => {
  const { templatesByCode } = useGetTemplates()

  return (
    <div className="template-builder-templates">
      <Accordion panels={getTemplatesAccordionContent(templatesByCode)} />
    </div>
  )
}

export default Templates
