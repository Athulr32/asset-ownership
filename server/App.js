import express from "express";
const app = express();
import formidable from "formidable";
import cors from "cors";
import path from "path"
import * as dotenv from 'dotenv'
import { FilebaseClient, File } from '@filebase/client'
import fs from "fs"


const filebaseClient = new FilebaseClient({ token: 'MzlENzdCRTI1RUNCQjRGMDQwNzk6SkZCeVJqdHNFN0ZQZjZvSmtub1RJYnRWZHFQNTNaN2UyY05VZ0d2eDpoYWNrYXRob24tZ2Rn' })


dotenv.config()

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}




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
        console.log(name, description)
        const random = makeid(5)
        var oldpath = files.nft.filepath;

        var newpath = random + files.nft.originalFilename

        const data = await readfile(oldpath);

        await writefile(newpath, data);

        fs.unlink(oldpath, function (err) {
            if (err) throw err;
            console.log('Unlinked old path!');
        });




        const foo = await readfile("./" + newpath)
        console.log(newpath)
        const metadata = await filebaseClient.store({
            name: 'Exmple',
            description: 'An example image.',
            
            image: new File(
                [
                    foo
                ],
                'example.jpeg',
                { type: 'image/jpg' }
            ),
        })
        console.log(metadata.url)


        fs.unlink(newpath, function (err) {
            if (err) throw err;
            console.log('Unlinked new path!');
        });

        res.json({ cid: metadata.url })




    });









})

app.use("/", (req, res) => {



    res.send("Hello")

})




app.listen(3001);