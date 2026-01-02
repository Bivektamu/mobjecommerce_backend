import UserSchem from "../../dataLayer/schema/User"
import Order from "../../dataLayer/schema/Order"
import { ErrorCode, MyContext, OrderItem, User, UserRole } from "../../types"
import { GraphQLError } from "graphql"

const orderResolver = {
    Query: {
        orders: async (parent: any, args: any, context: MyContext) => {
            const { auth } = context
            if (!auth) {
                throw new GraphQLError('User not verified', {
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

            const limit = args.limit
            const orders = await Order.find()
                .sort({
                    createdAt: -1
                })
                .limit(limit)
            return orders
        },

        userOrders: async (parent: any, args: any, context: MyContext) => {
            const { auth } = context
            if (!auth) {
                throw new GraphQLError('User not verified', {
                    extensions: {
                        code: ErrorCode.NOT_AUTHENTICATED
                    }
                })
            }

            const id = args.id
            const findUser = await UserSchem.findById(id)
            if (!findUser) {
                throw new GraphQLError('User not found', {
                    extensions: {
                        code: ErrorCode.USER_NOT_FOUND
                    }
                })
            }

            const orders = await Order.find({ userId: id })
            return orders
        },

        orderByNumber: async (parent: any, args: any, context: MyContext) => {
            const { auth } = context
            if (!auth) {
                throw new GraphQLError('User not verified', {
                    extensions: {
                        code: ErrorCode.NOT_AUTHENTICATED
                    }
                })
            }

            const orderNumber = args.orderNumber
            if (!orderNumber) {
                throw new GraphQLError('Order number not provided', {
                    extensions: {
                        code: ErrorCode.INPUT_ERROR
                    }
                })
            }

            const order = await Order.find({ orderNumber })
            if (order.length < 1) {
                throw new GraphQLError('Order not found', {
                    extensions: {
                        code: ErrorCode.INPUT_ERROR
                    }
                })
            }
            return order[0]
        },
    },
    Mutation: {
     
        updateOrderStatus: async (parent: any, args: any, context: MyContext) => {

            const { auth } = context
            if (!auth) {
                throw new GraphQLError('User not verified', {
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

            const { id, status } = args.input

            const updateState = await Order.updateOne(
                { _id: id },
                {
                    $set: {
                        status
                    }
                }
            )
            const { acknowledged, modifiedCount } = updateState
            if (acknowledged && modifiedCount === 1) {
                return status
            }
        }
    }
}

export default orderResolver