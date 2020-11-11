# Errors utils

Custom errors utilities

## Installation

```sh
npm install errors-utils
```

## Example usage

```ts
import { assertAs, createNamespaceError } from 'errors-utils'
import { name, version } from '../package.json' // use metadata from package.json

const LibError = createNamespaceError('LIB', { package: name, version })

const input = 'any'
try {
  assertAs(input === 'foo', LibError, 123, 'Should be foo')
} catch (error) {
  console.log(err.toString()) // '[LIB123] Should be foo'
}
```

## Types

### StackErrorJSON

```ts
type StackErrorJSON = {
  code: string
  message: string
  metadata: Record<string, unknown>
  name: string
  stack: Array<StackErrorJSON>
}
```

## StackError class

Extends the built-in `Error` class

#### new StackError()

**Arguments**

1. `code: string`
1. `message: string`
1. `parentError?: StackError`

#### .code

**Returns** `string`

#### .message

**Returns** `string`

#### .errorStack

**Returns** `Array<StackError>` based on the `parentError` provided in constructor

#### .metadata

**Returns** `Record<string, unknown>`

#### .toErrorStack()

**Returns** `Array<StackError>` of all the errors in the stack

#### .toJSON()

Serializes the error to JSON. By default the `errorStack` is included on a single level, setting the `withStack` argument to `false` will serialize the error only, discarding the stack.

**Arguments**

1. `withStack: boolean = true`

**Returns** `StackErrorJSON`

## Public APIs

### assert()

Asserts the given `condition` is true or throws an Error with the given `message`.

**Arguments**

1. `condition: boolean`
1. `message?: string = 'Assertion error'`

### assertAs()

Asserts the given `condition` is true or throws an Error using the given `ErrorClass` and associated arguments.

**Arguments**

1. `condition: boolean`
1. `ErrorClass: typeof StackError`
1. `ErrorClass` arguments

### createNamespaceError()

Factory for an Error class extending `StackError` with a given `namespace` and optional `metadata`.

**Arguments**

1. `namespace: string`
1. `metadata?: Record<string, unknown>`

**Returns** `class NamespaceError extends StackError`

The `NamespaceError` class constructor uses the following arguments:

1. `code: string | number`
1. `message: string`
1. `parentError?: StackError`

## License

Apache-2.0 OR MIT