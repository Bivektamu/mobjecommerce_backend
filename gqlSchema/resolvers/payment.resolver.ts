
import { GraphQLError } from "graphql"
import { Address, Color, ErrorCode, MyContext, OrderItem, OrderStatus, Size } from "../../types"
import Product from "../../dataLayer/schema/Product"
import Order from "../../dataLayer/schema/Order"
import getOrderNumber from "../../utilities/getOrderNumber"
import { stripe } from "../../lib/stripe"
import User from "../../dataLayer/schema/User"
import getCountryCode from "../../utilities/getCountryCode"

interface CartItemInput {
    input: {
        items: OrderItem[],
        shippingAddress: Address,
    }
}

interface IntentPaymentId {
    paymentIntentId:string
}

const paymentResolvers = {
    Mutation: {
        createPaymentIntent: async (_: any, args: CartItemInput, context: MyContext) => {
            const { auth } = context
            if (!auth) {
                throw new GraphQLError('User not authenticated', {
                    extensions: {
                        code: ErrorCode.NOT_AUTHENTICATED
                    }
                })
            }

            const user = await User.findById(auth.id)

            if(!user) {
                throw new GraphQLError('User not found', {
                    extensions: {
                        code:ErrorCode.USER_NOT_FOUND
                    }
                })
            }

            const { items, shippingAddress } = args.input

            if (!items.length) {
                throw new GraphQLError('Cart is Empty', {
                    extensions: {
                        code: ErrorCode.INPUT_ERROR
                    }
                })
            }
            if (!shippingAddress) {
                throw new GraphQLError('Shipping Address is missing', {
                    extensions: {
                        code: ErrorCode.INPUT_ERROR
                    }
                })
            }

            const products = await Product.find({
                _id: {
                    $in: items.map(i => i.productId)
                }
            })

            let subTotal = 0

            const orderItems: OrderItem[] = items.map(item => {
                const product = products.find(p => p.id === item.productId)

                if (!product) {
                    throw new GraphQLError('Invalid Product in cart')
                }

                subTotal += (item.quantity * product.price)
                return {
                    productId: product._id,
                    color: item.color,
                    quantity: item.quantity,
                    size: item.size,
                    unitPrice: product.price,
                }
            })

            const tax = Math.round(subTotal * 0.1)
            const total = subTotal + tax
            const customer = {
                firstName: user.firstName,
                lastName: user.lastName,
                email:user.email
            }

            const orderNumber = await getOrderNumber()

            const order = await Order.create({
                userId: auth.id,
                customer: customer,
                orderNumber: orderNumber,
                subTotal,
                status: OrderStatus.PENDING,
                tax,
                total,
                shippingAddress,
                items: orderItems,
            })
            const {street, city, state, postcode, building, country} = shippingAddress

            const plainAddress = building?building+',':''+`${street}, ${city}, ${state}, ${postcode}, ${country}`
            const paymentIntent = await stripe.paymentIntents.create({
                receipt_email:customer.email,
                amount:total * 100,
                currency:'aud',
                shipping: {
                    name:customer.firstName + customer.lastName,
                    address: {
                        line1: street as string,
                        city: city as string,
                        state: state as string,
                        postal_code: postcode as string,
                        country: getCountryCode(country as string),
                    } 
                },
                metadata: {
                    orderId: order.id,
                    customer: customer.firstName+' '+customer.lastName,
                    email:customer.email,
                    shippingAddress: plainAddress
                },
                automatic_payment_methods: {
                    enabled:true,
                }
            })
            order.stripePaymentIntentId = paymentIntent.id
            await order.save()
            return {
                clientSecret: paymentIntent.client_secret,
                orderId: order.id
            }
        }
    },
    Query: {
        orderByPaymentIntent: async(_:any, args:IntentPaymentId) => {
            const order = await Order.findOne({stripePaymentIntentId: args.paymentIntentId})
            if(!order) {
                throw new GraphQLError('Order not found', {
                    extensions: {
                        code: ErrorCode.NOT_FOUND
                    }
                })
            }
            return order
        }
        // (paymentIntentId: String!): Order
    }
}

export default paymentResolvers