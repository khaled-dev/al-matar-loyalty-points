import authService from '../../src/services/auth.service'
import jwt from 'jsonwebtoken';
import { getMockReq } from '@jest-mock/express';


describe('cronJob', () => {

    describe('transaction', () => {
        it('should reject pending outdated transactions', async () => {
            const token = jwt.sign({ _id: 7, email: 'test@email.com' }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_TOKEN_EXPIRE })

            const authEmail : string =  authService.getAuthEmail(getMockReq({
                method: 'GET',
                headers: { authorization: 'Bearer ' + token },
            }))

            expect(authEmail).toEqual('test@email.com')
        })

    })

})



