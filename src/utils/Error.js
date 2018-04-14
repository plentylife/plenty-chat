// @flow

export class CommunityIdNotInferrable extends Error {
  constructor () {
    super('Community id could not be inferred')
  }
}

export class MissingPayload extends Error {}

export class MissingProperty extends Error {
  constructor (propertyName: string) {
    super('Missing property ' + propertyName)
  }
}
