import { GraphQLError } from "graphql"
import WishList from "../../dataLayer/schema/WishList"
import { ErrorCode, MyContext, UserRole } from "../../types"
import verifyUser from "../../utilities/verifyUser"

const wishListResolver = {
  Query: {
    wishListByUserId: async (parent: any, args: any, context: MyContext) => {
      const { auth } = context
      if (!auth) {
        throw new GraphQLError('User not verified', {
          extensions: {
            code: ErrorCode.NOT_AUTHENTICATED
          }
        })
      }

      if (auth.role !== UserRole.CUSTOMER) {
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
    addToWishList: async (parent: any, args: any, context: MyContext) => {
      const { auth } = context
      if (!auth) {
        throw new GraphQLError('User not verified', {
          extensions: {
            code: ErrorCode.NOT_AUTHENTICATED
          }
        })
      }

      if (auth.role !== UserRole.CUSTOMER) {
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