import httpStatus from 'http-status'

import type { Collection } from '../../collections/config/types.js'
import type { PayloadRequest } from '../../express/types.js'

import { APIError } from '../../errors/index.js'

export type Args = {
  collection: Collection
  req: PayloadRequest
  token: string
}

async function verifyEmail(args: Args): Promise<boolean> {
  const { collection, req, token } = args
  if (!Object.prototype.hasOwnProperty.call(args, 'token')) {
    throw new APIError('Missing required data.', httpStatus.BAD_REQUEST)
  }

  const user = await req.payload.db.findOne<any>({
    collection: collection.config.slug,
    where: {
      _verificationToken: { equals: token },
    },
  })

  if (!user) throw new APIError('Verification token is invalid.', httpStatus.BAD_REQUEST)
  if (user && user._verified === true)
    throw new APIError('This account has already been activated.', httpStatus.ACCEPTED)

  await req.payload.db.updateOne({
    collection: collection.config.slug,
    data: {
      _verificationToken: null,
      _verified: true,
    },
    id: user.id,
    req,
  })

  return true
}

export default verifyEmail