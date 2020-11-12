export type StackErrorJSON = {
  code: string
  message: string
  metadata: Record<string, unknown>
  name: string
  stack: Array<StackErrorJSON>
}

export class StackError extends Error {
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

  toJSON(withStack = true): StackErrorJSON {
    return {
      code: this.code,
      message: this.message,
      metadata: this.metadata,
      name: this.name,
      stack: withStack ? this.errorStack.map(e => e.toJSON(false)) : []
    }
  }

  toString(): string {
    return `[${this.code}] ${this.message}`
  }
}

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

export function assert(condition: boolean, message = 'Assertion failed'): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}

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
