import { ErrorType } from 'src/error-type'
import { type ErrorResult, type Rule, validateAnyField, validateArrayField, validateDatetimeField, validateNumberField, validateStringField } from './validators'

/** [rule, value, expected] */
type TestCase = [Rule, unknown, ErrorResult]

describe('# Validator', () => {
  describe('validateNumberField tests', () => {
    const validateNumberFieldTestCases: TestCase[] = [
      [{ type: 'number', required: true }, undefined, [ErrorType.IsRequired]],
      [{ type: 'number', min: 3 }, 2, [ErrorType.LessThanMinimumValue]],
      [{ type: 'number', max: 3 }, 4, [ErrorType.MaximumValueExceeded]],
      [{ type: 'number', onlyInteger: true }, 2.5, [ErrorType.OnlyInteger]],
    ]

    for (const [index, [rule, value, expectedErrors]] of validateNumberFieldTestCases.entries()) {
      test(`Test case ${index + 1}`, () => {
        const testErrors = validateNumberField(rule, value)
        expect(testErrors).toEqual(expectedErrors)
      })
    }
  })

  describe('validateStringField tests', () => {
    const validateStringFieldTestCases: TestCase[] = [
      [{ type: 'text', required: true }, undefined, [ErrorType.IsRequired]],
      [{ type: 'text', maxLength: 5 }, '123456', [ErrorType.MaximumLengthExceeded]],
      [{ type: 'text', minLength: 5 }, '1234', [ErrorType.LessThanMinimumLength]],
      [{ type: 'email' }, 'notAnEmail', [ErrorType.IsNotAnEmail]],
      [{ type: 'url' }, 'notAUrl', [ErrorType.IsNotAUrl]],
      [{ type: 'text', regexp: { pattern: /^[0-9]*$/ } }, '123', []],
      [{ type: 'text', regexp: { pattern: /^[0-9]*$/, message: 'The string does not match the pattern' } }, 'error123', ['The string does not match the pattern']],
    ]

    for (const [index, [rule, value, expectedErrors]] of validateStringFieldTestCases.entries()) {
      test(`Test case ${index + 1}`, () => {
        const testErrors = validateStringField(rule, value)
        expect(testErrors).toEqual(expectedErrors)
      })
    }
  })

  describe('validateDatetimeField tests', () => {
    const validateDatetimeTestCases: TestCase[] = [
      [{ type: 'datetime', required: true }, undefined, [ErrorType.IsRequired]],
      [{ type: 'datetime', min: new Date(2023, 0, 1) }, '2022-12-31', [ErrorType.LessThanMinimumDatetime]],
      [{ type: 'datetime', max: new Date(2023, 0, 1) }, '2023-01-02', [ErrorType.MaximumDatetimeExceeded]],
      [{ type: 'datetime', max: 'now' }, '2024-11-11', [ErrorType.OnlyBeforeNow]],
      [{ type: 'datetime', min: 'now' }, '2000-11-11', [ErrorType.OnlyAfterNow]],
      [{ type: 'datetime', max: 'today' }, new Date().setDate(new Date().getDate() + 1), [ErrorType.OnlyBeforeToday]],
      [{ type: 'datetime', min: 'today' }, new Date().setDate(new Date().getDate() - 1), [ErrorType.OnlyAfterToday]],
    ]

    for (const [index, [rule, value, expectedErrors]] of validateDatetimeTestCases.entries()) {
      test(`Test case ${index + 1}`, () => {
        const testErrors = validateDatetimeField(rule, value)
        expect(testErrors).toEqual(expectedErrors)
      })
    }
  })

  describe('validateArrayField tests', () => {
    const validateArrayFieldTestCases: TestCase[] = [
      [{ type: 'array', required: true }, undefined, [ErrorType.IsRequired]],
      [{ type: 'array', min: 3 }, [1, 2], [ErrorType.LessThanMinimumArrayLength]],
      [{ type: 'array', max: 3 }, [1, 2, 3, 4], [ErrorType.MaximumArrayLengthExceeded]],
    ]

    for (const [index, [rule, value, expectedErrors]] of validateArrayFieldTestCases.entries()) {
      test(`Test case ${index + 1}`, () => {
        const testErrors = validateArrayField(rule, value)
        expect(testErrors).toEqual(expectedErrors)
      })
    }
  })

  describe('validateAnyField tests', () => {
    const validateAnyFieldTestCases: TestCase[] = [
      [{ required: true }, undefined, [ErrorType.IsRequired]],
      [{ custom: (value) => value === 'test' ? 'error' : undefined }, 'test', ['error']],
      [{ custom: [(value) => value === 'test' ? 'error' : undefined, (value) => value === 'test' ? 'error2' : undefined] }, 'test', ['error', 'error2']],
      [{}, undefined, []],
    ]

    for (const [index, [rule, value, expectedErrors]] of validateAnyFieldTestCases.entries()) {
      test(`Test case ${index + 1}`, () => {
        const testErrors = validateAnyField(rule, value)
        expect(testErrors).toEqual(expectedErrors)
      })
    }
  })
})
