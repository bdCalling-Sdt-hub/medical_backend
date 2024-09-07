const SettingsModel = require("../Models/SettingsModel");
const FormateRequiredFieldMessage = require("../utils/FormateRequiredFieldMessage");

//create setting
const GetSettings = async (req, res) => {
    try {
        const { type } = req.params
        const result = await SettingsModel.findOne({ name: type })
        if (result) {
            return res.send({ success: true, data: result })
        } else {
            return res.send({
                success: true, data: {
                    "name": type,
                    "value": "",
                }
            })
        }
    } catch (error) {
        res.send({ success: false, ...error, message: error?.message || 'Internal server error', })
    }
}
// update setting 
const UpdateSettings = async (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(401).send({ message: "unauthorized access" });
    }
    const { name, value } = req.body
    try {
        const ExistingSetting = await SettingsModel.findOne({ name })
        if (ExistingSetting) {
            const result = await SettingsModel.updateOne({ name }, { $set: { value } })
            return res.send({ success: true, data: result, message: `${name} Updated Successfully` })
        } else {
            const settingData = new SettingsModel({ name, value })
            const result = await settingData.save()
            return res.send({ success: true, data: result, message: `${name} Updated Successfully` })
        }
    } catch (error) {
        let duplicateKeys = '';
        if (error?.keyValue) {
            duplicateKeys = FormateErrorMessage(error);
            error.duplicateKeys = duplicateKeys;
        }
        let requiredField = []
        if (error?.errors) {
            requiredField = FormateRequiredFieldMessage(error?.errors);
            error.requiredField = requiredField;
        }
        res.status(500).send({ success: false, message: requiredField[0] || duplicateKeys || 'Internal server error', ...error });/*  */
    }
}
module.exports = { UpdateSettings, GetSettings }