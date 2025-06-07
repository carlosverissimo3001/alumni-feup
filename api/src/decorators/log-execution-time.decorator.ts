import { Logger } from '@nestjs/common';

export function LogExecutionTime() {
  return (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): void => {
    const original = descriptor.value as (...args: unknown[]) => unknown;

    descriptor.value = async function (...args: unknown[]) {
      const logger = new Logger((target as Record<string, unknown>).constructor.name);
      const start = Date.now();
      try {
        // eslint-disable-next-line @typescript-eslint/return-await
        return await original.apply(this, args);
      } finally {
        const duration = Date.now() - start;
        logger.log(`${String(propertyKey)} executed in ${duration}ms`);
      }
    };
  };
}
