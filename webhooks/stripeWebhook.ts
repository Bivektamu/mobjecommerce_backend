import { Request, Response } from "express"
import {stripe} from '../lib/stripe'
import Stripe from 'stripe'
import Order from "../dataLayer/schema/Order"
import { OrderStatus } from "../types"
const stripeWebhookHandler = async(
    req:Request,
    res:Response
) => {
    const sig = req.headers['stripe-signature']

    if(!sig) {
        return res.status(400).send('Missing signature')
    }
    let event:Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (error:any) {
        console.error('Webhook signature verification failed', error.message)
        return res.status(400).send(`Webhoo error: ${error.message}`)
    }

    switch(event.type) {
        case 'payment_intent.succeeded': {
            console.log('succedded')
            const intent = event.data.object as Stripe.PaymentIntent
            const orderId = intent.metadata.orderId

            await Order.findByIdAndUpdate(orderId, {
                status: OrderStatus.COMPLETED,
                stripePaymentId: intent.id,

            })
            break;
        }
        case 'payment_intent.payment_failed': {
            console.log('failed')
             const intent = event.data.object as Stripe.PaymentIntent
            const orderId = intent.metadata.orderId

            await Order.findByIdAndUpdate(orderId, {
                status: OrderStatus.FAILED,
            })
            break;
        }
    }

    res.json({received: true})
}

export default stripeWebhookHandler