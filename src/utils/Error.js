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

export class MissingDatabaseEntry extends Error {}

export class InappropriateAction extends Error {}

export class WrongValue extends Error {}

export class ExistsInDB extends Error {
  constructor (id: any, table: string) {
    super(`Entry with id ${id} already exists in ${table}`)
  }
}
