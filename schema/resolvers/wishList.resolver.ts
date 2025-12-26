import { GraphQLError } from "graphql"
import WishList from "../../dataLayer/schema/WishList"
import { ErrorCode, UserRole } from "../../typeDefs"
import verifyUser from "../../utilities/verifyUser"

const wishListResolver = {
  Query: {
    wishListByUserId: async (parent: any, args: any, context: any) => {
      if (!context.token) {
        throw new GraphQLError('Not Authenticated', {
          extensions: {
            code: ErrorCode.JWT_TOKEN_MISSING
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
      if (user.role !== UserRole.CUSTOMER) {
        throw new GraphQLError('User not authorized', {
          extensions: {
            code: ErrorCode.WRONG_USER_TYPE
          }
        })
      }

      const userId = args.userId

      if (!userId) {
        throw new GraphQLError('User ID not provided', {
          extensions: {
            code: ErrorCode.INPUT_ERROR
          }
        })
      }

      const wishList = await WishList.findOne({ userId })

      if (!wishList) {
        throw new GraphQLError('Wish list not found', {
          extensions: {
            code: ErrorCode.NOT_FOUND
          }
        })
      }

      return wishList
    },
  },
  Mutation: {
    addToWishList: async (parent: any, args: any, context: any) => {
      if (!context.token) {
        throw new GraphQLError('Not Authenticated', {
          extensions: {
            code: ErrorCode.JWT_TOKEN_MISSING
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
      if (user.role !== UserRole.CUSTOMER) {
        throw new GraphQLError('User not authorized', {
          extensions: {
            code: ErrorCode.WRONG_USER_TYPE
          }
        })
      }

      const { userId, products } = args.input

      const updatedWishList = await WishList.findOneAndUpdate(
        { userId },
        {
          userId,
          products
        },
        {
          new: true,
          upsert: true,
          runValidators: true
        }
      )

      return updatedWishList

    },
  }
}

export default wishListResolver