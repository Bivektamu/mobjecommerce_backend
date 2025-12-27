import gql from "graphql-tag";

const UserTypeDef = gql`

type Address {
    street: String,
    city: String,
    postcode: String,
    state: String,
    country: String,
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
    address: Address,
    role: UserRole
    registeredDate: Date
}

type PublicUserDetails {
firstName: String!,
    lastName: String!,
}

input UserInput {
    firstName: String!,
    lastName: String!,
    email:String!,
    password: String!
}

input AddressInput {
    street: String!,
    city: String!,
    postcode: String!,
    state: String!,
    country: String!,
}

input UpdateAccount {
    firstName: String!,
    lastName: String!,
    email:String!,
}

type Query {
    users: [User],
    user(id:ID): User,
    userEmail(id:ID): String,
    publicUserDetails(id:ID): PublicUserDetails
}

type Mutation {
    createUser(input:UserInput): User,
    deleteUser(id: ID): ReturnType,
    updateAddress(input: AddressInput): Address,
    updateAccount(input: UpdateAccount): User
}
`

export default UserTypeDef