const SettingsModel = require("../Models/SettingsModel");

//create setting
const GetSettings = async (req, res) => {
    try {
        const { type } = req.params
        const result = await SettingsModel.findOne({ name: type })
        if (result) {
            return res.send({ success: true, data: result })
        } else {
            return res.send({
                success: false, data: {
                    "name": type,
                    "value": "",
                }
            })
        }
    } catch (error) {
        res.send({ success: false, ...error, message: 'Internal Server Error' })
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
            const result = await SettingsModel.create({ name, value })
            res.send({ success: true, data: result, message: `${name} Updated Successfully` })
        }
    } catch (error) {
        let duplicateKeys = [];
        if (error?.keyValue) {
            duplicateKeys = FormateErrorMessage(error);
        }
        error.duplicateKeys = duplicateKeys;
        res.send({ success: false, ...error, message: 'Internal Server Error' })
    }
}
module.exports = { UpdateSettings, GetSettings }