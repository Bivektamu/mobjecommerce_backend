import UserSchem from "../../dataLayer/schema/User"
import Order from "../../dataLayer/schema/Order"
import { ErrorCode, OrderedProduct, User, UserRole } from "../../typeDefs"
import verifyUser from "../../utilities/verifyUser"
import { GraphQLError } from "graphql"
import Product from "../../dataLayer/schema/Product"


const orderResolver = {
    Query: {
        orders: async (parent: any, args: any, context: any) => {

            try {
                if (!context.token) {
                    throw new Error(ErrorCode.JWT_TOKEN_MISSING)
                }

                const user = verifyUser(context.token)

                if (!user) {
                    throw new Error(ErrorCode.NOT_AUTHENTICATED)

                }

                if (user && user.role === UserRole.CUSTOMER) {
                    throw new Error(ErrorCode.NOT_AUTHENTICATED)

                }

                const limit = args.limit

                const orders = await Order.find()
                .sort({
                    orderPlaced: -1
                })
                .limit(limit)
                return orders

            } catch (error) {
                if (error instanceof Error) {
                    throw new Error(error.message || ErrorCode.INTERNAL_SERVER_ERROR)

                }
            }
        },
        userOrders: async (parent: any, args: any, context: any) => {

            try {
                if (!context.token) {
                    throw new Error(ErrorCode.JWT_TOKEN_MISSING)
                }

                const user = verifyUser(context.token)

                if (!user) {
                    throw new Error(ErrorCode.NOT_AUTHENTICATED)

                }

                const id = args.id
                const findUser = await UserSchem.findById(id)
                if (!user) {
                    throw new Error(ErrorCode.NOT_AUTHENTICATED)

                }

                const orders = await Order.find({ userId: id })
                return orders
            } catch (error) {
                if (error instanceof Error) {
                    throw new Error(error.message || ErrorCode.INTERNAL_SERVER_ERROR)

                }
            }

        },
        orderByNumber: async (parent: any, args: any, context: any) => {

            try {
                if (!context.token) {
                    throw new Error(ErrorCode.JWT_TOKEN_MISSING)
                }

                const user = verifyUser(context.token)

                if (!user) {
                    throw new Error(ErrorCode.NOT_AUTHENTICATED)
                }

                const orderNumber = args.orderNumber
                if (!orderNumber) {
                    throw new Error(ErrorCode.INPUT_ERROR)
                }

                const order = await Order.find({ orderNumber })
                if (order.length < 1) {
                    throw new Error(ErrorCode.NOT_FOUND)
                }
                return order[0]

            } catch (error) {
                if (error instanceof Error) {
                    throw new Error(error.message || ErrorCode.INTERNAL_SERVER_ERROR)
                }
            }

        },
    },
    Mutation: {
        createOrder: async (parent: any, args: any, context: any) => {


            try {
                if (!context.token) {
                    throw new Error(ErrorCode.JWT_TOKEN_MISSING)
                }

                const user = verifyUser(context.token)
                if (!user) {
                    throw new Error(ErrorCode.NOT_AUTHENTICATED)
                }

                if (user.role !== UserRole.CUSTOMER) {
                    throw new Error(ErrorCode.NOT_AUTHENTICATED)
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
                    console.log(product)

                    if (product) {
                        if (quantity > product.quantity) {
                            throw new Error('Ordered quantity exceeds stock quantity')
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

            } catch (error) {
                if (error instanceof Error) {
                    throw new Error(error.message || ErrorCode.INTERNAL_SERVER_ERROR)
                }

            }

        },
        updateOrderStatus: async (parent: any, args: any, context: any) => {

            if (!context.token) {
                throw new Error(ErrorCode.NOT_AUTHENTICATED)
            }

            const user = verifyUser(context.token)
            if (!user) {
                throw new Error(ErrorCode.NOT_AUTHENTICATED)
            }

            if (user.role !== UserRole.ADMIN) {
                throw new Error(ErrorCode.NOT_AUTHENTICATED)
            }

            const { id, status } = args.input

            try {
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
                else throw new Error(ErrorCode.INTERNAL_SERVER_ERROR)

            } catch (error) {
                if (error instanceof Error)
                    throw new Error(error.message)
            }

        }
    }
}

export default orderResolver