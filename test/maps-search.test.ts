import { config } from 'dotenv';
import { describe } from '@jest/globals';
import { TomTomClient } from '../src/tomtom/client';
import { getAutoCompleteDetails } from '../src';
import winston from 'winston';
import { isSuccessResponse, ResultType, SuccessResponse } from '../src/tomtom/types';

config();

// These are end-to-end tests and need an api key
describe('Tomtom Places E2E Tests', () => {
  let apiKey;
  let apiVersion;
  let apiBaseUrl;
  let logger;

  beforeAll(() => {
    apiKey = process.env.TOMTOM_API_KEY;

    if (!apiKey) {
      fail('Missing TomTom API key.  Have you set up your .env file?');
    }
    apiVersion = process.env.TOMTOM_API_VERSION ?? 2;
    apiBaseUrl =
      process.env.TOMTOM_API_BASE_URL ?? 'https://api.tomtom.com/search';
    logger = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [new winston.transports.Console()], // @todo add transport for Sentry / CloudWatch / database etc
    });
  });

  describe('getAutoCompleteDetails', () => {
    it('returns a promise', () => {
      const res = getAutoCompleteDetails({ address: 'Charlotte Street' });
      expect(res).toBeInstanceOf(Promise);
    });

    it('can fetch from the autocomplete api', async () => {
      const res = await getAutoCompleteDetails({ address: 'Charlotte Street' });
      const firstRes = res.foundAddresses[0];
      expect(firstRes).toHaveProperty('placeId');
      expect(firstRes).toHaveProperty('countryCode');
      expect(firstRes).toHaveProperty('country');
      expect(firstRes).toHaveProperty('freeformAddress');
      expect(firstRes).toHaveProperty('municipality');
    });

    it.each([{ limit: 1 }, { limit: 1000 }, { limit: 20 }])(
      `can limit number of returned results to $limit`,
      async ({ limit }: { limit: number }) => {
        const res = await getAutoCompleteDetails({
          address: 'Charlotte Street',
          options: { limit },
        });
        expect(res).toHaveProperty('foundAddresses');
        expect(res.foundAddresses.length).toBeLessThanOrEqual(limit);
      },
    );

    it.each([{ limit: 0 }, { limit: -1 }, { limit: undefined }])(
      `throws error if limit < 1`,
      async ({ limit }: { limit: number | undefined }) => {
        expect(
          getAutoCompleteDetails({
            address: 'Charlotte Street',
            options: { limit },
          }),
        ).rejects.toThrow(
          `Invalid argument for 'limit': ${limit}.  Must be an integer >= 1`,
        );
      },
    );

    it.each([
      {
        address: 'Charlotte Street',
        expectedFields: [
          'placeId',
          'countryCode',
          'country',
          'freeformAddress',
          'municipality',
          'streetName',
        ],
      },
      {
        address: '100 Skyring',
        expectedFields: [
          'placeId',
          'countryCode',
          'country',
          'freeformAddress',
          'municipality',
          'streetName',
          'streetNumber',
        ],
      },
      {
        address: 'Australia',
        expectedFields: [
          'placeId',
          'countryCode',
          'country',
          'freeformAddress',
          'municipality',
        ],
      },
      {
        address: 'AU',
        expectedFields: [
          'placeId',
          'countryCode',
          'country',
          'freeformAddress',
        ],
      },
      {
        address: '123',
        expectedFields: [
          'placeId',
          'countryCode',
          'country',
          'freeformAddress',
        ],
      },
      {
        address: 'New Zealand',
        expectedFields: [
          'placeId',
          'countryCode',
          'country',
          'freeformAddress',
          'municipality',
        ],
      },
      {
        address: 'Empire State Building',
        expectedFields: [
          'placeId',
          'countryCode',
          'country',
          'freeformAddress',
          'municipality',
        ],
      },
      {
        address: '16A Mabel Street Toowoomba',
        expectedFields: [
          'placeId',
          'countryCode',
          'country',
          'freeformAddress',
          'municipality',
          'streetName',
          'streetNumber',
        ],
      },
      {
        address: '100, Skyring, Terrace, Newstead, QLD, Australia',
        expectedFields: [
          'placeId',
          'countryCode',
          'country',
          'freeformAddress',
          'municipality',
          'streetName',
          'streetNumber',
        ],
      },
      {
        address: '4000',
        expectedFields: [
          'placeId',
          'countryCode',
          'country',
          'freeformAddress',
        ],
      },
    ])(
      'returns autocomplete addresses for partial address $address',
      async ({
        address,
        expectedFields,
      }: {
        address: string;
        expectedFields: Array<string>;
      }) => {
        const res = await getAutoCompleteDetails({
          address,
          options: { countryCode: 'AU' },
        });
        // console.log(res);
        const firstRes = res.foundAddresses[0];
        for (const expectedField of expectedFields) {
          expect(firstRes).toHaveProperty(expectedField);
        }
      },
    );

    it.each([
      { address: 'Charlotte Street' },
      { address: '100 Skyring' },
      { address: 'Australia' },
      { address: 'AU' },
      { address: '123' },
      { address: 'New Zealand' },
      { address: 'Empire State Building' },
      { address: '16A Mabel Street Toowoomba' },
      { address: '100, Skyring, Terrace, Newstead, QLD, Australia' },
      { address: '4000' },
    ])(
      'returns only autocompleted Point Addresses for address $address when ResultType is specified',
      async ({ address }: { address: string }) => {
        const res = await getAutoCompleteDetails({
          address,
          options: {
            countryCode: 'AU',
            locationTypes: [ResultType.pointAddress],
          },
        });
        
      for (const result of res.foundAddresses) {
        expect(result.type).toEqual(ResultType.pointAddress);
      }
      },
    );

    it('returns only AU addresses', async () => {
      const res = await getAutoCompleteDetails({
        address: 'Charlotte Street',
        options: { countryCode: 'AU' },
      });
      for (const result of res.foundAddresses) {
        expect(result.country).toEqual('Australia');
      }
    });
  });

  describe('getPlaceAutoComplete', () => {
    let tomtom: TomTomClient;

    beforeAll(() => {
      tomtom = new TomTomClient({ apiKey, apiVersion, apiBaseUrl, logger });
    });

    it('handles no results', async () => {
      const res = await tomtom.fuzzySearch({
        address: 'asfasffasfasafsafs',
      });
      expect((res as SuccessResponse).results).toStrictEqual([]);
    });

    it('handles error', async () => {
      expect(tomtom.fuzzySearch({ address: '' })).rejects.toThrow();
    });
  });
});
