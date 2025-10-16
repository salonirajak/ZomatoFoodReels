// This file appears to be a duplicate/conflicting version of storage.service.js
// Renaming this file to avoid confusion. The active implementation is in storage.service.js
// which handles local file storage.

/*
const ImageKit = require("imagekit");
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});


async function uploadFile(file,fileName){
    const result = await imagekit.upload({
        file: file,  //required
        fileName: fileName  //required
    });
    return result;
}
module.exports={
    uploadFile
}
*/