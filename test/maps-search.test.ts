import { config } from 'dotenv'
import { describe } from '@jest/globals'
import { getPlaceAutocomplete } from '../src/maps-api'
import { getAutoCompleteDetails } from '../src'

config();

// These are end-to-end tests and need an api key
describe('Tomtom Places E2E Tests', () => {
    describe('getAutoCompleteDetails', () => {
        it ('returns a promise', () => {
            const res = getAutoCompleteDetails('Charlotte Street')
            expect(res).toBeInstanceOf(Promise)
        })

        it('can fetch from the autocomplete api', async () => {
            const res = await getAutoCompleteDetails('Charlotte Street')
            const firstRes = res[0];
            expect(firstRes).toHaveProperty('placeId')
            expect(firstRes).toHaveProperty('streetNumber')
            expect(firstRes).toHaveProperty('countryCode')
            expect(firstRes).toHaveProperty('country')
            expect(firstRes).toHaveProperty('freeformAddress')
            expect(firstRes).toHaveProperty('municipality')
        })
    })

    describe('getPlaceAutocomplete', () => {

        it('handles no results', async () => {
            const res = await getPlaceAutocomplete(process.env.TOMTOM_API_KEY, 'asfasffasfasafsafs');
            expect(res).toStrictEqual([])
        })

        it('handles error', async () => {
            expect(getPlaceAutocomplete(process.env.TOMTOM_API_KEY, '')).rejects.toThrow()
        })
    })

})
