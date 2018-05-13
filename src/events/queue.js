import {Event, _handleEvent, EventResult} from './index'

/** the second value in tuple is a resolve function for the promise */
let _eventBacklog: Array<[Event, (any) => void]> = []

export function _backlogEvent (_event: Event): Promise<boolean | Error | EventResult> {
  const event = {..._event}
  const b = [event, null]
  const p = new Promise((resolve) => { b[1] = resolve })
  if (!b[1]) throw new Error('Second value must be a promise to backlog an event')
  _eventBacklog.push(b)
  consumeEvents()
  return p.then(r => {
    if (!r && r !== false) throw new Error('Programmer Error. events/queue')
    return r
  })
}

let _isConsuming = false

async function consumeEvents () {
  if (!_isConsuming) {
    _isConsuming = true

    let next = _eventBacklog.shift()
    let event = next[0]
    let resolve = next[1]

    while (event) {
      const result = await _handleEvent(event)
      resolve(result)
      next = _eventBacklog.shift()
      if (next) {
        event = next[0]
        resolve = next[1]
      } else {
        event = null
        resolve = null
      }
    }

    _isConsuming = false
  }
}
