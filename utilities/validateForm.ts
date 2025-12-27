import { FormError, ValidateSchema } from "../types"

const validEmail: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const passwordRegex: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

const validateForm = (validateSchema: ValidateSchema<any>[]) => {

    let errors: FormError = {}
    validateSchema.map(schema => {
        const { name, type, value, msg, required } = schema

        if (value === '' || value === null) {

            if (required !== false) {
                let error = {
                    [name]: msg || `Please insert ${name}.`
                }
                if (type === 'boolean') {
                    error = {
                        [name]: msg || `Please select ${name}.`
                    }
                }
                errors = { ...errors, ...error }
            }
        }
        else if (Array.isArray(value) && value.length < 1) {

            if (required !== false) {
                let error = {}
                if (type === 'file') {
                    error = {
                        [name]: msg || `Please upload ${name}.`
                    }
                }
                else if (type === 'checkbox') {
                    error = {
                        [name]: msg || `Please choose ${name}.`
                    }
                }
                errors = { ...errors, ...error }
            }
        }

        else {
            switch (type) {
                case 'alphaNumeric': {
                    const regex: RegExp = /^[A-Za-z].*[0-9]$/

                    if (!regex.test(value)) {
                        const error = {
                            [name]: msg || `Please insert value in alpha numeric format.`
                        }
                        errors = { ...errors, ...error }
                    }

                    break;
                }
                case 'email': {
                    if (!validEmail.test(value)) {
                        const error = {
                            email: msg || `Please insert email in correct format.`
                        }
                        errors = { ...errors, ...error }
                    }

                    break;
                }
                case 'password': {
                    if (!passwordRegex.test(value)) {
                        const error = {
                            password: msg || `Please insert password in correct format.
                            Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number and 1 special character.`
                        }
                        errors = { ...errors, ...error }
                    }

                    break;
                }
                case 'number':
                    if (value <= 0) {
                        if (required !== false) {
                            
                            const error = {
                                [name]: msg || `Please insert valid ${name}.`
                            }
                            errors = { ...errors, ...error }
                        }
                    }

                    break;

                default:
                    break;
            }
        }

    })

    return errors
}

export default validateForm