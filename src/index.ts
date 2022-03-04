/**
 * ```sh
 * npm install errors-utils
 * ```
 *
 * ## Examples
 *
 * ### Library errors with metadata
 *
 * ```ts
 * import { assertAs, createNamespaceError } from 'errors-utils'
 * import { name, version } from '../package.json' // use metadata from package.json
 *
 * const LibError = createNamespaceError('LIB', { package: name, version })
 *
 * const input = 'any'
 * try {
 *   assertAs(typeof input === 'string', LibError, 120, 'Input must be string')
 *   assertAs(input === 'foo', LibError, 123, 'Input must be foo')
 * } catch (error) {
 *   console.log(error.toString()) // '[LIB123] Input must be foo'
 *   throw new LibError(10, 'Input validation failed', error) // Wrap thrown error
 * }
 * ```
 *
 * ### Custom assertions
 *
 * ```ts
 * import { StackError, assertAs, createNamespaceError } from 'errors-utils'
 *
 * function createAssert(ErrorClass: typeof StackError) {
 *   // Our assert function will use the provided Error class and default message
 *   function assert(condition: boolean, code: string | number, message = 'Assertion failed') {
 *     return assertAs(condition, ErrorClass, code, message)
 *   }
 *
 *   assert.equal = (a, b, code = 11, msg = `${a} must be equal to ${b}`) => {
 *     return assert(a === b, code, msg)
 *   }
 *   assert.notEqual = (a, b, code = 12, msg = `${a} must not be equal to ${b}`) => {
 *     return assert(a !== b, code, msg)
 *   }
 *   // ...
 *
 *   return assert
 * }
 *
 * const LibError = createNamespaceError('LIB')
 * const assert = createAssert(LibError)
 * assert.equal(a, b)
 * ```
 *
 * ### Error classes extensions
 *
 * ```ts
 * import { assertAs, createNamespaceError } from 'errors-utils'
 *
 * // ProtocolError is used for clients interactions
 *
 * class ProtocolError extends createNamespaceError('PTL') {
 *   toAPI(response) { ... }
 * }
 *
 * const PROTOCOL_VERSION = 2
 *
 * function assertProtocolVersion(version: number) {
 *   return assertAs(version === PROTOCOL_VERSION, ProtocolError, 1, `Invalid protocol version: expected ${PROTOCOL_VERSION}, got ${version}`)
 * }
 *
 * function handleAPICall(request, response) {
 *   try {
 *     assertProtocolVersion(request.body.version)
 *   } catch (error) {
 *     if (error instanceof ProtocolError) {
 *       return error.toAPI(response)
 *     }
 *   }
 * }
 *
 * // InternalError is used for platform interactions
 *
 * class InternalError extends createNamespaceError('INT') {
 *   // Attach logger to instance
 *   logger: Logger = myLogger
 *
 *   log(level = 'critical') {
 *     this.logger.log({ level, code: this.code, message: this.message })
 *   }
 * }
 *
 * function assertValidService(service) {
 *   return assertAs(service instanceof Service, InternalError, 123, 'Invalid service provided')
 * }
 *
 * function checkConfig(config) {
 *   try {
 *     assertValidService(config.myService)
 *     ...
 *   } catch (err) {
 *     if (error instanceof InternalError) {
 *       error.log()
 *     }
 *   }
 * }
 * ```
 */

export type StackErrorJSON = {
  code: string
  message: string
  metadata: Record<string, unknown>
  name: string
  stack: Array<StackErrorJSON>
}

export class StackError extends Error {
  /**
   * Casts an `Error` to a `StackError`, using the given `code`. Calling this function with an
   * instance of `StackError` will return the input unchanged.
   */
  static from(error: Error, code = 'SE0'): StackError {
    if (error instanceof StackError) {
      return error
    }
    const se = new StackError(code, error.message)
    se.stack = error.stack
    return se
  }

  static fromJSON(json: StackErrorJSON): StackError {
    const error = new StackError(json.code, json.message)
    error.errorStack = (json.stack ?? []).reduceRight((stack, e) => {
      const err = StackError.fromJSON(e)
      err.errorStack = stack
      return [err, ...stack]
    }, [] as Array<StackError>)
    error.metadata = json.metadata ?? {}
    error.name = json.name ?? 'StackError'
    return error
  }

  code: string
  errorStack: Array<StackError>
  metadata: Record<string, unknown> = {}
  name = 'StackError'

  constructor(code: string, message: string, wrapError?: Error) {
    super(message)
    Object.setPrototypeOf(this, StackError.prototype)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StackError)
    }

    this.code = code
    this.errorStack = wrapError ? StackError.from(wrapError).toErrorStack() : []
  }

  toErrorStack(): Array<StackError> {
    return [this, ...this.errorStack]
  }

  /**
   * Serializes the error to JSON. By default the `errorStack` is included on a single level,
   * setting the `withStack` argument to `false` will serialize the error only, discarding the
   * stack.
   */
  toJSON(withStack = true): StackErrorJSON {
    return {
      code: this.code,
      message: this.message,
      metadata: this.metadata,
      name: this.name,
      stack: withStack ? this.errorStack.map((e) => e.toJSON(false)) : [],
    }
  }

  toString(): string {
    return `[${this.code}] ${this.message}`
  }
}

/**
 * Factory for an Error class extending `StackError` with a given `namespace` and optional
 * `metadata`.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createNamespaceError(namespace: string, metadata: Record<string, unknown> = {}) {
  return class NamespaceError extends StackError {
    constructor(code: string | number, message: string, wrapError?: Error) {
      super(`${namespace}${code}`, message, wrapError)
      Object.setPrototypeOf(this, NamespaceError.prototype)
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, NamespaceError)
      }

      this.metadata = metadata
    }
  }
}

/**
 * Asserts the given `condition` is true or throws an Error with the given `message`.
 */
export function assert(condition: boolean, message = 'Assertion failed'): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}

/**
 * Asserts the given `condition` is true or throws an Error using the given `ErrorClass` and
 * associated arguments.
 */
export function assertAs<T extends typeof StackError>(
  condition: boolean,
  ErrorClass: T,
  ...args: ConstructorParameters<T>
): asserts condition {
  if (!condition) {
    // @ts-ignore args
    throw new ErrorClass(...args)
  }
}
