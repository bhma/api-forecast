import { Beach } from "@src/models/beach";

describe('Beaches functional testes', () => {
    beforeAll(async () => await Beach.deleteMany({}));
    describe('When creating a beach', () => {
        it('should create a beach with success', async () => {
            const newBeach = {
                lat: -33.792726,
                lng: 151.289824,
                name: 'Manly',
                position: 'E',
            };
            const response = await global.testRequest.post('/beaches').send(newBeach);
            //Object containing matches the keys and values, even if includes other keys such as id.
            expect(response.status).toBe(201);
            expect(response.body).toEqual(expect.objectContaining(newBeach));
            // expect(response.body).toEqual(newBeach);
        });
    });
});