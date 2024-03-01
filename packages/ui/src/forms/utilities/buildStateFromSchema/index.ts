import type { Data, Field as FieldSchema, PayloadRequest } from 'payload/types'

import type { FormState } from '../../Form/types'

import { iterateFields } from './iterateFields'

type Args = {
  data?: Data
  fieldSchema: FieldSchema[] | undefined
  id?: number | string
  operation?: 'create' | 'update'
  preferences: {
    [key: string]: unknown
  }
  req: PayloadRequest
  siblingData?: Data
}

export type BuildFormStateArgs = {
  collectionSlug?: string
  data?: Data
  formState?: FormState
  globalSlug?: string
  id?: number | string
  operation?: 'create' | 'update'
  schemaPath: string
}

const buildStateFromSchema = async (args: Args): Promise<FormState> => {
  const { id, data: fullData = {}, fieldSchema, operation, preferences, req } = args

  if (fieldSchema) {
    const state: FormState = {}

    await iterateFields({
      id,
      data: fullData,
      errorPaths: new Set(),
      fields: fieldSchema,
      fullData,
      operation,
      parentPassesCondition: true,
      path: '',
      preferences,
      req,
      state,
    })

    return state
  }

  return {}
}

export default buildStateFromSchema