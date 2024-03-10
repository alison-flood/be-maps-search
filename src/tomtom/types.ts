export type Address = {
  streetNumber?: string;
  streetName: string;
  municipality: string;
  municipalitySubdivision: string;
  municipalitySecondarySubdivision: string;
  neighbourhood: string;
  countrySecondarySubdivision: string;
  countryTertiarySubdivision: string;
  countrySubdivision: string;
  countrySubdivisionName?: string;
  countrySubdivisionCode: string;
  postalCode: string;
  postalName: string;
  extendedPostalCode: string;
  countryCode: string;
  country: string;
  countryCodeISO3: string;
  freeformAddress: string;
  localName: string;
};

export type LatLon = {
  lat: number;
  lon: number;
};

export type TimeRangeTime = {
  date: string;
  hour: number;
  minute: number;
};

export type TimeZone = {
  ianaId: string;
};

export type POI = {
  name: string;
  phone: string;
  brands: Array<{
    name: string;
  }>;
  url: string;
  categorySet: Array<{
    id: number;
  }>;
  openingHours: {
    mode: string;
    timeRanges: Array<{
      startTime: TimeRangeTime;
      endTime: TimeRangeTime;
    }>;
  };
  classifications: Array<{
    code: string;
    names: Array<{
      nameLocale: string;
      name: string;
    }>;
  }>;
  timeZone: TimeZone;
};

export type Mapcode = {
  type: 'Local' | 'International' | 'Alternative';
  fullMapcode: string;
  territory: string;
  code: string;
};

export enum FuelType {
  petrol = 'Petrol',
  lpg = 'LPG',
  diesel = 'Diesel',
  biodiesel = 'Biodiesel',
  commdiesel = 'DieselForCommercialVehicles',
  e85 = 'E85',
  lng = 'LNG',
  cng = 'CNG',
  hydrogen = 'Hydrogen',
  adblue = 'AdBlue',
}

export enum EntityType {
  country = 'Country',
  countrySubdivision = 'CountrySubdivision',
  countrySecondarySubdivision = 'CountrySecondarySubdivision',
  countryTertiarySubdivision = 'CountryTertiarySubdivision',
  municipality = 'Municipality',
  municipalitySubdivision = 'MunicipalitySubdivision',
  municipalitySecondarySubdivision = 'MunicipalitySecondarySubdivision',
  neighbourhood = 'Neighbourhood',
  postalCodeArea = 'PostalCodeArea',
}

export enum ResultType {
  poi = 'POI',
  street = 'Street',
  georgraphy = 'Geography',
  pointAddress = 'Point Address',
  addressRange = 'Address Range',
  crossStreet = 'Cross Street',
}

export enum RelationType {
  child = 'child',
  parent = 'parent',
}

export enum EntryPointType {
  main = 'main',
  minor = 'minor',
}

export enum QueryIntentType {
  coordinate = 'COORDINATE',
  nearby = 'NEARBY',
  w3w = 'W3W',
  bookmark = 'BOOKMARK',
}

export enum QueryType {
  nearby = 'NEARBY',
  nonNear = 'NON_NEAR',
}

export type FuzzySearchResult = {
  type: ResultType;
  id: string;
  score: number;
  info: string;
  dist?: number;
  entityType?: EntityType;
  poi?: POI;
  relatedPois: {
    relationType: RelationType;
    id: string;
  };
  address: Address;
  position: LatLon;
  mapcodes?: Array<Mapcode>;
  boundingBox?: {
    topLeftPoint: LatLon;
    btmRightPoint: LatLon;
  };
  entryPoints?: Array<{
    type: EntryPointType;
    functions: Array<string>;
    position: LatLon;
  }>;
  addressRanges?: {
    rangeLeft: string;
    rangeRight: string;
    from: LatLon;
    to: LatLon;
  };
  chargingPark?: {
    connectors: Array<{
      connectorType: string;
      ratedPowerKW: number;
      currentA: number;
      currentType: string;
      voltageV: number;
    }>;
  };
  dataSources?: {
    chargingAvailability: {
      id: string;
    };
    parkingAvailability: {
      id: string;
    };
    fuelPrice: {
      id: string;
    };
    geometry: {
      id: string;
      sourceName: string;
    };
  };
  fuelTypes?: Array<FuelType>;
  vehicleTypes?: {};
  viewport: {
    topLeftPoint: LatLon;
    btmRightPoint: LatLon;
  };
};

export type QueryIntentCoordinateIntent = LatLon;

export type QueryIntentNearbyIntent = LatLon & {
  query: string;
  text: string;
};

export type QueryIntentW3WIntent = {
  address: string;
};

export type QueryIntentBookmarkIntent = {
  bookmark: string;
};

export type QueryIntentDetails =
  | QueryIntentBookmarkIntent
  | QueryIntentCoordinateIntent
  | QueryIntentNearbyIntent
  | QueryIntentW3WIntent;

export type QueryIntent = {
  type: QueryIntentType;
  details: QueryIntentDetails;
};

export type ErrorResponse = {
  errorText: string;
  detailedError: {
    code: string;
    message: string;
    target: string;
  };
  httpStatusCode: string;
};

export type SuccessResponse = {
  summary: {
    query: string;
    queryType: QueryType;
    queryTime: number;
    numResults: number;
    offset: number;
    totalresults: number;
    fuzzyLevel: number;
    geoBias: LatLon;
    queryIntent: Array<QueryIntent>;
  };
  results: Array<FuzzySearchResult>;
};

export type FuzzySearchResponse = SuccessResponse | ErrorResponse;

export function isSuccessResponse(
  response: FuzzySearchResponse,
): response is SuccessResponse {
  return (response as SuccessResponse).results !== undefined;
}
