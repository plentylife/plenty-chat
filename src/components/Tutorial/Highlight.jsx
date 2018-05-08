import React from 'react'

type Props = {
  children: Array<any>
}

export default function Highlight (props: Props) {
  return <span className={'highlight'}>{props.children}</span>
}
