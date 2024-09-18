const uploadFile = require("../middlewares/FileUpload/FileUpload");
const UnlinkFiles = require("../middlewares/FileUpload/UnlinkFiles");
const Category = require("../Models/CategoryModel");
const FormateErrorMessage = require("../utils/FormateErrorMessage");
const FormateRequiredFieldMessage = require("../utils/FormateRequiredFieldMessage");
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
        res.status(500).send({ success: false, message: error?.message || 'Internal server error', ...error });
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
                const newCategory = new Category({ img: img?.[0]?.path, name });
                const result = await newCategory.save();
                res.status(201).send({ success: true, data: result });
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
                res.status(500).send({ success: false, message: requiredField[0] || duplicateKeys || 'Internal server error', ...error });
            }
        });
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
        res.status(500).send({ success: false, message: requiredField[0] || duplicateKeys || 'Internal server error', ...error });
    }
}

//delete category
const DeleteCategory = async (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(401).send({ message: "unauthorized access" });
    }
    try {
        const { categoryId } = req.params;
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).send({ success: false, message: 'Category not found' });
        }
        const result = await Category.deleteOne({ _id: categoryId });
        if (category.img) {
            UnlinkFiles([category.img]);
        }
        res.status(200).send({ success: true, data: result, message: 'category deleted successfully' });
    } catch (error) {
        res.status(500).send({ success: false, message: error?.message || 'Internal server error', ...error });
    }
}
// update Category
const UpdateCategory = async (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(401).send({ message: "unauthorized access" });
    }
    try {
        const { categoryId } = req.params;
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).send({ success: false, message: 'Category not found' });
        }
        await uploadFile()(req, res, async function (err) {
            if (err) {
                return res.status(400).send({ success: false, message: err.message });
            }
            const { img } = req.files || {};
            const { name } = req.body
            try {
                if (img) {
                    UnlinkFiles([category.img])
                }
                const result = await Category.updateOne({ _id: categoryId }, {
                    $set: {
                        img: img?.[0]?.path || category.img,
                        name
                    }
                });
                res.status(200).send({ success: true, message: 'Category Updated successfully', data: result });
            } catch (error) {
                res.status(500).send({ success: false, message: error?.message || 'Internal server error', ...error });
            }
        });
    } catch (error) {
        res.status(500).send({ success: false, message: error?.message || 'Internal server error', ...error });
    }
}

module.exports = { GetCategories, CreateCategory, DeleteCategory, UpdateCategory }