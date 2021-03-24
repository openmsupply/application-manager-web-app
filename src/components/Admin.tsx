import React, { useEffect, useRef } from 'react'

import * as d3 from 'd3'
import {
  Template,
  TemplatePermission,
  PermissionName,
  useGetPermissionStructureQuery,
} from '../utils/generated/graphql'
import templateStageFragment from '../utils/graphql/fragments/templateStage.fragment'
import { count, dsvFormat, linkVertical } from 'd3'
import { ConsolidatorCell } from './List/Cells'

const Admin: React.FC = () => {
  const ref = useRef(null)
  const { data } = useGetPermissionStructureQuery({ fetchPolicy: 'network-only' })

  useEffect(() => {
    if (!data?.templates?.nodes) return

    const drag = (simulation) => {
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        event.subject.fx = event.subject.x
        event.subject.fy = event.subject.y
      }

      function dragged(event) {
        event.subject.fx = event.x
        event.subject.fy = event.y
      }

      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0)
        event.subject.fx = null
        event.subject.fy = null
      }

      return d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended)
    }

    const transformedData = transformData(data.templates.nodes as Template[])
    console.log(transformedData)
    const links = transformedData.links.map((d) => Object.create(d))
    const nodes = transformedData.nodes.map((d) => Object.create(d))

    const simulation = d3
      .forceSimulation(nodes)

      .force(
        'link',
        d3
          .forceLink(links)
          .strength((d) => 0.99)
          // .strength(0.7)
          .distance((d) => {
            const link = transformedData.links[d.index]
            if (link.distance) return link.distance
            return 100
          })
          .id((d) => d.id)

        // .strength((d) => {
        //   const link = transformedData.links[d.index]
        //   if (!link.linkStrength) return 0.1
        //   return link.linkStrength
        // })

        // .strength(0.1)
        // .distance((d) => d.distance)
      )

      .force(
        'charge',
        d3.forceManyBody().strength(-300)
        //   (d) => {
        //   const link = transformedData.nodes[d.index]
        //   console.log(d.index)
        //   // console.log(link)
        //   if (link?.charge) {
        //     console.log(link)
        //     return link.charge
        //   }
        //   return -1
        // })
      )
      .force('center', d3.forceCenter(3000 / 2, 3000 / 2))
    // .force(
    //   'collision',
    //   d3.forceCollide().radius((d) => {
    //     console.log(d)
    //     const link = transformedData.nodes[d.index]
    //     if (link?.radius) {
    //       console.log(link)
    //       return link.radius
    //     }
    //     return 1
    //   })
    // )

    // .force('center', d3.forceCenter(2000 / 2, 2000 / 2))

    const svg = d3.select(ref.current)

    const link = svg
      .append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 1)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', (d) => Math.sqrt(d.value))

    const nodeCircle = svg
      .append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('text')
      .data(nodes)
      .join('circle')
      .attr('r', '20')
      .attr('fill', 'rgb(200,200,200)')
      .call(drag(simulation))

    const node = svg
      .append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('text')
      .data(nodes)
      .join('text')
      .text('yow')
      .attr('stroke', '#111')
      .attr('text-anchor', 'middle')
    // .attr('fill', 'rgb(200,200,200)')

    node.text((d) => d.text)

    node.append('title').text((d) => d.id)

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y)

      node.attr('x', (d) => d.x).attr('y', (d) => d.y)
      nodeCircle.attr('cx', (d) => d.x).attr('cy', (d) => d.y)
    })

    // invalidation.then(() => simulation.stop());

    //   //Setting location when ticked
    //   const ticked = () => {
    //     link
    //       .attr('x1', (d) => {
    //         return d.source.x
    //       })
    //       .attr('y1', (d) => {
    //         return d.source.y
    //       })
    //       .attr('x2', (d) => {
    //         return d.target.x
    //       })
    //       .attr('y2', (d) => {
    //         return d.target.y
    //       })

    //     node.attr('style', (d) => {
    //       return 'left: ' + d.x + 'px; top: ' + (d.y + 72) + 'px'
    //     })
    //     nodeCircle.attr('style', (d) => {
    //       return 'left: ' + d.x + 'px; top: ' + (d.y + 72) + 'px'
    //     })
    //   }
  }, [data])

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: '100vw',
        overflow: 'scroll',
        zIndex: 1000,
        background: 'white',
      }}
    >
      <svg
        ref={ref}
        style={{
          height: 3000,
          width: 3000,
          marginRight: '0px',
          marginLeft: '0px',
        }}
      ></svg>
    </div>
  )
}

const transformData = (inData: Template[]) => {
  const nodes = [
    {
      id: 'templates',
      text: 'templates',
      value: {},
      type: 'templates',
      // charge: -100,
    },
  ]

  const links: {
    type: string
    source: string
    target: string
    value: any
    linkStrength?: number
    distance?: number
  }[] = []

  const growTemplates = (inData: Template[], parentId: string) => {
    const type = 'template'

    // ADD NODES
    for (let template of inData) {
      const id = String(parentId + type + template.id)
      nodes.push({
        id,
        type,
        value: template,
        text: template.code,
        // charge: -100,
      })

      links.push({
        source: parentId,
        target: id,
        type: type,
        value: template,
        distance: 100,
      })

      growStage(template, id)
    }
  }

  const growStage = (template: Template, parentId: string) => {
    const type = 'stage'

    for (let templatePermission of template.templatePermissions.nodes) {
      if (!templatePermission) continue

      const stageNumber = templatePermission?.stageNumber
      if (!stageNumber) {
        growTemplatePermission(templatePermission, parentId)
        continue
      }
      const id = String(parentId + type + stageNumber)

      if (nodes.some(({ id: matchId }) => matchId === id)) {
        growLevel(templatePermission, id)
        continue
      }
      nodes.push({
        id,
        type,
        value: templatePermission,
        text: 'S' + stageNumber,
        // charge: -50,
      })

      links.push({
        target: parentId,
        source: id,
        type,
        value: templatePermission,
        distance: 2,
      })

      growLevel(templatePermission, id)
    }
  }

  const growLevel = (templatePermission: TemplatePermission, parentId: string) => {
    const level = templatePermission?.level
    const type = 'level'

    if (!level) {
      growTemplatePermission(templatePermission, parentId)
      return
    }
    const id = String(parentId + type + level)

    if (nodes.some(({ id: matchId }) => matchId === id)) {
      growTemplatePermission(templatePermission, id)
      return
    }
    nodes.push({
      id,
      type,
      value: templatePermission,
      text: 'L' + level,
    })

    links.push({
      source: parentId,
      target: id,
      type,
      value: templatePermission,
      distance: 1,
    })

    growTemplatePermission(templatePermission, id)
  }

  const growTemplatePermission = (templatePermission: TemplatePermission, parentId: string) => {
    const type = 'templatePermission'

    const id = String(parentId + type + templatePermission.id)

    nodes.push({
      id,
      type,
      value: templatePermission,
      text: 'TP' + templatePermission.id,
    })

    links.push({
      source: parentId,
      target: id,
      type,
      value: templatePermission,
      distance: 100,
      // linkStrength: 0.3,
    })

    growSectionAllRestrictions(templatePermission, id)
    growSectionRestrictions(templatePermission, id)
    growRole(templatePermission, id)
    growCanSelfAssign(templatePermission, id)
    growPermissionName(templatePermission.permissionName, id)

    // growPermissionName =
  }

  const growPermissionName = (permissionName: PermissionName, parentId: string) => {
    const type = 'permissionName'

    if (!permissionName) return
    const id = parentId + type + permissionName.id

    nodes.push({
      id,
      type,
      value: permissionName,
      text: String(permissionName.name + '-' + permissionName.id),
    })

    links.push({
      source: parentId,
      target: id,
      type,
      value: permissionName,
      distance: 200,
      // linkStrength: 0.3,
    })

    growUsers(permissionName, id)
  }

  const growRole = (templatePermission: TemplatePermission, parentId: string) => {
    const type = 'role'
    const id = type + templatePermission.id

    const value = templatePermission

    nodes.push({
      id,
      type,
      value,
      text: `${templatePermission.permissionName?.permissionPolicy?.name}-${templatePermission.permissionName?.permissionPolicy.id}`,
    })

    links.push({
      source: parentId,
      target: id,
      type,
      value,
      distance: 50,
      // distance: 10,
    })
  }

  const growCanSelfAssign = (templatePermission: TemplatePermission, parentId: string) => {
    const type = 'role'
    const canSelfAssign = templatePermission?.restrictions?.canSelfAssign

    if (!canSelfAssign) return

    const id = parentId + type

    const value = templatePermission

    nodes.push({
      id,
      type,
      value,
      text: `SelfAssign`,
    })

    links.push({
      source: parentId,
      target: id,
      type,
      value,
      distance: 50,
      // distance: 10,
    })
  }

  const growSectionAllRestrictions = (templatePermission: TemplatePermission, parentId: string) => {
    const templateSectionRestrictions =
      templatePermission?.restrictions?.templateSectionRestrictions
    if (!templateSectionRestrictions) return

    for (let sectionCode of templateSectionRestrictions) {
      const type = 'templatePermissionRestriction'
      const id = parentId + type + sectionCode
      nodes.push({
        id,
        type,
        value: templatePermission,
        text: 'SR-' + sectionCode,
      })

      links.push({
        source: parentId,
        target: id,
        type,
        value: templatePermission,
        distance: 50,
        // distance: 10,
      })
    }
  }

  const growSectionRestrictions = (templatePermission: TemplatePermission, parentId: string) => {
    const templateSectionRestrictions =
      templatePermission?.restrictions?.templateSectionRestrictions

    if (templateSectionRestrictions) return
    const id = 'allSections' + templatePermission.id
    const type = 'allSecitons'
    const value = templatePermission

    nodes.push({
      id,
      type,
      value,
      text: 'AS',
    })

    links.push({
      source: parentId,
      target: id,
      type,
      value,
      distance: 50,
      // distance: 10,
    })
  }

  const growUsers = (permissionName: PermissionName, parentId: string) => {
    const type = 'user'

    for (let pJ of permissionName.permissionJoins.nodes) {
      const username = pJ?.user?.username || ''
      const id = parentId + type + username
      nodes.push({
        id,
        type,
        value: username,
        text: username,
      })

      links.push({
        source: parentId,
        target: id,
        type,
        value: username,
        distance: 50,
      })
    }
  }

  growTemplates(inData, 'templates')

  // // TAMPLATES - ROOT
  // let yow = [
  //   {
  //     id: 'templates',
  //     text: 'templates',
  //     group: 1,
  //   },
  // ]
  // // TEMPLATES - NODES
  // nodes = [
  //   ...nodes,
  //   ...inData.map((template) => ({
  //     id: 't' + String(template.id),
  //     text: String(template.code),
  //     group: 1,
  //   })),
  // ]

  // // TAMPLATES - ROOT -> TEMPLATES - NODES
  // let linksz: { source: string; target: string; value: number; distance: number }[] = inData.map(
  //   (template) => ({
  //     source: 'templates',
  //     target: 't' + String(template.id),
  //     distance: 50,
  //     value: 1,
  //   })
  // )
  // // STAGES - NODES
  // let obj = {}

  // inData.forEach((template) => {
  //   template?.templatePermissions?.nodes
  //     ?.filter(({ stageNumber }) => !!stageNumber)

  //     .forEach((templatePermission) => {
  //       console.log(template.id)
  //       console.log(templatePermission.id)
  //       obj[`${templatePermission.stageNumber}${template.id}`] = { templatePermission, template }
  //     })
  // })
  // const tPStage = (templatePermission: TemplatePermission) => {
  //   let s = ''
  //   // if (templatePermission.level) s += `L${templatePermission.level} `
  //   if (templatePermission.stageNumber) s += `S${templatePermission.stageNumber} `
  //   if (s.length === 0) s = 'N/A'
  //   return s
  // }
  // nodes = [
  //   ...nodes,
  //   ...Object.values(obj).map((objVal) => ({
  //     id: 'tpst' + `${objVal.templatePermission.stageNumber}${objVal.template.id}`,
  //     text: tPStage(objVal?.templatePermission),
  //     group: 1,
  //   })),
  // ]

  // // STAGES - NODES -> TAMPLATES - NODES

  // Object.values(obj).forEach((objVal) => {
  //   links.push({
  //     source: 't' + String(objVal.template.id),
  //     target: 'tpst' + `${objVal.templatePermission.stageNumber}${objVal.template.id}`,
  //     distance: 30,
  //     value: 1,
  //   })
  // })

  // // LEVELS - NODES -> STAGE - NODES
  // const tPLevel = (templatePermission: TemplatePermission) => {
  //   let s = ''
  //   if (templatePermission.level) s += `L${templatePermission.level} `
  //   // if (templatePermission.stageNumber) s += `S${templatePermission.stageNumber} `
  //   if (s.length === 0) s = 'N/A'
  //   return s
  // }

  // let templateStageLevelObj = {}
  // let templateStageLevelRoleObj = {}
  // let permissionNames = {}

  // inData.forEach((template) => {
  //   template?.templatePermissions?.nodes
  //     ?.filter(({ stageNumber }) => !!stageNumber)

  //     .forEach((templatePermission) => {
  //       const templateStageLevel =
  //         't' + template.id + 's' + templatePermission.stageNumber + 'l' + templatePermission.level

  //       const role = templatePermission?.permissionName.permissionPolicy.type
  //       const templateStageLevelRole = templateStageLevel + role

  //       if (!templateStageLevelRoleObj[templateStageLevelRole]) {
  //         templateStageLevelRoleObj[templateStageLevelRole] = true

  //         nodes.push({
  //           id: templateStageLevelRole,
  //           text: role,
  //           group: 1,
  //         })

  //         links.push({
  //           source: templateStageLevel,
  //           target: templateStageLevelRole,
  //           value: 1,
  //           distance: 30,
  //         })
  //       }

  //       const permissionName = templatePermission?.permissionName.name
  //       if (!permissionNames[permissionName]) {
  //         permissionNames[permissionName] = true
  //         nodes.push({
  //           id: permissionName,
  //           text: permissionName,
  //           group: 1,
  //         })
  //       }

  //       links.push({
  //         source: permissionName,
  //         target: templateStageLevelRole,
  //         value: 1,
  //         distance: 30,
  //       })

  //       if (!templateStageLevelObj[templateStageLevel]) {
  //         templateStageLevelObj[templateStageLevel] = true

  //         nodes.push({
  //           id: templateStageLevel,
  //           text: 'l' + templatePermission.level,
  //           group: 1,
  //         })

  //         links.push({
  //           source:
  //             'tpst' +
  //             String(templatePermission?.stageNumber) +
  //             String(templatePermission?.templateId),
  //           target: templateStageLevel,
  //           value: 1,
  //           distance: 30,
  //         })
  //       }

  //       const usernames = {}

  //       templatePermission.permissionName?.permissionJoins.nodes.forEach((pJ) => {
  //         const username = pJ?.user.username

  //         if (!usernames[username]) {
  //           usernames[username] = true
  //           nodes.push({
  //             id: username,
  //             text: username,
  //             group: 1,
  //           })
  //         }

  //         links.push({
  //           source: permissionName,
  //           target: username,
  //           value: 1,
  //           distance: 400,
  //         })
  //       })
  //     })
  // })
  return { links, nodes }
}

export default Admin
