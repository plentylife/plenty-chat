export const COST_OF_SENDING_MESSAGE = 1

export const MINIMUM_CREDIT_LIMIT = 1

export const DEFAULT_CREDIT_LIMIT = MINIMUM_CREDIT_LIMIT

export const DEFAULT_COMMUNITY_SHARE_POINTS = 100

/* demurrage rate are given as the fraction that will be left at the end of one period */

export const MAXIMUM_DEMURRAGE_RATE = 0.9

// fixme should be maximum
export const DEFAULT_DEMURRAGE_RATE = 0.02

export const STATISTICS_DEMURRAGE_RATE = 0.85

export const CREDIT_LIMIT_DEMURRAGE_RATE = 0.85

/** in milliseconds */
export const LENGTH_OF_DAY = 1000 * 60 * 60 * 24

/** applies to stats and credit limit demurrage as well; in milliseconds */
export const DEMURRAGE_PERIOD = LENGTH_OF_DAY

export const MAX_PRECISION_IN_AGENT_AMOUNTS = 3
