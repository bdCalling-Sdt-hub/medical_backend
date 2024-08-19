const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const { exec } = require('child_process');

const directoryPath = 'uploads/';
const permissions = '755';

// Function to set directory permissions
// const setPermission = () => {
//     fs.stat(directoryPath, (err, stats) => {
//         if (err) {
//             console.error(`Error checking directory: ${err}`);
//             return;
//         }
//         const currentPermissions = stats.mode & 0o777;
//         console.log(`Current permissions for ${directoryPath}: ${currentPermissions.toString(8)}`);
//         exec(`chmod -R ${permissions} ${directoryPath}`, (error, stdout, stderr) => {
//             if (error) {
//                 console.error(`Error changing permissions: ${error}`);
//                 return;
//             }
//             console.log(`Permissions changed successfully for ${directoryPath}`);
//         });
//     });
// };

// Middleware function for file upload
const uploadFile = (folderName) => {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            let uploadPath = `${directoryPath}/${folderName}`;
            if (file.mimetype.startsWith('image/') || file.mimetype === 'video/') {
                // if (!fs.existsSync(uploadPath)) {
                //     // setPermission(); // Corrected function name
                //     fs.mkdirSync(uploadPath, { recursive: true });
                // }
                cb(null, uploadPath);
            } else {
                cb(new Error('Invalid file type'));
            }
        },
        filename: function (req, file, cb) {
            const name = Date.now() + '-' + file.originalname;
            cb(null, name);
        },
    });

    const fileFilter = (req, file, cb) => {
        const allowedFilenames = ['img', 'video'];
        if (allowedFilenames.includes(file.fieldname)) {
            if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
                cb(null, true);
            } else {
                cb(new Error('Invalid file type'));
            }
        } else {
            cb(new Error('Invalid fieldame'));
        }
    };

    const maxVideoLength = 20;
    const upload = multer({
        storage: storage,
        fileFilter: fileFilter,
    }).fields([
        { name: 'img', maxCount: 4 },
        { name: 'video', maxCount: 1 },
    ]);

    return (req, res, next) => {
        upload(req, res, async function (err) {
            if (err) {
                return res.status(400).send(err.message);
            }
            // console.log(req.files.video)
            if (req?.files?.video) {
                const fileSizeMB = req?.files?.video?.size / (1024 * 1024);
                if (fileSizeMB > maxVideoLength) {
                    UnlinkFiles([videoFile.path])
                    // return res.status(400).send({ success: false, message: 'max video length is 20 mb' });
                } else {
                    next();
                }

            } else {
                next();
            }
        });
    };
};

module.exports = uploadFile;
