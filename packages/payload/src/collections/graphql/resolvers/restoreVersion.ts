/* eslint-disable no-param-reassign */
import type { Response } from 'express'

import type { PayloadRequest } from '../../../express/types.js'
import type { Collection } from '../../config/types.js'

import restoreVersion from '../../operations/restoreVersion.js'

export type Resolver = (
  _: unknown,
  args: {
    id: number | string
  },
  context: {
    req: PayloadRequest
    res: Response
  },
) => Promise<Document>

export default function restoreVersionResolver(collection: Collection): Resolver {
  async function resolver(_, args, context) {
    const options = {
      collection,
      depth: 0,
      id: args.id,
      req: context.req,
    }

    const result = await restoreVersion(options)
    return result
  }

  return resolver
}