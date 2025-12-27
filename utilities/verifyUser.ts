import { GraphQLError } from "graphql"
import { CustomJwtPayload, ErrorCode, User, UserRole, verifiedUser } from "../types"
import { JsonWebTokenError, TokenExpiredError, verify } from "jsonwebtoken"


const verifyUser = (token: string) => {

    const JWT_SECRET = process.env.JWTSECRET // because in serverless environment this variable is gurranted to run and be available at runtime but not sure in build time

    if (!JWT_SECRET) {
        throw new GraphQLError('Jwt Secret not defined', {
            extensions: {
                code: ErrorCode.JWT_TOKEN_MISSING
            }
        })
    }
    try {
        const verifiedUser: CustomJwtPayload = verify(token, JWT_SECRET) as CustomJwtPayload

        const user: verifiedUser = {
            role: verifiedUser.role,
            id: verifiedUser.id
        }
        return user
    } catch (error) {
        if (error instanceof TokenExpiredError) {
            throw new GraphQLError('Jwt Token expired', {
                extensions: {
                    code: ErrorCode.JWT_TOKEN_EXPIRED
                }
            })
        }
        else if (error instanceof JsonWebTokenError) {
            throw new GraphQLError('Invalid Jwt Token', {
                extensions: {
                    code: ErrorCode.JWT_TOKEN_INVALID
                }
            })
        }

        throw new GraphQLError('Server Error', {
            extensions: {
                code: ErrorCode.INTERNAL_SERVER_ERROR
            }
        })
    }
}

export default verifyUser