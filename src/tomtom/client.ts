import axios from 'axios';
import { Logger } from 'winston';
import { AutoCompleteOptions } from '..';
import { AutoCompletePlace } from '../types';
import { FuzzySearchResponse, isSuccessResponse } from './types';

export class TomTomClient {
  apiKey: string;
  apiVersion: string;
  apiBaseUrl: string;
  logger: Logger;

  constructor({
    apiKey,
    apiVersion,
    apiBaseUrl,
    logger,
  }: {
    apiKey: string;
    apiVersion: string;
    apiBaseUrl: string;
    logger: Logger;
  }) {
    this.apiKey = apiKey;
    this.apiBaseUrl = apiBaseUrl;
    this.apiVersion = apiVersion;
    this.logger = logger;
  }

  // https://developer.tomtom.com/search-api/documentation/search-service/fuzzy-search
  async fuzzySearch({
    address,
    options,
  }: {
    address: string;
    options?: AutoCompleteOptions;
  }): Promise<FuzzySearchResponse> {
    if (
      options?.hasOwnProperty('limit') &&
      (options?.limit === undefined || options?.limit < 1)
    ) {
      throw new InvalidArgumentError({
        message: `Invalid argument for 'limit': ${options?.limit}.  Must be an integer >= 1`,
        field: 'limit',
      });
    }
    const { data: autocomplete } = await axios.get(
      `${this.apiBaseUrl}/${this.apiVersion}/search/${address}.json`,
      {
        params: {
          key: this.apiKey,
          limit: options ? options.limit : 100,
          ...(options?.countryCode ? { countrySet: options?.countryCode } : {}),
        },
      },
    );

    if (!isSuccessResponse(autocomplete)) {
      // @todo create a proper error class
      throw new Error(
        `Error response received for autocomplete request: ${autocomplete.errorText}`,
      );
    }

    let results = autocomplete.results;
    if (options?.locationTypes) {
      results = autocomplete.results.filter((result) => {
        return options.locationTypes?.includes(result.type);
      });
    }
    return {
      ...autocomplete,
      results,
    };
  }
}
