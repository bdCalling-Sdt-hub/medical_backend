const FormateErrorMessage = (error) => {
   // console.log(error)
    let duplicateKeys 
    Object.keys(error?.keyValue)?.map(key => {
        duplicateKeys =`${key} must be unique`
    })
    return duplicateKeys
}
module.exports = FormateErrorMessage