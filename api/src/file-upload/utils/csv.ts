import * as fs from 'fs';
import { parse } from 'csv-parse';
import { BadRequestException } from '@nestjs/common';

export async function readCSV(
  filePath: string,
): Promise<{ headers: string[]; data: string[][] }> {
  return new Promise((resolve, reject) => {
    const allRows: string[][] = [];

    fs.createReadStream(filePath)
      .pipe(
        parse({
          delimiter: ',',
          trim: true,
        }),
      )
      .on('data', (data: string[]) => {
        allRows.push(data);
      })
      .on('error', (error: Error) => {
        reject(new BadRequestException(`Error parsing CSV: ${error.message}`));
      })
      .on('end', () => {
        if (allRows.length === 0) {
          resolve({ headers: [], data: [] });
          return;
        }
        const [headers, ...data] = allRows;
        resolve({ headers, data });
      });
  });
}
