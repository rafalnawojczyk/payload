import type { CollectionPermission, GlobalPermission, User } from 'payload/auth'
import type { EditViewComponent } from 'payload/config'
import type {
  AdminViewComponent,
  SanitizedCollectionConfig,
  SanitizedConfig,
  SanitizedGlobalConfig,
} from 'payload/types'

import { isEntityHidden } from 'payload/utilities'
import React from 'react'

import { APIView as DefaultAPIView } from '../API/index.js'
import { EditView as DefaultEditView } from '../Edit/index.js'
import { LivePreviewView as DefaultLivePreviewView } from '../LivePreview/index.js'
import { NotFoundClient } from '../NotFound/index.client.js'
import { Unauthorized } from '../Unauthorized/index.js'
import { VersionView as DefaultVersionView } from '../Version/index.js'
import { VersionsView as DefaultVersionsView } from '../Versions/index.js'
import { getCustomViewByKey } from './getCustomViewByKey.js'
import { getCustomViewByRoute } from './getCustomViewByRoute.js'

export const getViewsFromConfig = ({
  collectionConfig,
  config,
  docPermissions,
  globalConfig,
  routeSegments,
  user,
}: {
  collectionConfig?: SanitizedCollectionConfig
  config: SanitizedConfig
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  docPermissions: CollectionPermission | GlobalPermission
  globalConfig?: SanitizedGlobalConfig
  routeSegments: string[]
  user: User
}): {
  CustomView: EditViewComponent
  DefaultView: EditViewComponent
  /**
   * The error view to display if CustomView or DefaultView do not exist (could be either due to not found, or unauthorized). Can be null
   */
  ErrorView: AdminViewComponent
} | null => {
  // Conditionally import and lazy load the default view
  let DefaultView: EditViewComponent = null
  let CustomView: EditViewComponent = null
  let ErrorView: AdminViewComponent = null

  console.log(routeSegments)

  const {
    routes: { admin: adminRoute },
  } = config

  const views =
    (collectionConfig && collectionConfig?.admin?.components?.views) ||
    (globalConfig && globalConfig?.admin?.components?.views)

  const livePreviewEnabled =
    (collectionConfig && collectionConfig?.admin?.livePreview) ||
    config?.admin?.livePreview?.collections?.includes(collectionConfig?.slug) ||
    (globalConfig && globalConfig?.admin?.livePreview) ||
    config?.admin?.livePreview?.globals?.includes(globalConfig?.slug)

  if (collectionConfig) {
    const editConfig = collectionConfig?.admin?.components?.views?.Edit
    const EditOverride = typeof editConfig === 'function' ? editConfig : null

    if (EditOverride) {
      CustomView = EditOverride
    }

    if (!EditOverride) {
      const [collectionEntity, collectionSlug, segment3, segment4, segment5, ...remainingSegments] =
        routeSegments

      const {
        admin: { hidden },
      } = collectionConfig

      if (isEntityHidden({ hidden, user })) {
        return null
      }

      // `../:id`, or `../create`
      switch (routeSegments.length) {
        case 3: {
          switch (segment3) {
            case 'create': {
              if ('create' in docPermissions && docPermissions?.create?.permission) {
                CustomView = getCustomViewByKey(views, 'Default')
                DefaultView = DefaultEditView
              } else {
                ErrorView = Unauthorized
              }
              break
            }

            default: {
              if (docPermissions?.read?.permission) {
                CustomView = getCustomViewByKey(views, 'Default')
                DefaultView = DefaultEditView
              } else {
                ErrorView = Unauthorized
              }
              break
            }
          }
          break
        }

        // `../:id/api`, `../:id/preview`, `../:id/versions`, etc
        case 4: {
          switch (segment4) {
            case 'api': {
              if (collectionConfig?.admin?.hideAPIURL !== true) {
                CustomView = getCustomViewByKey(views, 'API')
                DefaultView = DefaultAPIView
              }
              break
            }

            case 'preview': {
              if (livePreviewEnabled) {
                DefaultView = DefaultLivePreviewView
              }
              break
            }

            case 'versions': {
              if (docPermissions?.readVersions?.permission) {
                CustomView = getCustomViewByKey(views, 'Versions')
                DefaultView = DefaultVersionsView
              } else {
                ErrorView = Unauthorized
              }
              break
            }

            default: {
              const baseRoute = [adminRoute, 'collections', collectionSlug, segment3]
                .filter(Boolean)
                .join('/')

              const currentRoute = [baseRoute, segment4, segment5, ...remainingSegments]
                .filter(Boolean)
                .join('/')

              CustomView = getCustomViewByRoute({
                baseRoute,
                currentRoute,
                views,
              })

              if (!CustomView) ErrorView = () => <NotFoundClient />

              break
            }
          }
          break
        }

        // `../:id/versions/:version`, etc
        default: {
          if (segment4 === 'versions') {
            if (docPermissions?.readVersions?.permission) {
              CustomView = getCustomViewByKey(views, 'Version')
              DefaultView = DefaultVersionView
            } else {
              ErrorView = Unauthorized
            }
          } else {
            const baseRoute = [adminRoute, collectionEntity, collectionSlug, segment3]
              .filter(Boolean)
              .join('/')

            const currentRoute = [baseRoute, segment4, segment5, ...remainingSegments]
              .filter(Boolean)
              .join('/')

            CustomView = getCustomViewByRoute({
              baseRoute,
              currentRoute,
              views,
            })

            if (!CustomView) ErrorView = () => <NotFoundClient />
          }
          break
        }
      }
    }
  }

  if (globalConfig) {
    const editConfig = globalConfig?.admin?.components?.views?.Edit
    const EditOverride = typeof editConfig === 'function' ? editConfig : null

    if (EditOverride) {
      CustomView = EditOverride
    }

    if (!EditOverride) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [globalEntity, globalSlug, segment3, ...remainingSegments] = routeSegments

      const {
        admin: { hidden },
      } = globalConfig

      if (isEntityHidden({ hidden, user })) {
        return null
      }

      switch (routeSegments.length) {
        case 2: {
          if (docPermissions?.read?.permission) {
            CustomView = getCustomViewByKey(views, 'Default')
            DefaultView = DefaultEditView
          } else {
            ErrorView = Unauthorized
          }
          break
        }

        case 3: {
          // `../:slug/api`, `../:slug/preview`, `../:slug/versions`, etc
          switch (segment3) {
            case 'api': {
              if (globalConfig?.admin?.hideAPIURL !== true) {
                CustomView = getCustomViewByKey(views, 'API')
                DefaultView = DefaultAPIView
              }
              break
            }

            case 'preview': {
              if (livePreviewEnabled) {
                DefaultView = DefaultLivePreviewView
              }
              break
            }

            case 'versions': {
              if (docPermissions?.readVersions?.permission) {
                CustomView = getCustomViewByKey(views, 'Versions')
                DefaultView = DefaultVersionsView
              } else {
                ErrorView = Unauthorized
              }
              break
            }

            default: {
              if (docPermissions?.read?.permission) {
                CustomView = getCustomViewByKey(views, 'Default')
                DefaultView = DefaultEditView
              } else {
                ErrorView = Unauthorized
              }
              break
            }
          }
          break
        }

        default: {
          // `../:slug/versions/:version`, etc
          if (segment3 === 'versions') {
            if (docPermissions?.readVersions?.permission) {
              CustomView = getCustomViewByKey(views, 'Version')
              DefaultView = DefaultVersionView
            } else {
              ErrorView = Unauthorized
            }
          } else {
            const baseRoute = [adminRoute, 'globals', globalSlug].filter(Boolean).join('/')

            const currentRoute = [baseRoute, segment3, ...remainingSegments]
              .filter(Boolean)
              .join('/')

            CustomView = getCustomViewByRoute({
              baseRoute,
              currentRoute,
              views,
            })

            if (!CustomView) ErrorView = () => <NotFoundClient />
          }
          break
        }
      }
    }
  }

  return {
    CustomView,
    DefaultView,
    ErrorView,
  }
}
