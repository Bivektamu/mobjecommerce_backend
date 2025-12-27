import UserSchem from "../../dataLayer/schema/User"
import Order from "../../dataLayer/schema/Order"
import { ErrorCode, OrderedProduct, User, UserRole } from "../../types"
import verifyUser from "../../utilities/verifyUser"
import { GraphQLError } from "graphql"
import Product from "../../dataLayer/schema/Product"


const orderResolver = {
    Query: {
        orders: async (parent: any, args: any, context: any) => {
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

            if (user.role !== UserRole.ADMIN) {
                throw new GraphQLError('User not authorized', {
                    extensions: {
                        code: ErrorCode.WRONG_USER_TYPE
                    }
                })
            }

            const limit = args.limit
            const orders = await Order.find()
                .sort({
                    orderPlaced: -1
                })
                .limit(limit)
            return orders
        },

        userOrders: async (parent: any, args: any, context: any) => {
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

            const id = args.id
            const findUser = await UserSchem.findById(id)
            if (!user) {
                throw new GraphQLError('User not found', {
                    extensions: {
                        code: ErrorCode.USER_NOT_FOUND
                    }
                })
            }

            const orders = await Order.find({ userId: id })
            return orders
        },

        orderByNumber: async (parent: any, args: any, context: any) => {
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
        createOrder: async (parent: any, args: any, context: any) => {
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

            const {
                userId,
                status,
                total,
                subTotal,
                tax,
                items,
                shippingAddress,
            } = args.input

            items.map(async (item: OrderedProduct) => {
                const { productId, quantity } = item
                const product = await Product.findById(productId).select('quantity -_id').lean()

                if (product) {
                    if (quantity > product.quantity) {
                        throw new GraphQLError('Ordered quantity exceeds stock quantity', {
                            extensions: {
                                code: ErrorCode.INPUT_ERROR
                            }
                        })
                    }
                    await Product.updateOne(
                        {
                            _id: productId,
                        },
                        {
                            $set: {
                                quantity: product.quantity - quantity
                            }
                        })
                }
            })

            const newOrder = new Order({
                orderNumber: Date.now() + Math.floor((Math.random() * 1000)),
                userId,
                status,
                total,
                subTotal,
                tax,
                items,
                shippingAddress,
            })

            await newOrder.save()
            return newOrder.orderNumber
        },
        updateOrderStatus: async (parent: any, args: any, context: any) => {

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

            if (user.role !== UserRole.ADMIN) {
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