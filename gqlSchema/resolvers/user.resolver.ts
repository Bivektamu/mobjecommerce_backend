import User from "../../dataLayer/schema/User";
import { Address, ErrorCode, FormError, MyContext, UserRole, ValidateSchema } from "../../types";
import validateForm from "../../utilities/validateForm";
import bcrypt from 'bcrypt'
import verifyUser from "../../utilities/verifyUser";
import { GraphQLError } from "graphql";

const userRresolver = {
  Query: {
    users: async (parent: any, args: any, context: MyContext) => {
      const { auth } = context
      if (!auth) {
        throw new GraphQLError('User not verfied', {
          extensions: {
            code: ErrorCode.NOT_AUTHENTICATED
          }
        })
      }

      if (auth.role !== UserRole.ADMIN) {
        throw new GraphQLError('User not authorized', {
          extensions: {
            code: ErrorCode.WRONG_USER_TYPE
          }
        })
      }
      const users = await User.find()
      return users
    },
    user: async (parent: any, args: any, context: MyContext) => {

      const { auth } = context
      if (!auth) {
        throw new GraphQLError('User not verfied', {
          extensions: {
            code: ErrorCode.NOT_AUTHENTICATED
          }
        })
      }
      const id = args.id

      const findUser = await User.findById(id)
      return findUser
    },
    userEmail: async (parent: any, args: any) => {
      const id = args.id
      const finduser = await User.findById(id)
      if (!finduser) {
        throw new GraphQLError('User not found', {
          extensions: {
            code: ErrorCode.USER_NOT_FOUND
          }
        })
      }
      return finduser.email
    },
    publicUserDetails: async (parent: any, args: any) => {
      const id = args.id
      const finduser = await User.findById(id)
      if (!finduser) {
        throw new GraphQLError('User not found', {
          extensions: {
            code: ErrorCode.USER_NOT_FOUND
          }
        })
      }
      const user = {
        firstName: finduser.firstName,
        lastName: finduser.lastName,
      }
      return user
    },

  },

  Mutation: {
    createUser: async (parent: any, args: any) => {
      const { email, password, firstName, lastName } = args.input

      const validateSchema: ValidateSchema<any>[] = [
        { value: firstName, name: 'firstName', type: 'string' },
        { value: lastName, name: 'lastName', type: 'string' },
        { value: email, name: 'email', type: 'email' },
        { value: password, name: 'password', type: 'password' },
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

      const userExists = await User.findOne({ email: email.toLowerCase() })
      if (userExists) {
        throw new GraphQLError('User already exists', {
          extensions: {
            code: ErrorCode.ALREADY_EXISTS,
          }
        })
      }

      const user = new User({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password,
        role: UserRole.CUSTOMER
      })

      const salt = bcrypt.genSaltSync(8)

      user.password = bcrypt.hashSync(password, salt)

      return await user.save()
    },

    deleteUser: async (parent: any, args: any, context: MyContext) => {
      const { auth } = context
      if (!auth) {
        throw new GraphQLError('User not verfied', {
          extensions: {
            code: ErrorCode.NOT_AUTHENTICATED
          }
        })
      }
      const { id } = args

      const deletedUser = await User.findByIdAndDelete(id)
      if (deletedUser) {
        return {
          success: true,
        }
      }
      throw new GraphQLError('User not found', {
        extensions: {
          code: ErrorCode.USER_NOT_FOUND
        }
      })

    },
    updateAddress: async (parent: any, args: any, context: MyContext) => {
      const { auth } = context
      if (!auth) {
        throw new GraphQLError('User not verfied', {
          extensions: {
            code: ErrorCode.NOT_AUTHENTICATED
          }
        })
      }

      if (auth.role !== UserRole.ADMIN) {
        throw new GraphQLError('User not authorized', {
          extensions: {
            code: ErrorCode.WRONG_USER_TYPE
          }
        })
      }

      const { street, city, state, postcode, country } = args.input

      const validateSchema: ValidateSchema<any>[] = [
        { value: street, name: 'street', type: 'string' },
        { value: city, name: 'city', type: 'string' },
        { value: state, name: 'state', type: 'string' },
        { value: postcode, name: 'postcode', type: 'string', required: false },
        { value: country, name: 'country', type: 'string' },
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
      const finduser = await User.findById(auth.id)
      if (!finduser) {
        throw new GraphQLError('User not found', {
          extensions: {
            code: ErrorCode.USER_NOT_FOUND
          }
        })
      }
      const address: Address = {
        street, city, state, country, postcode
      }

      const updateStatus = await User.updateOne(
        { _id: auth.id },
        {
          $set: {
            address
          }

        }
      )

      const { acknowledged, modifiedCount } = updateStatus
      if (acknowledged && modifiedCount === 1) {
        return address
      }

    },

    updateAccount: async (parent: any, args: any, context: MyContext) => {

      const { auth } = context
      if (!auth) {
        throw new GraphQLError('User not verfied', {
          extensions: {
            code: ErrorCode.NOT_AUTHENTICATED
          }
        })
      }

      if (auth.role !== UserRole.ADMIN) {
        throw new GraphQLError('User not authorized', {
          extensions: {
            code: ErrorCode.WRONG_USER_TYPE
          }
        })
      }

      const { firstName, lastName, email } = args.input

      const validateSchema: ValidateSchema<any>[] = [
        { value: firstName, name: 'firstName', type: 'string' },
        { value: lastName, name: 'lastName', type: 'string' },
        { value: email, name: 'email', type: 'email' },
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
      const finduser = await User.findById(auth.id)
      if (!finduser) {
        throw new GraphQLError('User not found', {
          extensions: {
            code: ErrorCode.USER_NOT_FOUND
          }
        })
      }

      const updatedUser = await User.findByIdAndUpdate(
        auth.id,
        {
          firstName,
          lastName,
          email
        },
        { new: true }
      )

      return updatedUser
    }

  }
};

export default userRresolver