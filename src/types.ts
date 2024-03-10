import { Address } from "./tomtom/types";

export type AutoCompletePlace = Omit<Address, 'id'> & { placeId: string };

export type AutoCompleteResult = {
  searchAddress: string;
  foundAddresses: Array<AutoCompletePlace>;
};
