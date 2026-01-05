import countries from 'i18n-iso-countries'
import enLocale from "i18n-iso-countries/langs/en.json";
            countries.registerLocale(enLocale) // for getting country code

const getCountryCode = (country:string) => {
    return countries.getAlpha3Code(country, "en") || country
}

export default getCountryCode