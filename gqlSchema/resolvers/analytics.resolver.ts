import Order from "../../dataLayer/schema/Order"
import { CompletedOrder, ErrorCode, MyContext, OrderItemPopulated, OrderItemsCategoryCounter, OrderStatus, unknownShape, UserRole } from "../../types"

import getDates from '../../utilities/getDates'
import Product from "../../dataLayer/schema/Product"
import { GraphQLError } from "graphql"
import User from "../../dataLayer/schema/User"

const analyticsResolver = {
    Query: {

        salesAnalytics: async (_: any, args: any, context: MyContext) => {
            const { auth } = context
            if (!auth) {
                throw new GraphQLError('User not authenticated', {
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

            const { currentStartDate, currentEndDate, pastStartDate, pastEndDate } = getDates()


            const currentMonthOrders = await Order.find({
                createdAt: {
                    $gte: currentStartDate,
                    $lte: currentEndDate
                },
                status: OrderStatus.COMPLETED
            }).select('total')


            const lastMonthOrders = await Order.find({
                createdAt: {
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
        orderAnalytics: async (_: any, args: any, context: MyContext) => {
            const { auth } = context
            if (!auth) {
                throw new GraphQLError('User not authenticated', {
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

            const { currentStartDate, currentEndDate, pastStartDate, pastEndDate } = getDates()


            const currentMonthOrders = (await Order.find({
                createdAt: {
                    $gte: currentStartDate,
                    $lte: currentEndDate
                },
                status: OrderStatus.COMPLETED
            }).select('_id').lean()).length

            const previousMonthOrders = (await Order.find({
                createdAt: {
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

        userAnalytics: async (_: any, args: any, context: MyContext) => {
            const { auth } = context
            if (!auth) {
                throw new GraphQLError('User not authenticated', {
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

            const { currentStartDate, currentEndDate, pastStartDate, pastEndDate } = getDates()


            const currentMonthNewUsers = (await User.find({
                registeredDate: {
                    $gte: currentStartDate,
                    $lte: currentEndDate
                },
            }).select('_id').lean())

            const previousMonthNewUsers = (await User.find({
                registeredDate: {
                    $gte: pastStartDate,
                    $lte: pastEndDate
                },
                status: OrderStatus.COMPLETED
            }).select('_id').lean())

            let changeInUsers = 0

            if (currentMonthNewUsers.length > 0 && previousMonthNewUsers.length > 0) {
                changeInUsers = ((currentMonthNewUsers.length - previousMonthNewUsers.length) / previousMonthNewUsers.length) * 100

                if (!Number.isInteger(changeInUsers)) {
                    changeInUsers = parseFloat(changeInUsers.toFixed(2))
                }
            }
            else if (previousMonthNewUsers.length < 1) {
                changeInUsers = 100
            }

            return {
                users: currentMonthNewUsers.length,
                changeInUsers
            }
        },

        salesOverTime: async (_: any, args: any, context: MyContext) => {

            const { auth } = context
            if (!auth) {
                throw new GraphQLError('User not authenticated', {
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

            const { currentStartDate, currentEndDate } = getDates()

            const monthlySales = await Order.find({
                createdAt: {
                    $gte: currentStartDate,
                    $lte: currentEndDate
                },
                status: OrderStatus.COMPLETED
            })
                .select('total createdAt -_id')
                .sort({ createdAt: 1 })
                .lean()


            if (monthlySales.length > 0) {
                const groupedBySales = monthlySales.reduce((acc: unknownShape, { total, createdAt }) => {
                    const tempDate = (new Date(createdAt).toISOString().split('T')[0])
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

        lowStockProducts: async (_: any, args: any, context: MyContext) => {
            const { auth } = context
            if (!auth) {
                throw new GraphQLError('User not authenticated', {
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

        ordersByCategory: async (_: any, args: any, context: MyContext) => {
            const { auth } = context
            if (!auth) {
                throw new GraphQLError('User not authenticated', {
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

            const { currentStartDate, currentEndDate } = getDates()


            const monthlyOrders = await Order.find({
                createdAt: {
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