import type {Wallet} from '../db/AgentWalletTable'
import fs from 'fs'
import {calculateDemurrageRate} from '../accounting/Demurrage'
import {floorWithPrecision} from '../accounting/utils'
import {AMOUNT_PRECISION_IN_DISPLAY} from '../components/utils'
import {Decimal} from 'decimal.js'
import {getDayOfWeek} from '../utils'

export function generateEmailHtml (newCount: number, wallet: Wallet, communityBalance: Decimal, share: Decimal): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile('src/email/template.html', (err, data) => {
      if (err) reject(err)
      let html = fillMsgCount(newCount, data.toString())
      html = fillWallet(wallet, html)
      html = fillCommunity(communityBalance, share, html)
      html = fillDate(html)
      resolve(html)
    })
  })
}

function fillDate (template): string {
  const now = new Date()
  const dayOfWeek = getDayOfWeek(now)
  const time = now.getHours() + ':' + now.getMinutes()
  return template.replace(/\[DATE\]/g, `${dayOfWeek} ${time}`)
}

function fillCommunity (balance: Decimal, share: Decimal, template: string): string {
  let html = template.replace('[COMMUNITY_BALANCE]', floorWithPrecision(balance, AMOUNT_PRECISION_IN_DISPLAY).toNumber())
  return html.replace('[SHARE]', floorWithPrecision(share, AMOUNT_PRECISION_IN_DISPLAY).toNumber())
}

function fillMsgCount (count: number, template: string): string {
  return template.replace('[MESSAGE_NUM]', count)
}

function fillBalanceStyle (standing: number, html: string) {
  const styleOk = 'color: #228b22; font-family: \'Raleway\';'
  const styleWarning = 'color: #b9872a; font-family: \'Raleway\';'
  const styleDanger = 'color: #a94442; font-family: \'Raleway\';'
  let style
  switch (standing) {
    case 1: style = styleOk; break
    case 0: style = styleWarning; break
    case -1: style = styleDanger; break
  }
  return html.replace('[BALANCE_STYLE]', style)
}

function fillWallet (wallet: Wallet, template: string): string {
  let html = template.replace('[BALANCE]', floorWithPrecision(wallet.balance, AMOUNT_PRECISION_IN_DISPLAY))
  let standing = 1
  if (wallet.balance < 0) standing = 0
  if (wallet.balance <= (-1 * wallet.creditLimit)) standing = -1
  html = fillBalanceStyle(standing, html)
  const dr = floorWithPrecision(Decimal(1).minus(calculateDemurrageRate(wallet.incomingStat, wallet.outgoingStat)).times(100), 0)
  const cl = floorWithPrecision(wallet.creditLimit, AMOUNT_PRECISION_IN_DISPLAY)
  html = html.replace('[DEMURRAGE_RATE]', dr.toNumber())
  html = html.replace('[CREDIT_LIMIT]', cl.toNumber())
  return html
}
