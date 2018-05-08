import React from 'react'

export const TENGE = '\u20b8'

export const THANKS = <span className={'thanks-word'}>{TENGE}hanks</span>

export const PLENTY = <span className={'plenty-word'}>Plenty</span>

export function userNameFromProfile (userProfile: Object): string {
  return userProfile.first_name + ' ' + userProfile.last_name
}
