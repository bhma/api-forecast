import { StormGlass } from '@src/clients/stormGlass';
import axios from 'axios';
import stormglassNormalizedResponseFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json';
import stormglassWeatherPointFixture from '@test/fixtures/stormglass_weather_3_hours.json';


jest.mock('axios');

describe('StormGlass client', () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    it('should return the normalized forecast from the stormGlass service', async () => {
        const lat = 1.28333;
        const lng = 103.85;

        mockedAxios.get.mockResolvedValue({data: stormglassWeatherPointFixture});

        const stormGlass = new StormGlass(mockedAxios);
        const response = await stormGlass.fetchPoints(lat, lng);
        expect(response).toEqual(stormglassNormalizedResponseFixture);
    });

    it('should exclude incomplete data points', async () => {
        const lat = 1.28333;
        const lng = 103.85;
        const incompleteResponse = {
            hours: [
                {
                    windDirection: {
                        noaa: 300
                    },
                    time: '2020-04-26T00:00:00+00:00'
                }
            ]
        };

        mockedAxios.get.mockResolvedValue({ data: incompleteResponse });

        const stormGlass = new StormGlass(mockedAxios);
        const response = await stormGlass.fetchPoints(lat, lng);
        expect(response).toEqual([]);
    });

    it('should get an StormGlassResponseError when the StormGlass service responds with error', async () => {
        const lat = 1.28333;
        const lng = 103.85;
    });
});