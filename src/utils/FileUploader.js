const uploadFile = require("../middlewares/FileUpload/FileUpload");

const FileUploader = async (req, res) => {
    const uploadMiddleware = uploadFile('video');
    uploadMiddleware(req, res, async (err) => {
        if (err) {
            return res.status(400).send(err.message);
        }
        if (req.files.img) {
            const imageFiles = req.files.img;
            const filePromises = imageFiles.map(file => file?.path);
            res.send({ success: true, data: filePromises, message: 'Images uploaded successfully.' });
        } else {
            res.status(400).send({ success: false, message: 'max file size is 20 mb' });
        }
    });
}
module.exports = FileUploader
// const uploadMiddleware = uploadFile('images/profile');
// uploadMiddleware(req, res, async (err) => {
//     if (err) {
//         return res.status(400).send({ success: false, error: { message: err.message, error: err }, });
//     }
//     const data = req.body;
//     if (req?.files?.img) {
//         let img = req.files.img[0]?.path
//         const ShopData = new Shop({ ...data, img })
//         const result = await ShopData.save()
//         return res.send({ success: true, data: result });
//     } else {
//         return res.status(401).send({ success: false, error: { message: 'image is required' }, });
//     }
// });