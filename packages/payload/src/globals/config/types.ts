import type { GraphQLNonNull, GraphQLObjectType } from 'graphql'
import type React from 'react'
import type { DeepRequired } from 'ts-essentials'

import type {
  CustomPreviewButtonProps,
  CustomPublishButtonProps,
  CustomSaveButtonProps,
  CustomSaveDraftButtonProps,
} from '../../admin/components/elements/types.js'
import type { User } from '../../auth/types.js'
import type { Access, Endpoint, EntityDescription, GeneratePreviewURL } from '../../config/types.js'
import type { PayloadRequest } from '../../express/types.js'
import type { Field } from '../../fields/config/types.js'
import type { Where } from '../../types/index.js'
import type { IncomingGlobalVersions, SanitizedGlobalVersions } from '../../versions/types.js'

export type TypeWithID = {
  id: number | string
}

export type BeforeValidateHook = (args: {
  data?: any
  originalDoc?: any
  req?: PayloadRequest
}) => any

export type BeforeChangeHook = (args: { data: any; originalDoc?: any; req: PayloadRequest }) => any

export type AfterChangeHook = (args: { doc: any; previousDoc: any; req: PayloadRequest }) => any

export type BeforeReadHook = (args: { doc: any; req: PayloadRequest }) => any

export type AfterReadHook = (args: {
  doc: any
  findMany?: boolean
  query?: Where
  req: PayloadRequest
}) => any

export type GlobalAdminOptions = {
  /**
   * Custom admin components
   */
  components?: {
    elements?: {
      /**
       * Replaces the "Preview" button
       */
      PreviewButton?: CustomPreviewButtonProps
      /**
       * Replaces the "Publish" button
       * + drafts must be enabled
       */
      PublishButton?: CustomPublishButtonProps
      /**
       * Replaces the "Save" button
       * + drafts must be disabled
       */
      SaveButton?: CustomSaveButtonProps
      /**
       * Replaces the "Save Draft" button
       * + drafts must be enabled
       * + autosave must be disabled
       */
      SaveDraftButton?: CustomSaveDraftButtonProps
    }
    views?: {
      Edit?: React.ComponentType<any>
    }
  }
  /**
   * Custom description for collection
   */
  description?: EntityDescription
  /**
   * Place globals into a navigational group
   * */
  group?: Record<string, string> | string
  /**
   * Exclude the global from the admin nav and routes
   */
  hidden?: ((args: { user: User }) => boolean) | boolean
  /**
   * Hide the API URL within the Edit view
   */
  hideAPIURL?: boolean
  /**
   * Function to generate custom preview URL
   */
  preview?: GeneratePreviewURL
}

export type GlobalConfig = {
  access?: {
    read?: Access
    readDrafts?: Access
    readVersions?: Access
    update?: Access
  }
  admin?: GlobalAdminOptions
  /** Extension point to add your custom data. */
  custom?: Record<string, any>
  endpoints?: Omit<Endpoint, 'root'>[] | false
  fields: Field[]
  graphQL?:
    | {
        name?: string
      }
    | false
  hooks?: {
    afterChange?: AfterChangeHook[]
    afterRead?: AfterReadHook[]
    beforeChange?: BeforeChangeHook[]
    beforeRead?: BeforeReadHook[]
    beforeValidate?: BeforeValidateHook[]
  }
  label?: Record<string, string> | string
  slug: string
  /**
   * Options used in typescript generation
   */
  typescript?: {
    /**
     * Typescript generation name given to the interface type
     */
    interface?: string
  }
  versions?: IncomingGlobalVersions | boolean
}

export interface SanitizedGlobalConfig
  extends Omit<DeepRequired<GlobalConfig>, 'endpoints' | 'fields' | 'versions'> {
  endpoints: Omit<Endpoint, 'root'>[] | false
  fields: Field[]
  versions: SanitizedGlobalVersions
}

export type Globals = {
  config: SanitizedGlobalConfig[]
  graphQL?:
    | {
        [slug: string]: {
          mutationInputType: GraphQLNonNull<any>
          type: GraphQLObjectType
          versionType?: GraphQLObjectType
        }
      }
    | false
}