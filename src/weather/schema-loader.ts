import { readFileSync } from 'fs';
import { join } from 'path';

export const weatherSchema = readFileSync(
  join(__dirname, 'weather.graphql'),
  'utf-8'
);
