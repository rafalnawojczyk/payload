import type { PayloadRequest } from '../../../express/types.js'

import { sendEvent } from '../index.js'
import { oneWayHash } from '../oneWayHash.js'

export type AdminInitEvent = {
  domainID?: string
  type: 'admin-init'
  userID?: string
}

export const adminInit = (req: PayloadRequest): void => {
  const { payload, user } = req
  const { host } = req.headers

  let domainID: string
  let userID: string

  if (host) {
    domainID = oneWayHash(host, payload.secret)
  }

  if (user && typeof user?.id === 'string') {
    userID = oneWayHash(user.id, payload.secret)
  }

  sendEvent({
    event: {
      domainID,
      type: 'admin-init',
      userID,
    },
    payload,
  })
}