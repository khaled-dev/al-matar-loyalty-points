import {Response} from "express";


const success = (res: Response, data : {} = {}, message : string = 'Request successful.', status : number = 200) : Response => {
    return res.status(status).json({
        message,
        data,
        status,
    })
}

const error = (res: Response, error : {} = {}, message : string = 'Request Failed', status : number = 500) : Response => {
    return res.status(status).json({
        message,
        error,
        status,
    })
}

const validation = (res: Response, error : {} = {}, message : string = 'Bad Request', status : number = 422) : Response => {
    return res.status(status).json({
        message,
        error,
        status,
    })
}

//TODO: authorization
//TODO: authontication

export default { success, error, validation};