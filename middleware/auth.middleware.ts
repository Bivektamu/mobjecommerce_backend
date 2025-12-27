import { Request } from 'express'

export const getAuth = (req: Request) => {
    const accessToken = req.cookies.access_token
    const refreshToken = req.cookies.refresh_token
    console.log(accessToken, refreshToken)
    return null
// throw new Error('working')
}