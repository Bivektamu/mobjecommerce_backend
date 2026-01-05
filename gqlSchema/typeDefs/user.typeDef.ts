import gql from "graphql-tag";

const UserTypeDef = gql`

type Address {
    id:ID!,
    label: String!,
    street: String!,
    building: String,
    city: String!,
    postcode: String!,
    state: String!,
    country: String!,
    setAsDefault:Boolean!
}

enum UserRole {
    admin,
    customer
}

type User {
    id: ID!,
    firstName: String!,
    lastName: String!,
    email:String!,
    address: [Address],
    role: UserRole
    registeredDate: Date
}


input UserInput {
    firstName: String!,
    lastName: String!,
    email:String!,
    password: String!
}

input AddressInput {
    id:ID,
    label: String!,
    street: String!,
    building: String,
    city: String!,
    postcode: String!,
    state: String!,
    country: String!,
    setAsDefault:Boolean!
}

input UpdateAccount {
    firstName: String!,
    lastName: String!,
    email:String!,
}

type Query {
    users: [User],
    user(id:ID): User,
    userAddresses:[Address],
    userAddress(id:ID): Address,
    userEmail(id:ID): String,
}

type Mutation {
    createUser(input:UserInput): User,
    deleteUser(id: ID): ReturnType,
    updateAddressById(input: AddressInput):Boolean,
    updateAccount(input: UpdateAccount): User,
    deleteAddress(id:ID): Boolean,

}
`

export default UserTypeDef