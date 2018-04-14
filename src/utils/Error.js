// @flow

export class CommunityIdNotInferrable extends Error {
  constructor () {
    super('Community id could not be inferred')
  }
}
