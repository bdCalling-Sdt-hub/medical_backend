const uploadFile = require("../middlewares/FileUpload/FileUpload");
const Category = require("../Models/CategoryModel");
const FormateErrorMessage = require("../utils/FormateErrorMessage");
const Queries = require("../utils/Queries");

// get category 
const GetCategories = async (req, res) => {
    try {
        const { search, ...queryKeys } = req.query;
        const searchKey = {}
        if (search) searchKey.name = search
        const result = await Queries(Category, queryKeys, searchKey);
        res.status(200).send({ ...result });
    } catch (error) {
        res.status(500).send({ success: false, error: { message: 'Internal server error', error: error } });
    }
}

// create Category 
const CreateCategory = async (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(401).send({ message: "unauthorized access" });
    }
    try {
        await uploadFile()(req, res, async function (err) {
            if (err) {
                return res.status(400).send({ success: false, message: err.message });
            }
            const { img } = req.files || {};
            const { name } = req.body
            try {
                const result = await Category.create({ img: img?.[0]?.path, name });
                res.status(201).send({ success: true, data: result });
            } catch (error) {
                let duplicateKeys = [];
                if (error?.keyValue) {
                    duplicateKeys = FormateErrorMessage(error);
                }
                error.duplicateKeys = duplicateKeys;
                res.status(500).send({ success: false, error: { message: 'Internal server error', error: error } });
            }
        });
    } catch (error) {
        let duplicateKeys = [];
        if (error?.keyValue) {
            duplicateKeys = FormateErrorMessage(error);
        }
        error.duplicateKeys = duplicateKeys;
        res.status(500).send({ success: false, error: { message: 'Internal server error', error: error } });
    }
}
module.exports = { GetCategories, CreateCategory }