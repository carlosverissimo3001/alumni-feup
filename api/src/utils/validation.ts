import { Transform } from 'class-transformer';
import { ValidationPipe } from '@nestjs/common';
import { ValidateIf } from 'class-validator';

export const VALIDATION_CONFIG = new ValidationPipe({
  whitelist: true,
  transform: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
  forbidNonWhitelisted: true,
});

export function toBoolean(value: any): any {
  if (typeof value === 'boolean') {
    return value;
  }
  if (
    typeof value === 'string' &&
    ['true', 'false'].includes(value.toLowerCase())
  ) {
    return value.toLowerCase() === 'true';
  }
  return value;
}

export const TransformToArray = () =>
  Transform(({ value }: { value: string | string[] }) => {
    if (Array.isArray(value)) {
      return value;
    }
    return value?.split(',') || value;
  });

export const IsNotNullableOptional = () => {
  return ValidateIf((object, value) => value !== undefined, {
    message: 'This field is required',
  });
};
