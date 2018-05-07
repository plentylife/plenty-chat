import DW from './DonationWindow'
import {bindNSQL} from 'nano-sql-react'

const DonationWindow = bindNSQL(DW)
export {
  DonationWindow
}
