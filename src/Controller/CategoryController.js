const Category = require("../Models/CategoryModel");
const Queries = require("../utils/Queries");

const GetCategories = async (req, res) => {
    try {
        const { search, ...queryKeys } = req.query;
        const searchKey = {
            name: search
        }
        console.log(searchKey)
        const result = await Queries(Category, queryKeys, searchKey);
        res.status(200).send({ ...result });
    } catch (error) {
        res.status(500).send({ success: false, error: { message: 'Internal server error', error: error } });
    }
}
module.exports = { GetCategories }