import gql from "graphql-tag";

const authTypeDef = gql`
    type Token {
      token: String
    }
    input LogInInput {
      email:String!,
      password: String!
    }

    type UserAuth {
      role: String!,
      id: ID!
    }

    
    type getAuthStatusPayload {
      isLoggedIn: Boolean!,
      user:UserAuth
    }

    input ChangePassword {
      id:ID!,
      currentPassword: String!,
      newPassword: String!
    }

  type Mutation {
    logInAdmin(input: LogInInput!): Token,
    logInUser(input: LogInInput!): getAuthStatusPayload,
    logInGoogleUser(credential: String!): Token,
    changePassWord(input:ChangePassword):Boolean
  }

   type Query {
    getAuthStatus: getAuthStatusPayload
  }
`
export default authTypeDef