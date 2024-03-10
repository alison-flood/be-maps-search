import winston from 'winston';
import { TomTomClient } from './tomtom/client';
import {
  FuzzySearchResponse,
  isSuccessResponse,
  ResultType,
} from './tomtom/types';
import { AutoCompleteResult } from './types';

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [new winston.transports.Console()], // @todo add transport for Sentry / CloudWatch / database etc
});

export type AutoCompleteOptions = {
  limit?: number;
  countryCode?: string;
  locationTypes?: Array<ResultType>;
};

export async function getAutoCompleteDetails({
  address,
  options,
}: {
  address: string;
  options?: AutoCompleteOptions;
}): Promise<AutoCompleteResult> {
  const apiKey = process.env.TOMTOM_API_KEY;
  const apiBaseUrl = process.env.TOMTOM_API_BASE_URL;
  const apiVersion = process.env.TOMTOM_API_VERSION;
  if (!apiKey || !apiBaseUrl || !apiVersion) {
    throw new MissingConfigError(
      'Missing TomTom API configuration.  Have you set up your .env file?',
    );
  }

  if (address.length < 1) {
    throw new InvalidArgumentError({
      message: 'Address cannot be empty.',
      field: 'address',
    });
  }

  const tomtom = new TomTomClient({
    apiKey,
    apiBaseUrl,
    apiVersion,
    logger,
  });

  // get autocomplete results
  let res: FuzzySearchResponse;
  try {
    res = await tomtom.fuzzySearch({ address, options });
  } catch (error) {
    // log error
    logger.error(error);
    throw error;
  }

  if (!isSuccessResponse(res)) {
    logger.error({
      message: res.errorText,
      statusCode: res.httpStatusCode,
      detail: res.detailedError,
    });
    throw new Error(res.errorText);
  }

  // To take a partial address input and return full address suggestions along with the address broken into its individual components using the TomTom API.
  // 4. The result elements should contain important information about the place (country, municipality, etc)
  // 5. The returned result should be typed and easily consumable via users of the library
  // loop over and get details and map results
  return {
    searchAddress: address,
    foundAddresses: res.results.map((result) => ({
      placeId: result.id,
      type: result.type,
      ...result.address,
    })),
  };
}
