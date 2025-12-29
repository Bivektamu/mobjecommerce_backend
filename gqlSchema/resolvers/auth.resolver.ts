import { SignOptions, sign } from 'jsonwebtoken'
import verifyUser from '../../utilities/verifyUser';
import { CustomJwtPayload, ErrorCode, FormError, LoginInput, MyContext, UserRole, ValidateSchema } from '../../types';
import validateForm from '../../utilities/validateForm';
import User from '../../dataLayer/schema/User';
import bcrypt from 'bcrypt'
import { OAuth2Client } from 'google-auth-library'
import { GraphQLError } from 'graphql';
import { createJwtTokens, resetCookies, setCookies } from '../../middleware/auth.middleware';
const authResolver = {
  Mutation: {
    logInAdmin: async (_: any, args: LoginInput, context: MyContext) => {

      const { email, password } = args.input

      if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
        throw new GraphQLError('Invalid Credentials', {
          extensions: {
            code: ErrorCode.BAD_CREDENTIALS
          }
        })
      }
      const admin = await User.findOne({email})

      if(!admin) {
        throw new GraphQLError('Admin not created', {
          extensions: {
            code: ErrorCode.USER_NOT_FOUND
          }
        })
      }

      if(admin.role !== UserRole.ADMIN) {
        throw new GraphQLError('User not authorized', {
          extensions: {
            code: ErrorCode.WRONG_USER_TYPE
          }
        })
      }

      const payload: CustomJwtPayload = {
        role: UserRole.ADMIN,
        id: admin.id
      }

     const {accessToken, refreshToken} = createJwtTokens(payload)

     const {res} = context
     setCookies(res, accessToken, refreshToken)
     admin.refreshToken = refreshToken
     await admin.save()

     return {
      isLoggedIn: true,
      user: payload
     }
    },

    logInUser: async (_: any, args: LoginInput, context: MyContext) => {

      const { email, password } = args.input

      const validateSchema: ValidateSchema<any>[] = [
        { value: email, name: 'email', type: 'email' },
        { value: password, name: 'password', type: 'string' },
      ]
      const errors: FormError = validateForm(validateSchema)
      if (Object.keys(errors).length > 0) {
        throw new GraphQLError('Login fields error', {
          extensions: {
            code: ErrorCode.VALIDATION_ERROR,
            extra: errors
          }
        })
      }

      const user = await User.findOne({ email: email.toLowerCase() })

      if (!user) {
        throw new GraphQLError('User not found', {
          extensions: {
            code: ErrorCode.USER_NOT_FOUND,
          }
        })
      }

      if (user.role !== UserRole.CUSTOMER) {
        throw new GraphQLError('Wrong User type', {
          extensions: {
            code: ErrorCode.WRONG_USER_TYPE,
          }
        })
      }

      const isMatched = await bcrypt.compare(password as string, user.password as string)

      if (!isMatched) {
        throw new GraphQLError('Email or password wrong', {
          extensions: {
            code: ErrorCode.BAD_CREDENTIALS,
          }
        })
      }

      const payload: CustomJwtPayload = {
        role: UserRole.CUSTOMER,
        id: user.id
      }

      const { accessToken, refreshToken } = createJwtTokens(payload)

      user.refreshToken = refreshToken
      await user.save()

      const { res } = context

      setCookies(res, accessToken, refreshToken)

      return {
        isLoggedIn: true,
        user: user
      }

    },
    logInGoogleUser: async (parent: any, args: any, context: MyContext) => {
      const { credential } = args
      if (!credential) throw new GraphQLError('Goggle Credential not provided', {
        extensions: {
          code: ErrorCode.GOOGLE_ERROR
        }
      })

      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID as string
      })

      const payload = ticket.getPayload()
      if (!payload) throw new GraphQLError('Goggle verification failed', {
        extensions: {
          code: ErrorCode.GOOGLE_ERROR
        }
      })
      const { email, given_name, family_name, sub } = payload
      let user = await User.findOne({ email })

      const jwtPayload: CustomJwtPayload = {
        role: UserRole.CUSTOMER,
        id: user?.id
      }

      if (!user) {
        user = new User({
          firstName: given_name,
          lastName: family_name,
          email,
          role: UserRole.CUSTOMER,
          googleId: sub
        })

        await user.save()
        jwtPayload.id = user.id
      }

      const {accessToken, refreshToken} = createJwtTokens(jwtPayload)

      user.refreshToken = refreshToken
      await user.save()

      const {res} = context
      setCookies(res, accessToken, refreshToken)

      return {
        isLoggedIn: true,
        user: jwtPayload
      }
    },
    changePassWord: async (parent: any, args: any, context: MyContext) => {

      const { auth } = context
      if (!auth) {
        throw new GraphQLError('User not verified', {
          extensions: {
            code: ErrorCode.NOT_AUTHENTICATED
          }
        })
      }

      const { id, currentPassword, newPassword } = args.input

      const validateSchema: ValidateSchema<any>[] = [
        {
          value: newPassword,
          name: 'newPassword',
          msg: 'Please insert new password in correct format.',
          type: 'password'
        },
      ]
      const errors: FormError = validateForm(validateSchema)
      if (Object.keys(errors).length > 0) {
        throw new GraphQLError('Validation error', {
          extensions: {
            code: ErrorCode.VALIDATION_ERROR,
            extras: errors
          }
        })
      }

      const user = await User.findById(id)

      if (!user) {
        throw new GraphQLError('User not found', {
          extensions: {
            code: ErrorCode.USER_NOT_FOUND,
          }
        })
      }

      const isMatched = await bcrypt.compare(currentPassword, user.password as string)

      if (!isMatched) {
        throw new GraphQLError('Bad Credentials', {
          extensions: {
            code: ErrorCode.BAD_CREDENTIALS,
          }
        })
      }

      const salt = bcrypt.genSaltSync(8)
      const hashedPassword = bcrypt.hashSync(newPassword, salt)

      await User.findByIdAndUpdate(id, {
        password: hashedPassword
      })

      return true
    },

    logOutUser: async (_: any, args: any, context: MyContext) => {
      const { res, auth } = context
      const user = await User.findById(auth?.id)
      if (user) {
        user.refreshToken = ''
        await user.save()
      }
      resetCookies(res)
      return {
        isLoggedIn: false
      }
    },
    refreshToken: async (_: any, args: any, context: MyContext) => {
      const { req, res } = context
      const refresh_token = req.cookies.refresh_token
      if (!refresh_token) {
        throw new GraphQLError('Refresh token missing', {
          extensions: {
            code: ErrorCode.JWT_TOKEN_MISSING
          }
        })
      }
      const auth = verifyUser(refresh_token, process.env.JWT_REFRESH_TOKEN_SECRET || null)
      const user = await User.findById(auth.id)
      if(!user || user.refreshToken !== refresh_token) {
        resetCookies(res)
        throw new GraphQLError('Token Revoked', {
          extensions: {
            code: ErrorCode.TOKEN_REVOKED
          }
        })
      }

      const payload:CustomJwtPayload = {
        role: user.role as UserRole,
        id:user.id
      }
      const {accessToken, refreshToken} = createJwtTokens(payload)
      user.refreshToken = refreshToken
      await user.save()
      setCookies(res, accessToken, refreshToken)

      return {
        isLoggedIn: true,
        user:payload
      }

    }
  },
  Query: {
    getAuthStatus: async (_: any, args: any, context: MyContext) => {
      const { auth } = context
      if (!auth) return { isLoggedIn: false }
      return {
        isLoggedIn: true,
        user: auth
      }
    }
  },
};

export default authResolver