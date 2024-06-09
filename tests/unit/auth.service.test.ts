import authService from '../../src/services/auth.service'
import jwt from 'jsonwebtoken';
import { getMockReq } from '@jest-mock/express';


describe('service', () => {
    describe('auth', () => {
        it('get auth email from a token', async () => {
            const token = jwt.sign({ id: 7, email: 'test@email.com' }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_TOKEN_EXPIRE })

            const authEmail : string =  authService.getAuthEmail(getMockReq({
                method: 'GET',
                headers: { authorization: 'Bearer ' + token },
            }))

            expect(authEmail).toEqual('test@email.com')
        })

        it('get auth id from a token', async () => {
            const token = jwt.sign({ id: 7, email: 'test@email.com' }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_TOKEN_EXPIRE })

            const authId : string =  authService.getAuthId(getMockReq({
                method: 'GET',
                headers: { authorization: 'Bearer ' + token },
            }))

            expect(authId).toEqual(7)
        })

        it('generate token by user id and email', async () => {

            const token : string =  authService.signAuth({ id: 7, email: 'test@email.com' })

            let decoded = jwt.verify(token, process.env.JWT_SECRET!)

            expect(decoded.id).toEqual(7)
            expect(decoded.email).toEqual('test@email.com')
        })
    })
})



