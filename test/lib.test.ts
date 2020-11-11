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
})
