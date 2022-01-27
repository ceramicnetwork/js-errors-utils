# Error utilities

## Classes

- [StackError](classes/StackError.md)

## Type aliases

### StackErrorJSON

Ƭ **StackErrorJSON**: `Object`

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

#### Type declaration

| Name | Type |
| :------ | :------ |
| `code` | `string` |
| `message` | `string` |
| `metadata` | `Record`<`string`, `unknown`\> |
| `name` | `string` |
| `stack` | [`StackErrorJSON`](README.md#stackerrorjson)[] |

## Functions

### assert

▸ **assert**(`condition`, `message?`): asserts condition

Asserts the given `condition` is true or throws an Error with the given `message`.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `condition` | `boolean` | `undefined` |
| `message` | `string` | `'Assertion failed'` |

#### Returns

asserts condition

___

### assertAs

▸ **assertAs**<`T`\>(`condition`, `ErrorClass`, ...`args`): asserts condition

Asserts the given `condition` is true or throws an Error using the given `ErrorClass` and
associated arguments.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends typeof [`StackError`](classes/StackError.md) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `condition` | `boolean` |
| `ErrorClass` | `T` |
| `...args` | `ConstructorParameters`<`T`\> |

#### Returns

asserts condition

___

### createNamespaceError

▸ **createNamespaceError**(`namespace`, `metadata?`): typeof `NamespaceError`

Factory for an Error class extending `StackError` with a given `namespace` and optional
`metadata`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `namespace` | `string` |
| `metadata` | `Record`<`string`, `unknown`\> |

#### Returns

typeof `NamespaceError`
