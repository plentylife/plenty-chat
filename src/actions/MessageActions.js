// @flow

import {STUB} from '../utils'
import {hasEnoughFunds} from '../accounting/Accounting'

export function sendMessage (userId: string, communityId: string, messageId: string): Promise {
  hasEnoughFunds(userId, )
  STUB()
}
