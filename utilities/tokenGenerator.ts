import { sign } from "jsonwebtoken";
import { CustomJwtPayload, ErrorCode } from "../types";
import { GraphQLError } from "graphql";

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

    return {accessToken, refreshToken}

}