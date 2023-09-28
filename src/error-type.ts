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
