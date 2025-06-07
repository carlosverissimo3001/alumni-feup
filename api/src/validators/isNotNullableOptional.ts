import { ValidateIf } from 'class-validator';

/**
 * Forces the field to be not null if it is not undefined
 * @returns The validator function
 */
export const IsNotNullableOptional = () => {
  return ValidateIf((_object, value) => value !== undefined, {
    message: 'This field is required',
  });
};
