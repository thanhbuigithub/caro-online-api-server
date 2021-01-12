const express = require('express');
const imageRouter = express.Router();
const mongoose = require('mongoose');
const Image = require('../models/Image.model');
const User = require('../models/User.model');

module.exports = (upload) => {
    const url = process.env.MONGODB_URL;
    const connect = mongoose.createConnection(url, { useNewUrlParser: true, useUnifiedTopology: true });

    let gfs;

    connect.once('open', () => {
        gfs = new mongoose.mongo.GridFSBucket(connect.db, {
            bucketName: "uploads"
        });
    });

    /*
        POST: Upload a single image/file to Image collection
    */
    imageRouter.post('/', upload.single('file'), async (req, res, next) => {
        try {
            const imageFile = await Image.findOne({ caption: req.body.caption });
            if (imageFile) {
                console.log('Old image', imageFile);
                try {
                    await Image.deleteOne({ caption: imageFile.caption });
                    await gfs.delete(new mongoose.Types.ObjectId(imageFile.fileId));
                } catch (error) {
                    res.status(500).json(error);
                }
            }
            let newImage = new Image({
                caption: req.body.caption,
                filename: req.file.filename,
                fileId: req.file.id,
            });
            console.log('New image', newImage);
            try {
                await User.findOneAndUpdate({ _id: req.body.caption }, { isUploadAvatar: true });
            } catch (err) {
                return res.status(500).json(err);
            }

            try {
                const image = await newImage.save();
                res.status(200).json({
                    success: true,
                    image,
                });
            } catch (err) {
                return res.status(500).json(err);
            }


        } catch (error) {
            return res.status(500).json(error);
        }
    });


    imageRouter.get('/get/:filename', async (req, res, next) => {
        try {
            const imageFile = await Image.findOne({ caption: req.params.filename });
            res.status(200).json({
                path: imageFile.filename,
                pathId: imageFile.fileId,
                success: true,
            });
        } catch (error) {
            return res.status(500).json({ success: false });
        }
    });


    /*
        GET: Fetches all the files in the uploads collection
    */
    imageRouter.route('/files')
        .get((req, res, next) => {
            gfs.find().toArray((err, files) => {
                if (!files || files.length === 0) {
                    return res.status(200).json({
                        success: false,
                        message: 'No files available'
                    });
                }

                files.map(file => {
                    if (file.contentType === 'image/jpg' || file.contentType === 'image/jpeg' || file.contentType === 'image/png' || file.contentType === 'image/svg') {
                        file.isImage = true;
                    } else {
                        file.isImage = false;
                    }
                });

                res.status(200).json({
                    success: true,
                    files,
                });
            });
        });

    /*
        GET: Fetches a particular file by filename
    */
    imageRouter.route('/file/:filename')
        .get((req, res, next) => {
            gfs.find({ filename: { $regex: req.params.filename } }).toArray((err, files) => {
                if (!files[0] || files.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'No files available',
                    });
                }

                if (files[0].contentType === 'image/jpg' ||
                    files[0].contentType === 'image/jpeg' ||
                    files[0].contentType === 'image/png' ||
                    files[0].contentType === 'image/svg+xml') {
                    gfs.openDownloadStreamByName(files[0].filename).pipe(res);
                } else {
                    res.status(404).json({
                        err: 'No image available',
                    });
                }
            });
        });

    /* 
        GET: Fetches a particular image and render on browser by filename
    */
    // imageRouter.route('/avatar/:filename')
    //     .get((req, res, next) => {
    //         gfs.find({ filename: req.params.filename }).toArray((err, files) => {
    //             if (!files[0] || files.length === 0) {
    //                 return res.status(200).json({
    //                     success: false,
    //                     message: 'No files available',
    //                 });
    //             }

    //             if (files[0].contentType === 'image/jpg' || files[0].contentType === 'image/jpeg' || files[0].contentType === 'image/png' || files[0].contentType === 'image/svg+xml') {
    //                 gfs.openDownloadStreamByName(req.params.filename).pipe(res);
    //             } else {
    //                 res.status(404).json({
    //                     err: 'Not an image',
    //                 });
    //             }
    //         });
    //     });

    /* 
       GET: Fetches a particular image and render on browser by id
   */
    imageRouter.route('/avatar/:id')
        .get(async (req, res, next) => {
            try {
                const files = await gfs.find(new mongoose.Types.ObjectId(req.params.id)).toArray();
                if (files[0].contentType === 'image/jpg' ||
                    files[0].contentType === 'image/jpeg' ||
                    files[0].contentType === 'image/png' ||
                    files[0].contentType === 'image/svg+xml') {
                    gfs.openDownloadStreamByName(files[0].filename).pipe(res);
                } else {
                    res.status(404).json({
                        err: 'No image available',
                    });
                }
            } catch (error) {
                res.status(404).json({ err: 'Not an image' })
            }

        });


    /*
        DELETE: Delete a particular file by an ID
    */
    imageRouter.route('/file/del/:id')
        .post((req, res, next) => {
            console.log(req.params.id);
            gfs.delete(new mongoose.Types.ObjectId(req.params.id), (err, data) => {
                if (err) {
                    return res.status(404).json({ err: err });
                }

                res.status(200).json({
                    success: true,
                    message: `File with ID ${req.params.id} is deleted`,
                });
            });
        });

    return imageRouter;
};