import DW from './DonateWindow'
import {bindNSQL} from 'nano-sql-react'

const DonationWindow = bindNSQL(DW)
export {
  DonationWindow
}
