import type { EditViewComponent } from 'payload/config'
import type {
  AdminViewComponent,
  DocumentPreferences,
  Document as DocumentType,
  Field,
  ServerSideEditViewProps,
} from 'payload/types'
import type { DocumentPermissions } from 'payload/types'
import type { AdminViewProps } from 'payload/types'

import { DocumentHeader } from '@payloadcms/ui/elements/DocumentHeader'
import { HydrateClientUser } from '@payloadcms/ui/elements/HydrateClientUser'
import { RenderCustomComponent } from '@payloadcms/ui/elements/RenderCustomComponent'
import { buildStateFromSchema } from '@payloadcms/ui/forms/buildStateFromSchema'
import { DocumentInfoProvider } from '@payloadcms/ui/providers/DocumentInfo'
import { EditDepthProvider } from '@payloadcms/ui/providers/EditDepth'
import { FormQueryParamsProvider } from '@payloadcms/ui/providers/FormQueryParams'
import { formatDocTitle } from '@payloadcms/ui/utilities/formatDocTitle'
import { formatFields } from '@payloadcms/ui/utilities/formatFields'
import { docAccessOperation } from 'payload/operations'
import React from 'react'

import type { GenerateEditViewMetadata } from './getMetaBySegment.js'

import { NotFoundClient } from '../NotFound/index.client.js'
import { NotFoundView } from '../NotFound/index.js'
import { getMetaBySegment } from './getMetaBySegment.js'
import { getViewsFromConfig } from './getViewsFromConfig.js'

export const generateMetadata: GenerateEditViewMetadata = async (args) => getMetaBySegment(args)

export const Document: React.FC<AdminViewProps> = async ({
  initPageResult,
  params,
  searchParams,
}) => {
  const {
    collectionConfig,
    docID: id,
    globalConfig,
    locale,
    permissions,
    req,
    req: {
      i18n,
      payload,
      payload: {
        config,
        config: {
          routes: { api: apiRoute },
          serverURL,
        },
      },
      user,
    },
  } = initPageResult

  const segments = Array.isArray(params?.segments) ? params.segments : []
  const collectionSlug = collectionConfig?.slug || undefined
  const globalSlug = globalConfig?.slug || undefined

  const isEditing = Boolean(globalSlug || (collectionSlug && !!id))

  let ViewOverride: EditViewComponent
  let CustomView: EditViewComponent
  let DefaultView: EditViewComponent
  let ErrorView: AdminViewComponent = NotFoundView

  /**
  let data: DocumentType
  let preferencesKey: string
  let fields: Field[] **/
  let docPermissions: DocumentPermissions
  let hasSavePermission: boolean
  let apiURL: string
  let action: string

  if (collectionConfig) {
    try {
      docPermissions = await docAccessOperation({
        id,
        collection: {
          config: collectionConfig,
        },
        req,
      })
    } catch (error) {
      return <NotFoundClient />
    }

    /**
    fields = collectionConfig.fields **/
    action = `${serverURL}${apiRoute}/${collectionSlug}${isEditing ? `/${id}` : ''}`

    hasSavePermission =
      (isEditing && permissions?.collections?.[collectionSlug]?.update?.permission) ||
      (!isEditing && permissions?.collections?.[collectionSlug]?.create?.permission)

    apiURL = `${serverURL}${apiRoute}/${collectionSlug}/${id}?locale=${locale.code}${
      collectionConfig.versions?.drafts ? '&draft=true' : ''
    }`

    const editConfig = collectionConfig?.admin?.components?.views?.Edit
    ViewOverride = typeof editConfig === 'function' ? editConfig : null

    if (!ViewOverride) {
      const collectionViews = getViewsFromConfig({
        collectionConfig,
        config,
        docPermissions,
        routeSegments: segments,
        user,
      })

      console.log('collectionViews', collectionViews)

      CustomView = collectionViews?.CustomView
      DefaultView = collectionViews?.DefaultView
      ErrorView = collectionViews?.ErrorView
    }

    if (!CustomView && !DefaultView && !ViewOverride) {
      return <ErrorView initPageResult={initPageResult} searchParams={searchParams} />
    }

    /**
    if (id) {
      try {
        data = await payload.findByID({
          id,
          collection: collectionSlug,
          depth: 0,
          draft: true,
          fallbackLocale: null,
          locale: locale.code,
          overrideAccess: false,
          user,
        })
      } catch (error) {} // eslint-disable-line no-empty

      if (!data) {
        return <NotFoundClient />
      }

      preferencesKey = `collection-${collectionSlug}-${id}`
    }
    **/
  }

  if (globalConfig) {
    docPermissions = permissions?.globals?.[globalSlug]
    hasSavePermission = isEditing && docPermissions?.update?.permission
    action = `${serverURL}${apiRoute}/globals/${globalSlug}`
    /**
    fields = globalConfig.fields **/

    apiURL = `${serverURL}${apiRoute}/${globalSlug}?locale=${locale.code}${
      globalConfig.versions?.drafts ? '&draft=true' : ''
    }`

    const editConfig = globalConfig?.admin?.components?.views?.Edit
    ViewOverride = typeof editConfig === 'function' ? editConfig : null

    if (!ViewOverride) {
      const globalViews = getViewsFromConfig({
        config,
        docPermissions,
        globalConfig,
        routeSegments: segments,
        user,
      })

      CustomView = globalViews?.CustomView
      DefaultView = globalViews?.DefaultView
      ErrorView = globalViews?.ErrorView

      if (!CustomView && !DefaultView && !ViewOverride) {
        return <ErrorView initPageResult={initPageResult} searchParams={searchParams} />
      }

      /**
      try {
        data = await payload.findGlobal({
          slug: globalSlug,
          depth: 0,
          draft: true,
          fallbackLocale: null,
          locale: locale.code,
          overrideAccess: false,
          user,
        })
      } catch (error) {} // eslint-disable-line no-empty

      if (!data) {
        return <NotFoundClient />
      }

      preferencesKey = `global-${globalSlug}` **/
    }
  }

  /**
   const { docs: [{ value: docPreferences } = { value: null }] = [] } = (await payload.find({
   collection: 'payload-preferences',
   depth: 0,
   limit: 1,
   where: {
   key: {
   equals: preferencesKey,
   },
   },
   })) as any as { docs: { value: DocumentPreferences }[] } // eslint-disable-line @typescript-eslint/no-explicit-any

   const initialState = await buildStateFromSchema({
   id,
   data: data || {},
   fieldSchema: formatFields(fields, isEditing),
   operation: isEditing ? 'update' : 'create',
   preferences: docPreferences,
   req,
   })
   */

  const viewComponentProps: ServerSideEditViewProps = {
    initPageResult,
    params,
    routeSegments: segments,
    searchParams,
  }

  return (
    <DocumentInfoProvider
      action={action}
      apiURL={apiURL}
      collectionSlug={collectionConfig?.slug}
      disableActions={false}
      docPermissions={docPermissions}
      globalSlug={globalConfig?.slug}
      hasSavePermission={hasSavePermission}
      id={id}
      /**
      initialData={data}
      initialState={initialState}
      title={formatDocTitle({
        collectionConfig,
        data,
        dateFormat: config.admin.dateFormat,
        fallback: id?.toString(),
        globalConfig,
        i18n,
      })} **/
      isEditing={isEditing}
    >
      {!ViewOverride && (
        <DocumentHeader
          collectionConfig={collectionConfig}
          config={payload.config}
          globalConfig={globalConfig}
          i18n={i18n}
        />
      )}
      <HydrateClientUser permissions={permissions} user={user} />
      <EditDepthProvider depth={1} key={`${collectionSlug || globalSlug}-${locale.code}`}>
        <FormQueryParamsProvider
          initialParams={{
            depth: 0,
            'fallback-locale': 'null',
            locale: locale.code,
            uploadEdits: undefined,
          }}
        >
          <RenderCustomComponent
            CustomComponent={ViewOverride || CustomView}
            DefaultComponent={DefaultView}
            componentProps={viewComponentProps}
          />
        </FormQueryParamsProvider>
      </EditDepthProvider>
    </DocumentInfoProvider>
  )
}
