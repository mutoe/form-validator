import { ErrorType } from 'src/error-type'

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
