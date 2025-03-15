import { JobOptions } from 'bull';
import { Alumni } from './entities';

export enum QueueName {
  BRIGHTDATA = 'brightdata',
  GEOLOCATION = 'geolocation',
}

export enum GROUP_BY {
  COUNTRIES = 'countries',
  CITIES = 'cities',
}

export enum Job {
  BATCH_SCRAPE = 'batch-scrape',
  SCRAPE = 'scrape',
  EXTRACT_COORDINATES = 'extract-coordinates',
}

export const Jobs = {
  brightdata: {
    SCRAPE: 'brightdata_scrape',
    BATCH_SCRAPE: 'brightdata_batch_scrape',
  },
  geolocation: {
    EXTRACT_COORDINATES: 'geolocation_extract_coordinates',
  },
} as const;

type SCRAPE_LINKEDIN_DATA = {
  alumni: Alumni;
};

export type JobDataMap = {
  [Jobs.brightdata.SCRAPE]: SCRAPE_LINKEDIN_DATA;
};

export const DEFAULT_JOB_OPTIONS: JobOptions = {
  delay: 1000,
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000,
  },
};

export type JobReturn = {
  status: 'success' | 'incomplete' | 'error';
  message?: string;
};

export type GeoLocationApiResponse = {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
};
