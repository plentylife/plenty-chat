export function STUB () {
  throw new Error('THIS IS A STUB')
}

export function eqSet (as, bs) {
  if (as.size !== bs.size) return false
  for (let a of as) if (!bs.has(a)) return false
  return true
}

let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export function getDayOfWeek (date) {
  return days[date.getDay()]
}
