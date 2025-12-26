import { SignOptions, sign } from 'jsonwebtoken'
import verifyUser from '../../utilities/verifyUser';
import { CustomJwtPayload, ErrorCode, FormError, UserRole, ValidateSchema } from '../../typeDefs';
import validateForm from '../../utilities/validateForm';
import User from '../../dataLayer/schema/User';
import bcrypt from 'bcrypt'
import { OAuth2Client } from 'google-auth-library'
import { GraphQLError } from 'graphql';
const authResolver = {
  Mutation: {
    logInAdmin: async (parent: any, args: any, context: any) => {

      const { email, password } = args.input

      if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
        throw new GraphQLError('Invalid Credentials', {
          extensions: {
            code: ErrorCode.BAD_CREDENTIALS
          }
        })
      }

      const payload: CustomJwtPayload = {
        role: UserRole.ADMIN,
        id: process.env.ADMIN_ID as string
      }

      const signOptions: SignOptions = {
        expiresIn: '1h'
      }
      const secret: string = process.env.JWTSECRET as string

      const token = sign(
        payload,
        secret,
        signOptions
      );

      return {
        token
      }

    },

    logInUser: async (parent: any, args: any, context: any) => {

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

      const isMatched = await bcrypt.compare(password, user.password as string)

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

      const signOptions: SignOptions = {
        expiresIn: '1h'
      }
      const secret: string = process.env.JWTSECRET as string

      const token = sign(
        payload,
        secret,
        signOptions
      );

      return {
        token
      }


    },
    logInGoogleUser: async (parent: any, args: any, context: any) => {
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
      const userExsits = await User.findOne({ email })

      const jwtPayload: CustomJwtPayload = {
        role: UserRole.CUSTOMER,
        id: userExsits?.id
      }

      if (!userExsits) {
        const user = new User({
          firstName: given_name,
          lastName: family_name,
          email,
          role: UserRole.CUSTOMER,
          googleId: sub
        })

        await user.save()
        jwtPayload.id = user.id
      }

      const signOptions: SignOptions = {
        expiresIn: '1h'
      }

      const secret: string = process.env.JWTSECRET as string

      const token = sign(
        jwtPayload,
        secret,
        signOptions
      )

      return {
        token
      }

    },
    changePassWord: async (parent: any, args: any, context: any) => {

      if (!context.token) {
        throw new GraphQLError('Not Authenticated', {
          extensions: {
            code: ErrorCode.NOT_AUTHENTICATED
          }
        })
      }
      const verifiedUser = verifyUser(context.token)
      if (!verifiedUser) {
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
            code: ErrorCode.NOT_AUTHENTICATED,
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

  },
  Query: {
    getAuthStatus: (parent: any, args: any, context: any) => {
      if (!context.token) {
        throw new GraphQLError('Not Authenticated', {
          extensions: {
            code: ErrorCode.NOT_AUTHENTICATED
          }
        })
      }
      const user = verifyUser(context.token)
      if (!user) {
        throw new GraphQLError('User not verified', {
          extensions: {
            code: ErrorCode.NOT_AUTHENTICATED
          }
        })
      }
      return { isLoggedIn: true, user: user }
    }
  },
};

export default authResolver