import Order from "../../dataLayer/schema/Order"
import User from "../../dataLayer/schema/User"
import { CompletedOrder, ErrorCode, OrderItemPopulated, OrderItemsCategoryCounter, OrderStatus, unknownShape, UserRole } from "../../types"
import verifyUser from "../../utilities/verifyUser"

import { startFiscalDate, currentStartDate, currentEndDate, pastStartDate, pastEndDate } from '../../utilities/getDates'
import Product from "../../dataLayer/schema/Product"
import { GraphQLError } from "graphql"

const analyticsResolver = {
    Query: {

        salesAnalytics: async (parent: any, args: any, context: any) => {
            
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

                const currentMonthOrders = await Order.find({
                    orderPlaced: {
                        $gte: currentStartDate,
                        $lte: currentEndDate
                    },
                    status: OrderStatus.COMPLETED
                }).select('total')


                const lastMonthOrders = await Order.find({
                    orderPlaced: {
                        $gte: pastStartDate,
                        $lte: pastEndDate
                    },
                    status: OrderStatus.COMPLETED
                }).select('total')



                const totalCurrentMonthSales = currentMonthOrders.reduce((sum, order) => sum + order.total, 0)

                const totalLastMonthSales = lastMonthOrders.reduce((sum, order) => sum + order.total, 0)



                let changeInOrders = 0, changeInSales = 0

                if (totalCurrentMonthSales > 0 && totalLastMonthSales > 0) {
                    changeInSales = ((totalCurrentMonthSales - totalLastMonthSales) / totalLastMonthSales) * 100
                    if (!Number.isInteger(changeInSales)) {
                        changeInSales = parseFloat(changeInSales.toFixed(2))
                    }
                }
                else if (totalCurrentMonthSales > 0) {
                    changeInOrders = 100, changeInSales = 100
                }

                return {
                    sales: parseFloat(totalCurrentMonthSales.toFixed(2)),
                    changeInSales,
                }

            

        },
        orderAnalytics: async (parent: any, args: any, context: any) => {
            
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

                const currentMonthOrders = (await Order.find({
                    orderPlaced: {
                        $gte: currentStartDate,
                        $lte: currentEndDate
                    },
                    status: OrderStatus.COMPLETED
                }).select('_id').lean()).length

                const previousMonthOrders = (await Order.find({
                    orderPlaced: {
                        $gte: pastStartDate,
                        $lte: pastEndDate
                    },
                    status: OrderStatus.COMPLETED
                }).select('_id').lean()).length

                let changeInOrders = 0

                if (currentMonthOrders > 0 && previousMonthOrders > 0) {
                    changeInOrders = ((currentMonthOrders - previousMonthOrders) / previousMonthOrders) * 100
                    if (!Number.isInteger(changeInOrders)) {
                        changeInOrders = parseFloat(changeInOrders.toFixed(2))
                    }

                }
                else if (previousMonthOrders < 1) {
                    changeInOrders = 100
                }

                return {
                    orders: currentMonthOrders,
                    changeInOrders
                }

            

        },

        userAnalytics: async (parent: any, args: any, context: any) => {
            
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

                const currentMonthActiveUsers = (await Order.find({
                    orderPlaced: {
                        $gte: currentStartDate,
                        $lte: currentEndDate
                    },
                    status: OrderStatus.COMPLETED
                }).select('userId -_id').lean())

                const uniqueCurrentMonthActiveUsers = (new Set(currentMonthActiveUsers.map(user => (user.userId).toString())))


                const previousMonthActiveUsers = (await Order.find({
                    orderPlaced: {
                        $gte: pastStartDate,
                        $lte: pastEndDate
                    },
                    status: OrderStatus.COMPLETED
                }).select('userId -_id').lean())


                const uniquePreviousMonthActiveUsers = (new Set(previousMonthActiveUsers.map(user => (user.userId).toString())))

                let changeInUsers = 0

                if (uniqueCurrentMonthActiveUsers.size > 0 && uniquePreviousMonthActiveUsers.size > 0) {
                    changeInUsers = ((uniqueCurrentMonthActiveUsers.size - uniquePreviousMonthActiveUsers.size) / uniquePreviousMonthActiveUsers.size) * 100

                    if (!Number.isInteger(changeInUsers)) {
                        changeInUsers = parseFloat(changeInUsers.toFixed(2))
                    }

                }
                else if (uniquePreviousMonthActiveUsers.size < 1) {
                    changeInUsers = 100
                }

                return {
                    users: uniqueCurrentMonthActiveUsers.size,
                    changeInUsers
                }

            

        },

        salesOverTime: async (parent: any, args: any, context: any) => {
            
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

                const monthlySales = await Order.find({
                    orderPlaced: {
                        $gte: currentStartDate,
                        $lte: currentEndDate
                    },
                    status: OrderStatus.COMPLETED
                })
                    .select('total orderPlaced -_id')
                    .sort({ orderPlaced: 1 })
                    .lean()


                if (monthlySales.length > 0) {
                    const groupedBySales = monthlySales.reduce((acc: unknownShape, { total, orderPlaced }) => {
                        const tempDate = (new Date(orderPlaced).toISOString().split('T')[0])
                        if (!acc[tempDate]) {
                            acc[tempDate] = 0
                        }
                        acc[tempDate] += total
                        return acc
                    }, {})

                    const salesByDate = Object.entries(groupedBySales).map(([date, sales]) =>
                        ({ date: new Date(date), sales }))


                    return salesByDate
                }
                return []
        },

        lowStockProducts: async (parent: any, args: any, context: any) => {
            
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

                const lowWtockProducts = await Product.find({
                    quantity: {
                        $lte: 50
                    },
                })
                    .select('_id title sku quantity imgs.url')
                    .lean()


                if (lowWtockProducts.length > 0) {
                    const formatted = lowWtockProducts.map(({ imgs, ...rest }) => ({ ...rest, heroImg: imgs[0].url }))
                    return formatted
                }

                return []
            

        },
        ordersByCategory: async (parent: any, args: any, context: any) => {
            
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
                const monthlyOrders = await Order.find({
                    orderPlaced: {
                        $gte: currentStartDate,
                        $lte: currentEndDate
                    },
                    status: OrderStatus.COMPLETED
                }).select('items.productId').populate({
                    path: 'items.productId',
                    select: 'category'
                }).lean<CompletedOrder[]>()

                const orderItems = [...monthlyOrders.flatMap(order => order.items)]

                let catCounter: unknownShape = {}, orderByCategory: OrderItemsCategoryCounter[] = []
                if (orderItems.length > 0) {
                    orderItems.map((order: OrderItemPopulated) => {
                        if (catCounter[order.productId.category]) {
                            catCounter[order.productId.category] = catCounter[order.productId.category] + 1
                        }
                        else {
                            catCounter[order.productId.category] = 1
                        }
                    })
                    orderByCategory = Object.keys(catCounter).map(category => ({
                        category,
                        count: catCounter[category]
                    }))

                }
                return orderByCategory

            

        }
    }
}

export default analyticsResolver