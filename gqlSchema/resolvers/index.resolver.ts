
import { GraphQLUpload } from 'graphql-upload-ts'
import adminRresolver from "./auth.resolver";
import userRresolver from "./user.resolver";
import productResolver from './product.resolver';
import verifyUser from '../../utilities/verifyUser';
import orderResolver from './order.resolver';
import wishListResolver from './wishList.resolver';
import reviewResolver from './review.resolver';
import { GraphQLScalarType, Kind } from "graphql"
import analyticsResolver from './analytics.resolver';


const DateScalar = new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    serialize(value: any) {
        // Convert outgoing Date to ISO string
        return value.toISOString();
    },
    parseValue(value: any) {
        // Convert incoming ISO string to Date
        return new Date(value);
    },
    parseLiteral(ast) {
        if (ast.kind === Kind.STRING) {
            return new Date(ast.value); // Convert hard-coded string to Date
        }
        return null;
    },
});


const globalResolver = {
    Upload: GraphQLUpload,
    Date: DateScalar,
    
    // Mutation: {
    //     uploadFile: async (parent: any, args: any) => {

    //         const file = await args.input.file
            
            
    //         const { createReadStream, filename, mimetype, encoding } = file;
    //         const stream = createReadStream()

    //         const pathName = path.join(process.cwd(), `public/images/${filename}`)

    //         await stream.pipe(fs.createWriteStream(pathName))

    //         return {
    //             url:`http://localhost:3000/images/${filename}`
    //         }
    //     },

      
    // },
   
}

export default [globalResolver, userRresolver, adminRresolver, productResolver, orderResolver, wishListResolver, reviewResolver, analyticsResolver]