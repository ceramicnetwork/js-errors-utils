import { StackError, assert, assertAs, createNamespaceError } from '../src'

describe('lib', () => {
  describe('StackError', () => {
    test('extends Error', () => {
      expect(new StackError('TEST0', 'test')).toBeInstanceOf(Error)
    })

    test('has a code property', () => {
      const error = new StackError('TEST0', 'test')
      expect(error.code).toBe('TEST0')
    })

    test('has an errorStack property', () => {
      const first = new StackError('TEST1', 'first')
      const second = new StackError('TEST2', 'second', first)
      const third = new StackError('TEST3', 'third', second)
      expect(third.errorStack).toEqual([second, first])
    })

    test('has a metadata property', () => {
      const error = new StackError('TEST0', 'test')
      error.metadata = { test: 'meta' }
      expect(error.metadata.test).toBe('meta')
    })

    test('toString() formats the error', () => {
      const error = new StackError('TEST0', 'test')
      expect(error.toString()).toBe('[TEST0] test')
    })

    test('toStack() returns the errors as a list', () => {
      const first = new StackError('TEST1', 'first')
      const second = new StackError('TEST2', 'second', first)
      const third = new StackError('TEST3', 'third', second)
      expect(third.toErrorStack()).toEqual([third, second, first])
    })

    test('can be converted to and from JSON', () => {
      const first = new StackError('TEST1', 'first')
      const second = new StackError('TEST2', 'second', first)
      const third = new StackError('TEST3', 'third', second)
      const clone = StackError.fromJSON(third.toJSON())
      expect(clone).toBeInstanceOf(StackError)
      expect(clone).toEqual(third)
    })
  })

  describe('assert', () => {
    test('throws if the assertion fails', () => {
      expect(() => assert(false, 'should be true')).toThrow('should be true')
    })

    test('throws with a default error message', () => {
      expect(() => assert(false)).toThrow('Assertion failed')
    })

    test('does not throw if the assertion succeeds', () => {
      expect(assert(true)).toBeUndefined()
    })
  })

  describe('assertAs', () => {
    test('throws if the assertion fails', () => {
      expect(() => assertAs(false, StackError, 'TEST', 'should be true')).toThrow(StackError)
      expect(() => assertAs(false, StackError, 'TEST', 'should be true')).toThrow('should be true')
    })

    test('does not throw if the assertion succeeds', () => {
      expect(assertAs(true, StackError, 'TEST', 'should be true')).toBeUndefined()
    })
  })

  describe('createNamespaceError', () => {
    const meta = { foo: 'bar' }
    const TestError = createNamespaceError('TEST', meta)
    const error = new TestError(1, 'test')

    test('extends Error and StackError', () => {
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(StackError)
    })

    test('injects the namespace and metadata', () => {
      expect(error.code).toBe('TEST1')
      expect(error.metadata).toBe(meta)
    })

    test('can be used with assertAs', () => {
      expect(() => assertAs(false, TestError, 1, 'should be true')).toThrow(TestError)
    })
  })

  test('example code works', () => {
    const LibError = createNamespaceError('LIB', { package: 'my-lib', version: '0.1.0' })
    const input = 'any'

    let output
    try {
      assertAs(typeof input === 'string', LibError, 120, 'Input must be string')
      // @ts-ignore
      assertAs(input === 'foo', LibError, 123, 'Input must be foo')
    } catch (error) {
      const wrapped = new LibError(10, 'Input validation failed', error)
      output = wrapped.toJSON()
    }

    expect(output).toMatchSnapshot()
  })

  test('cross-namespaces works', () => {
    const LibAError = createNamespaceError('LIBA', { package: 'lib-a', version: '0.1.0' })

    function validate(input: string): void {
      assertAs(typeof input === 'string', LibAError, 120, 'Input must be string')
      // @ts-ignore
      assertAs(input === 'foo', LibAError, 123, 'Input must be foo')
    }

    const LibBError = createNamespaceError('LIBB', { package: 'lib-b', version: '0.2.0' })

    let output
    try {
      validate('any')
    } catch (error) {
      const wrapped = new LibBError(10, 'Input validation failed', error)
      output = wrapped.toJSON()
    }

    expect(output).toMatchSnapshot()
  })
})
