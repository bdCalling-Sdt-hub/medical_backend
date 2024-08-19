const Shop = require("../Models/ShopModel");
//create shop
const CreateShop = async (req, res) => {
    try {
        const data = req.body
        const ShopData = new Shop(data)
        const result = await ShopData.save()
        return res.send({ success: true, data: result });
    } catch (error) {
        res.status(500).send({ success: false, error: { error: error, message: 'Internal server error' } });
    }

}

//get all shop
const GetShop = async (req, res) => {
    try {
        const result = await Shop.find({})
        res.send({ success: true, data: result })
    } catch (error) {
        res.status(500).send({ success: false, error: { message: 'Internal server error', error } });
    }
}
module.exports = { CreateShop, GetShop }