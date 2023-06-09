
const express = require("express");
const app = express();
var formidable = require('formidable');
var fs = require('fs');
var cors = require('cors')
const path = require("path")

require('dotenv').config()
const pinataSDK = require('@pinata/sdk');

const pinata = new pinataSDK("ece50bd3964a2160f586", "4a9797d7c51d960a22d3b7c5baa0130f57e9c581cdba1ccea847406a4bd640d9");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}


console.log(makeid(5));

function readfile(path) {

    return new Promise(function (resolve, reject) {

        console.log("File read");
        fs.readFile(path, (err, data) => {

            if (err) reject(err);

            resolve(data)
        })


    })
}


function writefile(path, data) {

    return new Promise(function (resolve, reject) {

        console.log("File write");
        fs.writeFile(path, data, function (err) {
            if (err) reject(err)
            resolve("Success")
        })


    })
}

app.use("/image", async (req, res) => {

    //NFT DETAILS

    //NFT IMAGE
    var form = new formidable.IncomingForm();




    form.parse(req, async function (err, fields, files) {

        const name = fields.name;
        const description = fields.description;
        console.log(name,description)
        const random = makeid(5)
        var oldpath = files.nft.filepath;
    
        var newpath = random+ files.nft.originalFilename 

        const data = await readfile(oldpath);

        await writefile(newpath, data);

        fs.unlink(oldpath, function (err) {
            if (err) throw err;
            console.log('Unlinked old path!');
        });

    

        const readableStreamForFile = fs.createReadStream('./' + newpath);
 
try{

    const nftHash = await pinata.pinFileToIPFS(readableStreamForFile);

}
catch(e){
    console.log(e)
}
  
       

        console.log(nftHash)

        fs.unlink(newpath, function (err) {
            if (err) throw err;
            console.log('Unlinked new path!');
        });

        var obj = {
            table: []
        };

        obj.table.push({ name: name,description, image: "https://api.ipfsbrowser.com/ipfs/get.php?hash=" + nftHash.IpfsHash });

        var json = JSON.stringify(obj);

        const metaDataFile = random + "metadata.json"

        await writefile(metaDataFile, json);

        const readableStreamForFileJSON = fs.createReadStream(`./${metaDataFile}`);

        const metadataHash = await pinata.pinFileToIPFS(readableStreamForFileJSON)

        console.log(metadataHash)

       fs.unlink(metaDataFile, function (err) {
            if (err) throw err;
            console.log('Unlinked metaData path!');
        });

        res.json({ data: metadataHash.IpfsHash })



    });









})

app.use("/", (req, res) => {



    res.send("Hello")

})




app.listen(3001);