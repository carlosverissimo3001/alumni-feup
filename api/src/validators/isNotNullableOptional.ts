import { ValidateIf } from 'class-validator';

export const IsNotNullableOptional = () => {
  return ValidateIf((_object, value) => value !== undefined, {
    message: 'This field is required',
  });
};
