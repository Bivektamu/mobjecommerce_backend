import User from "../../dataLayer/schema/User";
import { Address, AddressInput, ErrorCode, FormError, InputId, MyContext, UserRole, ValidateSchema } from "../../types";
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
    user: async (parent: any, args: InputId, context: MyContext) => {

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
      if(!findUser) {
         throw new GraphQLError('User not found', {
          extensions: {
            code: ErrorCode.USER_NOT_FOUND
          }
        })
      }
      return findUser
    },

    userAddresses: async (parent: any, args: any, context: MyContext) => {

      const { auth } = context
      if (!auth) {
        throw new GraphQLError('User not verfied', {
          extensions: {
            code: ErrorCode.NOT_AUTHENTICATED
          }
        })
      }
      const id = auth.id

      const user = await User.findById(id)
      if (!user) {
        throw new GraphQLError('User not found', {
          extensions: {
            code: ErrorCode.USER_NOT_FOUND
          }
        })
      }
      return user.address
    },
    userAddress: async (parent: any, args: InputId, context: MyContext) => {
      const { auth } = context
      if (!auth) {
        throw new GraphQLError('User not verfied', {
          extensions: {
            code: ErrorCode.NOT_AUTHENTICATED
          }
        })
      }
      const user = await User.findById(auth.id)
      if (!user) {
        throw new GraphQLError('User not found', {
          extensions: {
            code: ErrorCode.USER_NOT_FOUND
          }
        })
      }


      const address = user.address.filter(item => item.id === args.id)

      if (address.length < 1) {
        throw new GraphQLError('Address not found', {
          extensions: {
            code: ErrorCode.NOT_FOUND
          }
        })
      }
      return address[0]
    },
    userEmail: async (parent: any, args: any) => {
      const id = args.id
      const user = await User.findById(id)
      if (!user) {
        throw new GraphQLError('User not found', {
          extensions: {
            code: ErrorCode.USER_NOT_FOUND
          }
        })
      }
      return user.email
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
    updateAddressById: async (parent: any, args: AddressInput, context: MyContext) => {
      const { auth } = context
      if (!auth) {
        throw new GraphQLError('User not verfied', {
          extensions: {
            code: ErrorCode.NOT_AUTHENTICATED
          }
        })
      }

      if(auth.role !== UserRole.CUSTOMER) {
         throw new GraphQLError('User not authorized', {
          extensions: {
            code: ErrorCode.WRONG_USER_TYPE
          }
        })
      }
      
      const user = await User.findById(auth.id)
      if (!user) {
        throw new GraphQLError('User not found', {
          extensions: {
            code: ErrorCode.USER_NOT_FOUND
          }
        })
      }

      const { label, street, city, state, postcode, country, building, setAsDefault, id } = args.input

      const validateSchema: ValidateSchema<any>[] = [
        { value: label, name: 'label', type: 'string' },
        { value: street, name: 'street', type: 'string' },
        { value: city, name: 'city', type: 'string' },
        { value: state, name: 'state', type: 'string' },
        { value: postcode, name: 'postcode', type: 'string', required: false },
        { value: country, name: 'country', type: 'string' },
      ]

      const errors: FormError = validateForm(validateSchema)

      if (Object.keys(errors).length > 0) {
        throw new GraphQLError('Form Validation error', {
          extensions: {
            code: ErrorCode.VALIDATION_ERROR,
            extra: errors
          }
        })
      }

      const address: Address = {
        label, street, city, state, country, postcode, setAsDefault
      }

      if (building) address.building = building


      // this code is to remove any default address incase incoming address is set as default 
      if (setAsDefault && user.address.length > 0) {
        user.set('address', user.address.map(item => ({
          ...item,
          setAsDefault: false
        })))
        await user.save()
      }

      if (id) {
        await User.findOneAndUpdate(
          { _id: user.id, "address._id": id }, // Find user by id and specific address by id
          {
            $set: {
              "address.$": { ...address, _id: id } // $ is the positional operator. It acts as placeholder for first element in the address array that matches the condition, which is completely replaced by new address details
            }
          },
        )
      }
      else {
        await User.findByIdAndUpdate(user.id,
          { $push: { address: address } }
        )
      }

      return true
    },

    deleteAddress: async (parent: any, args: InputId, context: MyContext) => {
      const { auth } = context
      if (!auth) {
        throw new GraphQLError('User not verfied', {
          extensions: {
            code: ErrorCode.NOT_AUTHENTICATED
          }
        })
      }


      const user = await User.findById(auth.id)
      if (!user) {
        throw new GraphQLError('User not found', {
          extensions: {
            code: ErrorCode.USER_NOT_FOUND
          }
        })
      }

      if (!args.id) {
        throw new GraphQLError('Address Id not provided', {
          extensions: {
            code: ErrorCode.INPUT_ERROR,
          }
        })
      }

      await User.findByIdAndUpdate(
        user.id,
        { $pull: { address: { _id: args.id } } },
      )
      return true
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