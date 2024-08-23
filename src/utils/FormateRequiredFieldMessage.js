const FormateRequiredFieldMessage = (error) => {
    let fields = [];
    Object.keys(error).map(key => {
        fields.push(error[key]?.message)
    })
    return fields
}

module.exports = FormateRequiredFieldMessage