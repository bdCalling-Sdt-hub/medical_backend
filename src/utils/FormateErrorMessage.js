const FormateErrorMessage = (error) => {
    let duplicateKeys = []
    Object.keys(error?.keyValue)?.map(key => {
        duplicateKeys.push({ [key]: error?.keyValue[key] })
    })
    return duplicateKeys
}
module.exports = FormateErrorMessage