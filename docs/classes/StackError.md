# Class: StackError

## Hierarchy

- `Error`

  ↳ **`StackError`**

## Constructors

### constructor

• **new StackError**(`code`, `message`, `wrapError?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `code` | `string` |
| `message` | `string` |
| `wrapError?` | `Error` |

#### Overrides

Error.constructor

## Properties

### code

• **code**: `string`

___

### errorStack

• **errorStack**: [`StackError`](StackError.md)[]

___

### metadata

• **metadata**: `Record`<`string`, `unknown`\> = `{}`

___

### name

• **name**: `string` = `'StackError'`

#### Overrides

Error.name

## Methods

### toErrorStack

▸ **toErrorStack**(): [`StackError`](StackError.md)[]

#### Returns

[`StackError`](StackError.md)[]

___

### toJSON

▸ **toJSON**(`withStack?`): [`StackErrorJSON`](../README.md#stackerrorjson)

Serializes the error to JSON. By default the `errorStack` is included on a single level,
setting the `withStack` argument to `false` will serialize the error only, discarding the
stack.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `withStack` | `boolean` | `true` |

#### Returns

[`StackErrorJSON`](../README.md#stackerrorjson)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

___

### from

▸ `Static` **from**(`error`, `code?`): [`StackError`](StackError.md)

Casts an `Error` to a `StackError`, using the given `code`. Calling this function with an
instance of `StackError` will return the input unchanged.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `error` | `Error` | `undefined` |
| `code` | `string` | `'SE0'` |

#### Returns

[`StackError`](StackError.md)

___

### fromJSON

▸ `Static` **fromJSON**(`json`): [`StackError`](StackError.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `json` | [`StackErrorJSON`](../README.md#stackerrorjson) |

#### Returns

[`StackError`](StackError.md)
