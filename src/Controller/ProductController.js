const Product = require("../Models/ProductsModel");

const CreateProduct = async (req, res) => {
    try {
        const { total_sold, reviews, total_review, ...data } = req.body;
        const ProductData = new Product(data)
        const result = await ProductData.save()
        res.status(200).send({ success: true, data: result, })
    } catch (error) {
        res.status(500).send({ success: false, error: { error: error, message: 'Internal server error' } });
    }
}
const UpdateProduct = async (req, res) => {
    try {
        const { productId } = req.params
        const { total_sold, reviews, total_review, ...data } = req.body;
        const result = await Product.updateOne({ _id: productId }, {
            $set: {
                ...data
            }
        })
        res.status(200).send({ success: true, data: result, })
    } catch (error) {
        res.status(500).send({ success: false, error: { error: error, message: 'Internal server error' } });
    }
}
const GetProduct = async (req, res) => {
    try {
        const result = await Product.find({})
        res.status(200).send({ success: true, data: result, })
    } catch (error) {
        res.status(500).send({ success: false, error: { error: error, message: 'Internal server error' } });
    }
}
module.exports = { CreateProduct, GetProduct ,UpdateProduct}