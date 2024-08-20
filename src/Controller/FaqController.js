const FaqModel = require("../Models/FaqModel");
const FormateErrorMessage = require("../utils/FormateErrorMessage");
const Queries = require("../utils/Queries");

// create Faq
const CreateFaq = async (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(401).send({ message: "unauthorized access" });
    }
    try {
        const { question, answer } = req.body
        const result = await FaqModel.create({ question, answer })
        res.send({ success: true, data: result, message: 'Faq Created Successfully' })
    } catch (error) {
        let duplicateKeys = [];
        if (error?.keyValue) {
            duplicateKeys = FormateErrorMessage(error);
        }
        error.duplicateKeys = duplicateKeys;
        res.send({ success: false, ...error, message: 'Internal Server Error' })
    }
}

// get all Faq
const GetAllFaq = async (req, res) => {
    try {
        const { search, ...queryKeys } = req.query;
        const searchKey = {};
        if (search) searchKey.question = search
        const result = await Queries(FaqModel, queryKeys, searchKey);
        res.send({ ...result });
    } catch (error) {
        res.send({ success: false, error: { message: 'Internal server error', error } });
    }
}
// delete faq
const DeleteFaq = async (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(401).send({ message: "unauthorized access" });
    }
    try {
        const { faqId } = req.params
        const existingFaq = await FaqModel.findById(faqId)
        if (!existingFaq) {
            return res.send({ success: false, message: 'Faq Not Found' })
        }
        const result = await FaqModel.findByIdAndDelete(faqId)
        res.send({ success: true, data: result, message: 'Faq Deleted Successfully' })
    } catch (error) {
        res.send({ success: false, error, message: 'Internal Server Error' })
    }
}
//update Faq 
const UpdateFaq = async (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(401).send({ message: "unauthorized access" });
    }
    try {
        const { faqId } = req.params
        const { question, answer } = req.body
        const existingFaq = await FaqModel.findById(faqId)
        if (!existingFaq) {
            return res.send({ success: false, message: 'Faq Not Found' })
        }
        const result = await FaqModel.findByIdAndUpdate(faqId, { question, answer })
        res.send({ success: true, data: result, message: 'Faq Updated Successfully' })
    } catch (error) {
        res.send({ success: false, ...error, message: 'Internal Server Error' })
    }
}
module.exports = {
    CreateFaq,
    GetAllFaq,
    DeleteFaq,
    UpdateFaq
}