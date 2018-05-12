import {getAgentsByNotificationTime, registerNotification} from '../db/AgentTable'
import {NOTIFY_PERIOD} from '../accounting/AccountingGlobals'
import {getMessagesForNotifications} from '../db/MessageTable'
import {generateEmailHtml} from './Template'
import {sendMail} from './Mailer'

export async function notifyAll (): void {
  const counts = await _countAgentNotifications()
  counts.forEach((count, agent) => {
    send(agent, count)
  })
}

function send (agent, count) {
  const {agentId, email} = agent
  const html = generateEmailHtml(count)
  return sendMail(email, html).then(() => {
    return registerNotification(agentId)
  }).catch(e => {
    console.error(`Failed to send an email to ${email}`, e)
  })
}

export async function _countAgentNotifications () : Map<string, number> {
  const lastBefore = new Date().getTime() - NOTIFY_PERIOD
  const newMessages = await getMessagesForNotifications(lastBefore)
  const newByCommunity = new Map()
  newMessages.forEach(m => {
    const count = newByCommunity.get(m.channelId.communityId) || 0
    newByCommunity.set(m.channelId.communityId, count + 1)
  })
  const potentialAgents = await getAgentsByNotificationTime(lastBefore)
  const newByAgent = new Map()
  potentialAgents.forEach(a => {
    let count = 0
    a.wallets && a.wallets.forEach(w => {
      const nc = newByCommunity.get(w.communityId)
      if (nc) {
        count += nc
      }
    })
    if (count) newByAgent.set(a, count)
  })
  return newByAgent
}
