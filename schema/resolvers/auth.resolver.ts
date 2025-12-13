import { SignOptions, sign } from 'jsonwebtoken'
import verifyUser from '../../utilities/verifyUser';
import { CustomJwtPayload, ErrorCode, FormError, UserRole, ValidateSchema } from '../../typeDefs';
import validateForm from '../../utilities/validateForm';
import User from '../../dataLayer/schema/User';
import bcrypt from 'bcrypt'
import { GraphQLError } from 'graphql';
const authResolver = {
  Mutation: {
    logInAdmin: async (parent: any, args: any, context: any) => {

      const { email, password } = args.input

      if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
        const payload: CustomJwtPayload = {
          role: UserRole.ADMIN,
          id: process.env.ADMIN_ID as string
        }

        const signOptions: SignOptions = {
          expiresIn: '4h'
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
      }
      else {
        throw new Error('Bad Credentials')
      }

    },
    logInUser: async (parent: any, args: any, context: any) => {

      try {
        const { email, password } = args.input

        const validateSchema: ValidateSchema<any>[] = [
          { value: email, name: 'email', type: 'email' },
          { value: password, name: 'password', type: 'string' },
        ]
        const errors: FormError = validateForm(validateSchema)
        if (Object.keys(errors).length > 0) {
          throw new Error(ErrorCode.VALIDATION_ERROR)
        }

        const user = await User.findOne({ email: email.toLowerCase() })


        if (!user) {
          throw new Error(ErrorCode.USER_NOT_FOUND)
        }

        if (user.role !== UserRole.CUSTOMER) {
          throw new Error(ErrorCode.WRONG_USER_TYPE)
        }

        const isMatched = await bcrypt.compare(password, user.password)

        if (!isMatched) {
          throw new Error(ErrorCode.BAD_CREDENTIALS)

        }

        const payload: CustomJwtPayload = {
          role: UserRole.CUSTOMER,
          id: user.id
        }

        const signOptions: SignOptions = {
          expiresIn: '4h'
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

      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message || ErrorCode.INTERNAL_SERVER_ERROR)
        }
      }
    },

    changePassWord: async (parent: any, args: any, context: any) => {

      try {

        await new Promise(resolve=>setTimeout(resolve, 3000))
        if (!context.token) {
          throw new Error(ErrorCode.NOT_AUTHENTICATED)
        }
        const verifiedUser = verifyUser(context.token)
        if (!verifiedUser) {
          throw new Error(ErrorCode.NOT_AUTHENTICATED)
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
        throw new Error(JSON.stringify(errors))
      }

        const user = await User.findById(id)

        if (!user) {
          throw new Error(ErrorCode.USER_NOT_FOUND)
        }

        const isMatched = await bcrypt.compare(currentPassword, user.password)

        if (!isMatched) {
          throw new Error(ErrorCode.INPUT_ERROR)
        }

        const salt = bcrypt.genSaltSync(8)
        const hashedPassword = bcrypt.hashSync(newPassword, salt)

        await User.findByIdAndUpdate(id, {
          password: hashedPassword
        })

        return true


      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message || ErrorCode.INTERNAL_SERVER_ERROR)
        }
      }
    },

  },
  Query: {
    getAuthStatus: (parent: any, args: any, context: any) => {

      try {
        if (!context.token) {
          return { isLoggedIn: false }
        }
        const user = verifyUser(context.token)
        if (!user) {
          return { isLoggedIn: false, user: null }
        }
        return { isLoggedIn: true, user: user }
      }
      catch (error) {
        if (error instanceof Error) {
          throw new GraphQLError(error.message, {
            extensions: {
              code: ErrorCode.INTERNAL_SERVER_ERROR
            }
          })
        }
      }
    }
  },
};

export default authResolver