import verifyUser from "../utilities/verifyUser"
import { sign } from "jsonwebtoken";
import { CustomJwtPayload, ErrorCode } from "../types";
import { GraphQLError } from "graphql";
import { Request, Response } from 'express'


export const getAuth = (access_token: string) => {
    if (!access_token) return null
    const JWT_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET || null // because in serverless environment this variable is gurranted to run and be available at runtime but not sure in build time
    const auth = verifyUser(access_token, JWT_SECRET)
    return auth
}

export const createJwtTokens = (payload: CustomJwtPayload) => {
    const JWT_ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET // because in serverless environment this variable is gurranted to run and be available at runtime but not sure in build time

    const JWT_REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET

    if (!JWT_ACCESS_TOKEN_SECRET || !JWT_REFRESH_TOKEN_SECRET) {
        throw new GraphQLError('Jwt Secret not defined', {
            extensions: {
                code: ErrorCode.JWT_TOKEN_MISSING
            }
        })
    }

    const accessToken = sign(
        payload,
        JWT_ACCESS_TOKEN_SECRET,
        {
            expiresIn: '15m'
        }
    );

    const refreshToken = sign(
        payload,
        JWT_REFRESH_TOKEN_SECRET,
        {
            expiresIn: '7d'
        }
    );

    return { accessToken, refreshToken }

}

export const setCookies = (res: Response, accessToken: string, refreshToken: string) => {

    res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
        path: '/graphql'
    })


    res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/graphql'
    })

}

export const resetCookies = (res: Response) => {
    res.clearCookie('access_token', {
        path: '/graphql'
    })

    res.clearCookie('refresh_token', {
        path: '/graphql'
    })
}