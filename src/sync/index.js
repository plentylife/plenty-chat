// @flow

import {STUB} from '../utils'
import {Event} from '../events'

let peers = []

/** Starts the synchronization process between this agent and the peers */
export function startSync(peers: Array<string>): void {
  STUB()
}

export function notifyPeers(event: Event): void {
  STUB()
}

export function requestFromPeer(communityId: string): void {
  STUB()
}