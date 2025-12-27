import { Query } from "mongoose";
import Review from "../../dataLayer/schema/Review";
import { ErrorCode, FormError, ReviewType, User, UserRole, ValidateSchema } from "../../types";
import verifyUser from "../../utilities/verifyUser";
import validateForm from "../../utilities/validateForm";
import { GraphQLError } from "graphql";

const reviewResolver = {
    Query: {
        productReviews: async (parent: any, args: any) => {
            const productId = args.id
            if (!productId) {
                throw new GraphQLError('Product ID not provided', {
                    extensions: {
                        code: ErrorCode.INPUT_ERROR
                    }
                })
            }
            const reviews = await Review.find({ productId }).populate('userId', 'email firstName lastName')
            return reviews
        },

        reviews: async (parent: any, args: any, context: any) => {
            if (!context.token) {
                throw new GraphQLError('Not Authenticated', {
                    extensions: {
                        code: ErrorCode.JWT_TOKEN_MISSING
                    }
                })
            }

            const user = verifyUser(context.token)

            if (!user) {
                throw new GraphQLError('User not verified', {
                    extensions: {
                        code: ErrorCode.NOT_AUTHENTICATED
                    }
                })
            }

            if (user.role !== UserRole.ADMIN) {
                throw new GraphQLError('User not authorized', {
                    extensions: {
                        code: ErrorCode.WRONG_USER_TYPE
                    }
                })
            }

            const reviews = await Review.find().populate("userId", "firstName lastName email").populate('productId', 'title imgs')
            return reviews
        }
    },

    Mutation: {
        createReview: async (parent: any, args: any, context: any) => {
            if (!context.token) {
                throw new GraphQLError('Not Authenticated', {
                    extensions: {
                        code: ErrorCode.JWT_TOKEN_MISSING
                    }
                })
            }

            const user = verifyUser(context.token)

            if (!user) {
                throw new GraphQLError('User not verified', {
                    extensions: {
                        code: ErrorCode.NOT_AUTHENTICATED
                    }
                })
            }

            if (user.role !== UserRole.CUSTOMER) {
                throw new GraphQLError('User not authorized', {
                    extensions: {
                        code: ErrorCode.WRONG_USER_TYPE
                    }
                })
            }

            const { rating, productId, userId, review } = args.input

            const validateSchema: ValidateSchema<any>[] = [
                { value: rating, name: 'rating', type: 'number' },
                { value: productId, name: 'productId', type: 'string' },
                { value: userId, name: 'userId', type: 'string' },
                { value: review, name: 'review', type: 'string' },
            ]

            const errors: FormError = validateForm(validateSchema)
            if (Object.keys(errors).length > 0) {
                throw new GraphQLError('Login fields error', {
                    extensions: {
                        code: ErrorCode.VALIDATION_ERROR,
                        extra: errors
                    }
                })
            }

            const newReview = new Review({
                rating,
                productId,
                userId,
                review
            })

            return await newReview.save()
        },

        editReview: async (parent: any, args: any, context: any) => {
            if (!context.token) {
                throw new GraphQLError('Not Authenticated', {
                    extensions: {
                        code: ErrorCode.JWT_TOKEN_MISSING
                    }
                })
            }

            const user = verifyUser(context.token)

            if (!user) {
                throw new GraphQLError('User not verified', {
                    extensions: {
                        code: ErrorCode.NOT_AUTHENTICATED
                    }
                })
            }

            if (user.role !== UserRole.CUSTOMER) {
                throw new GraphQLError('User not authorized', {
                    extensions: {
                        code: ErrorCode.WRONG_USER_TYPE
                    }
                })
            }
            const { rating, review, id } = args.input

            const validateSchema: ValidateSchema<any>[] = [
                { value: rating, name: 'rating', type: 'number' },
                { value: review, name: 'review', type: 'string' },
            ]

            const errors: FormError = validateForm(validateSchema)
            if (Object.keys(errors).length > 0) {
                throw new GraphQLError('Edit Review fields error', {
                    extensions: {
                        code: ErrorCode.VALIDATION_ERROR,
                        extra: errors
                    }
                })
            }

            const editedReview = await Review.findByIdAndUpdate(
                id,
                {
                    rating,
                    review
                })

            return editedReview
        },
        deleteReview: async (parent: any, args: any, context: any) => {


            if (!context.token) {
                throw new GraphQLError('Not Authenticated', {
                    extensions: {
                        code: ErrorCode.JWT_TOKEN_MISSING
                    }
                })
            }

            const user = verifyUser(context.token)

            if (!user) {
                throw new GraphQLError('User not verified', {
                    extensions: {
                        code: ErrorCode.NOT_AUTHENTICATED
                    }
                })
            }

            const { id } = args
            const deletedReview = await Review.findByIdAndDelete(id)
            if (deletedReview) {
                return {
                    success: true,
                }

            }
            throw new GraphQLError('Review not found', {
                extensions: {
                    code: ErrorCode.NOT_FOUND
                }
            })

        }
    }
};

export default reviewResolver