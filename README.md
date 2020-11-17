# Errors utils

Custom errors utilities

## Installation

```sh
npm install errors-utils
```

## Examples

### Library errors with metadata

```ts
import { assertAs, createNamespaceError } from 'errors-utils'
import { name, version } from '../package.json' // use metadata from package.json

const LibError = createNamespaceError('LIB', { package: name, version })

const input = 'any'
try {
  assertAs(typeof input === 'string', LibError, 120, 'Input must be string')
  assertAs(input === 'foo', LibError, 123, 'Input must be foo')
} catch (error) {
  console.log(error.toString()) // '[LIB123] Input must be foo'
  throw new LibError(10, 'Input validation failed', error) // Wrap thrown error
}
```

### Custom assertions

```ts
import { StackError, assertAs, createNamespaceError } from 'errors-utils'

function createAssert(ErrorClass: typeof StackError) {
  // Our assert function will use the provided Error class and default message
  function assert(condition: boolean, code: string | number, message = 'Assertion failed') {
    return assertAs(condition, ErrorClass, code, message)
  }

  assert.equal = (a, b, code = 11, msg = `${a} must be equal to ${b}`) => {
    return assert(a === b, code, msg)
  }
  assert.notEqual = (a, b, code = 12, msg = `${a} must not be equal to ${b}`) => {
    return assert(a !== b, code, msg)
  }
  // ...

  return assert
}

const LibError = createNamespaceError('LIB')
const assert = createAssert(LibError)
assert.equal(a, b)
```

### Error classes extensions

```ts
import { assertAs, createNamespaceError } from 'errors-utils'

// ProtocolError is used for clients interactions

class ProtocolError extends createNamespaceError('PTL') {
  toAPI(response) { ... }
}

const PROTOCOL_VERSION = 2

function assertProtocolVersion(version: number) {
  return assertAs(version === PROTOCOL_VERSION, ProtocolError, 1, `Invalid protocol version: expected ${PROTOCOL_VERSION}, got ${version}`)
}

function handleAPICall(request, response) {
  try {
    assertProtocolVersion(request.body.version)
  } catch (error) {
    if (error instanceof ProtocolError) {
      return error.toAPI(response)
    }
  }
}

// InternalError is used for platform interactions

class InternalError extends createNamespaceError('INT') {
  // Attach logger to instance
  logger: Logger = myLogger

  log(level = 'critical') {
    this.logger.log({ level, code: this.code, message: this.message })
  }
}

function assertValidService(service) {
  return assertAs(service instanceof Service, InternalError, 123, 'Invalid service provided')
}

function checkConfig(config) {
  try {
    assertValidService(config.myService)
    ...
  } catch (err) {
    if (error instanceof InternalError) {
      error.log()
    }
  }
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

### StackError.from()

Casts an `Error` to a `StackError`, using the given `code`. Calling this function with an instance of `StackError` will return the input unchanged.

**Arguments**

1. `error: Error`
1. `code?: string = 'SE0'`

**Returns** `StackError`

### StackError.fromJSON()

**Arguments**

1. `json: StackErrorJSON`

**Returns** `StackError`

### new StackError()

**Arguments**

1. `code: string`
1. `message: string`
1. `wrapError?: Error`

### .code

**Returns** `string`

### .message

**Returns** `string`

### .errorStack

**Returns** `Array<StackError>` based on the `parentError` provided in constructor

### .metadata

**Returns** `Record<string, unknown>`

### .toErrorStack()

**Returns** `Array<StackError>` of all the errors in the stack

### .toJSON()

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
1. `wrapError?: Error`

## License

Apache-2.0 OR MIT
