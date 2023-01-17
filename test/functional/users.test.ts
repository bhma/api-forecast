import { User } from "@src/models/user";
import AuthService from '@src/services/auth';
import { response } from "express";

describe('Users functional tests', () => {
    beforeEach(async () => {
        await User.deleteMany({});
    });
    describe('When creating a new user', () => {
        it('should successfully create a new user with encrypted password', async () => {
            const newUser = {
                name: 'jhon Doe',
                email: 'jhon@email.com',
                password: '12345'
            }

            const response = await global.testRequest.post('/users').send(newUser);
            expect(response.statusCode).toBe(201);
            await expect(AuthService.comparePasswords(newUser.password, response.body.password)).resolves.toBeTruthy();
            expect(response.body).toEqual(expect.objectContaining({...newUser, ...{password: expect.any(String)}}));
        });

        it('should return 422 when there are validation error', async () => {
            const newUser = {
                email: 'jhon@email.com',
                password: '12345'
            };
            const response = await global.testRequest.post('/users').send(newUser);

            expect(response.status).toBe(422);
            expect(response.body).toEqual({
                code: 422,
                error: 'User validation failed: name: Path `name` is required.'
            });
        });

        it('should return 409 when the email already exists', async () => {
            const newUser = {
                name: 'John Doe',
                email: 'john@mail.com',
                password: '1234',
            };

            await global.testRequest.post('/users').send(newUser);
            const response = await global.testRequest.post('/users').send(newUser);

            expect(response.status).toBe(409);
            expect(response.body).toEqual({
                code: 409,
                error: 'User validation failed: email: already exists in the database.'
            })
        });
    });

    describe('When authenticating a user', () => {
        it('should generate a token to a valid user', async () => {
            const newUser = {
                name: 'John Doe',
                email: 'john@mail.com',
                password: '12345'
            };
            await new User(newUser).save();
            const response = await global.testRequest.post('/users/authenticate').send({email: newUser.email, password: newUser.password});

            expect(response.body).toEqual(expect.objectContaining({token: expect.any(String)}));
        });

        it('should return UNAUTHORIZED if the user with the given the email is not found', async () => {
            const response = await global.testRequest.post('/users/authenticate').send({
                email: 'some-email@mail.com',
                password: '1234'
            });

            expect(response.status).toBe(401);
        });

        it('should return UNAUTHORIZED if the user is found but the password does not match', async () => {
            const newUser = {
                name: 'John Doe',
                email: 'john@mail.com',
                password: '12345'
            };
            await new User(newUser).save();
            const response = await global.testRequest.post('/users/authenticate').send({
                email: newUser.email,
                password: 'different password'
            });
            expect(response.status).toBe(401);
        });

    });
});