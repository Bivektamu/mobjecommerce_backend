import gql from "graphql-tag";

const paymentTypeDef = gql`
    type CreatePaymentIntentResponse {
        clientSecret: String!
        orderId:ID!
    }

    input CreateOrderInput {
        items: [OrderItemInput!]!
        shippingAddress: AddressInput!
        billingAddress: AddressInput
    }

  type Mutation {
        createPaymentIntent(input: CreateOrderInput!): CreatePaymentIntentResponse!
    }
`

export default paymentTypeDef