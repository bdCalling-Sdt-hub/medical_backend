//create banner 
const uploadFile = require("../middlewares/FileUpload/FileUpload");
const Banner = require("../Models/BannerModel");
const Queries = require("../utils/Queries");
//create banner
const CreateBanner = async (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(401).send({ message: "unauthorized access" });
    }
    try {
        await uploadFile()(req, res, async function (err) {
            if (err) {
                return res.status(400).send({ success: false, message: err.message });
            }
            const { img } = req.files || {};
            if (!img) {
                res.status(500).send({ success: false, message: 'Banner Image Iss required', });
            }
            try {
                const banner = new Banner({ img: img?.[0]?.path });
                const result = await banner.save();
                res.status(200).send({ success: true, data: result, message: "Banner created successfully" });
            } catch (error) {
                res.status(500).send({ success: false, message: 'Internal server error', ...error });
            }
        })

    } catch (error) {
        res.status(500).send({ success: false, message: 'Internal server error', ...error });
    }
}

const GetAllBanner = async (req, res) => {
    try {
        const { search, ...queryKeys } = req.query;
        const searchKey = {}
        if (search) searchKey.name = search
        const result = await Queries(Banner, queryKeys, searchKey);
        res.status(200).send({ ...result });
    } catch (error) {
        res.status(500).send({ success: false, error: { message: 'Internal server error', error: error } });
    }
}
module.exports = {
    CreateBanner,
    GetAllBanner,
}