export function rowOrNull<T> (rows: any): (T | null) {
  if (rows instanceof Array && rows.length > 0) {
    const fr = rows[0]
    if (fr instanceof Object && fr.affectedRows) {
      return fr.affectedRows.length > 0 ? fr.affectedRows[0] : null
    }
    return fr
  }
  return null
}
