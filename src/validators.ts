/* eslint-disable complexity,max-statements */

import { assert, injectVariables, isNullOrUndefined } from './utils'

export enum ErrorType {
  IsRequired,

  IsNotANumber,
  OnlyInteger,
  MaximumValueExceeded,
  LessThanMinimumValue,

  IsNotAString,
  IsNotAnEmail,
  IsNotAUrl,
  MaximumLengthExceeded,
  LessThanMinimumLength,

  IsNotADatetime,
  MaximumDatetimeExceeded,
  LessThanMinimumDatetime,
  OnlyAfterNow,
  OnlyBeforeNow,
  OnlyAfterToday,
  OnlyBeforeToday,

  IsNotAnArray,
  MaximumArrayLengthExceeded,
  LessThanMinimumArrayLength,
}

export type ErrorResult = (ErrorType | string)[]

interface BasicRule {
  type?: string
  /**
   * Used for error message
   * @default fieldKey
   */
  label?: string
  /** @default false */
  required?: boolean
  custom?: CustomValidationFunction<any> | CustomValidationFunction<any>[]
}
export type Validator = (rule: Rule, value: unknown, formData?: Record<string, unknown>) => ErrorResult

export type CustomValidationFunction<V = unknown> = (value: V, formData?: any) => string | string[] | undefined
export const validateCustomRule: Validator = (rule, value, formData) => {
  if (!rule.custom) return []
  const result: ErrorResult = []
  const validationFunctions: CustomValidationFunction<any>[] = Array.isArray(rule.custom) ? rule.custom : [rule.custom]
  for (const validationFn of validationFunctions) {
    const error = validationFn(value, formData)
    if (error === undefined) continue
    if (Array.isArray(error)) result.push(...error)
    else result.push(error)
  }
  return result
}

interface NumberRule extends BasicRule {
  type: 'number'
  max?: number
  min?: number
  /** @default false */
  onlyInteger?: boolean
  custom?: CustomValidationFunction<number> | CustomValidationFunction<number>[]
}
export const validateNumberField: Validator = (rule, value) => {
  assert(rule.type === 'number')
  if (rule.required && isNullOrUndefined(value)) return [ErrorType.IsRequired]
  if (isNullOrUndefined(value)) return []
  if (typeof value !== 'number') return [ErrorType.IsNotANumber]

  const result: ErrorType[] = []
  if (rule.onlyInteger && !Number.isInteger(value)) result.push(ErrorType.OnlyInteger)
  if (rule.max && value > rule.max) result.push(ErrorType.MaximumValueExceeded)
  if (rule.min && value < rule.min) result.push(ErrorType.LessThanMinimumValue)

  return result
}

interface StringRegexpValidation {
  pattern?: RegExp | RegExp[]
  message?: string
}
interface StringRule extends BasicRule {
  type: 'email' | 'url' | 'text'
  maxLength?: number
  minLength?: number
  regexp?: StringRegexpValidation | StringRegexpValidation[]
  custom?: CustomValidationFunction<string> | CustomValidationFunction<string>[]
}
const validateRegexpField = (rule: StringRule, value: string): ErrorResult => {
  const result: ErrorResult = []
  if (rule.regexp) {
    const regexps = Array.isArray(rule.regexp) ? [...rule.regexp] : [rule.regexp]
    for (const regexp of regexps) {
      if (!regexp.pattern) continue
      const patterns = Array.isArray(regexp.pattern) ? regexp.pattern : [regexp.pattern]
      for (const pattern of patterns) {
        if (!pattern.test(value)) result.push(regexp.message || ErrorType.IsNotAString)
      }
    }
  }
  return result
}
export const validateStringField: Validator = (rule, value, formData) => {
  assert(rule.type === 'text' || rule.type === 'email' || rule.type === 'url')
  if (rule.required && (isNullOrUndefined(value) || value === '')) return [ErrorType.IsRequired]
  if (isNullOrUndefined(value)) return []
  if (typeof value !== 'string') return [ErrorType.IsNotAString]
  if (rule.type === 'email' && !/^\S+?@(\S+\.)+\S+/.test(value)) return [ErrorType.IsNotAnEmail]
  if (rule.type === 'url' && !/^https?:\/\/\S+/.test(value)) return [ErrorType.IsNotAUrl]

  const result: ErrorResult = []
  if (rule.maxLength && value.length > rule.maxLength) result.push(ErrorType.MaximumLengthExceeded)
  if (rule.minLength && value.length < rule.minLength) result.push(ErrorType.LessThanMinimumLength)

  result.push(
    ...validateRegexpField(rule, value),
    ...validateCustomRule(rule, value, formData),
  )
  return result
}

interface DatetimeRule extends BasicRule {
  type: 'datetime'
  max?: Date | 'now' | 'today'
  min?: Date | 'now' | 'today'
  custom?: CustomValidationFunction<Date | string | number> | CustomValidationFunction<Date | string | number>[]
}
export const validateDatetimeField: Validator = (rule, value, formData) => {
  assert(rule.type === 'datetime')
  if (rule.required && isNullOrUndefined(value)) return [ErrorType.IsRequired]
  if (isNullOrUndefined(value)) return []
  if (typeof value === 'string' || typeof value === 'number') value = new Date(value)
  if (!(value instanceof Date)) return [ErrorType.IsNotADatetime]

  const result: ErrorResult = []
  if (rule.max) {
    if (rule.max === 'now') {
      rule.max = new Date()
      if (value > rule.max) result.push(ErrorType.OnlyBeforeNow)
    } else if (rule.max === 'today') {
      rule.max = new Date()
      rule.max.setHours(23, 59, 59, 999)
      if (value > rule.max) result.push(ErrorType.OnlyBeforeToday)
    } else if (value > rule.max) result.push(ErrorType.MaximumDatetimeExceeded)
  }
  if (rule.min) {
    if (rule.min === 'now') {
      rule.min = new Date()
      if (value < rule.min) result.push(ErrorType.OnlyAfterNow)
    } else if (rule.min === 'today') {
      rule.min = new Date()
      rule.min.setHours(0, 0, 0, 0)
      if (value < rule.min) result.push(ErrorType.OnlyAfterToday)
    } else if (value < rule.min) result.push(ErrorType.LessThanMinimumDatetime)
  }

  result.push(...validateCustomRule(rule, value, formData))
  return result
}

interface ArrayRule extends BasicRule {
  type: 'array'
  min?: number
  max?: number
  subRule?: Rule
  custom?: CustomValidationFunction<any[]> | CustomValidationFunction<any[]>[]
}
export const validateArrayField: Validator = (rule, value, formData) => {
  assert(rule.type === 'array')
  if (rule.required && isNullOrUndefined(value)) return [ErrorType.IsRequired]
  if (isNullOrUndefined(value)) return []
  if (!Array.isArray(value)) return [ErrorType.IsNotAnArray]

  const result: ErrorResult = []
  if (rule.max && value.length > rule.max) result.push(ErrorType.MaximumArrayLengthExceeded)
  if (rule.min && value.length < rule.min) result.push(ErrorType.LessThanMinimumArrayLength)

  result.push(...validateCustomRule(rule, value, formData))
  return result
}

interface AnyRule extends BasicRule {
  type?: undefined
}
export const validateAnyField: Validator = (rule, value, formData) => {
  if (rule.required && isNullOrUndefined(value)) return [ErrorType.IsRequired]
  if (isNullOrUndefined(value)) return []
  return validateCustomRule(rule, value, formData)
}

export type Rule = StringRule | NumberRule | DatetimeRule | ArrayRule | AnyRule

export type ValidationSchema<F extends Record<keyof F, any>> = Partial<Record<keyof F, Rule>>

export const validatorMap: Record<Required<Rule>['type'] | 'any', Validator> = {
  text: validateStringField,
  email: validateStringField,
  url: validateStringField,
  number: validateNumberField,
  datetime: validateDatetimeField,
  array: validateArrayField,
  any: validateAnyField,
}

export const errorMessageMap: Record<ErrorType, string> = {
  [ErrorType.IsRequired]: '{field} is required',

  [ErrorType.IsNotANumber]: '{field} is not a number',
  [ErrorType.OnlyInteger]: '{field} must be an integer',
  [ErrorType.MaximumValueExceeded]: '{field} must be less than {max}',
  [ErrorType.LessThanMinimumValue]: '{field} must be greater than {min}',

  [ErrorType.IsNotAString]: '{field} is not a string',
  [ErrorType.IsNotAnEmail]: '{field} is not a valid email',
  [ErrorType.IsNotAUrl]: '{field} is not a valid url',
  [ErrorType.MaximumLengthExceeded]: '{field} must be less than {maxLength} characters',
  [ErrorType.LessThanMinimumLength]: '{field} must be greater than {minLength} characters',

  [ErrorType.IsNotADatetime]: '{field} is not a datetime',
  [ErrorType.MaximumDatetimeExceeded]: '{field} must be earlier than {max}',
  [ErrorType.LessThanMinimumDatetime]: '{field} must be later than {min}',
  [ErrorType.OnlyAfterNow]: '{field} must be later than now',
  [ErrorType.OnlyBeforeNow]: '{field} must be earlier than now',
  [ErrorType.OnlyAfterToday]: '{field} must be later than today',
  [ErrorType.OnlyBeforeToday]: '{field} must be earlier than today',

  [ErrorType.IsNotAnArray]: '{field} is not an array',
  [ErrorType.MaximumArrayLengthExceeded]: '{field} must be less than {max} elements',
  [ErrorType.LessThanMinimumArrayLength]: '{field} must be greater than {min} elements',
}

export type ValidateResult<F extends Record<keyof F, any>> = Partial<Record<keyof F, ErrorResult>>

export function validateField (value: unknown, rule: Rule, formData?: Record<string, unknown>): ErrorResult {
  const validateFn = validatorMap[rule?.type ?? 'any']
  const errors = validateFn(rule, value, formData)
    .map(errorType => typeof errorType === 'number' ? errorMessageMap[errorType] : errorType)
    .map(message => injectVariables(message, { field: rule.label ?? rule.type, ...rule }))
    .map(message => message.replace(/^\w/, c => c.toUpperCase()))
  return errors
}

export function validateForm<F extends Record<keyof F, unknown>> (data: F, validationSchema: ValidationSchema<F>): ValidateResult<F> {
  const errors: Partial<Record<keyof F, ErrorResult>> = {}
  for (const [fieldName, rule] of Object.entries(validationSchema) as [keyof F, Rule][]) {
    const fieldErrors = validateField(data[fieldName], rule, data)
    if (fieldErrors.length) errors[fieldName] = fieldErrors
  }
  return errors
}
