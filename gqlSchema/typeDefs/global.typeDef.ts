import gql from "graphql-tag"

const globalTypeDef = gql`
    scalar Date
    scalar Upload

    type ReturnType {
        success: Boolean!
        message: String
        value:String
    }
    
  `

export default globalTypeDef