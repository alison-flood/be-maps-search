import { Address, FuzzySearchResult } from './tomtom/types';

export type AutoCompletePlace = Omit<Address, 'id'> & { placeId: string } & Pick<FuzzySearchResult, 'type'>;

export type AutoCompleteResult = {
  searchAddress: string;
  foundAddresses: Array<AutoCompletePlace>;
};
