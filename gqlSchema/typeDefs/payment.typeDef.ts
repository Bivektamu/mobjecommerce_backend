import gql from "graphql-tag";

const paymentTypeDef = gql`
    type CreatePaymentIntentResponse {
        clientSecret: String!
        orderId:ID!
    }

    input CartItemInput {
        productId: ID!
        quantity: Int!
        size: Size!
        color:Color!
    }

    input CreateOrderInput {
        items: [CartItemInput!]!
        shippingAddress: AddressInput!
        billingAddress: AddressInput
    }

  type Mutation {
        createPaymentIntent(items: [CartItemInput!]!): CreatePaymentIntentResponse!
    }
`

export default paymentTypeDef