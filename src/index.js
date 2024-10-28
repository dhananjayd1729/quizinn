const express = require("express");
const dotenv = require("dotenv");
dotenv.config();



const app = express();
const PORT = process.env.PORT;


const startAndPrepareServer = () => {
    app.use(express.json());
    app.use(express.urlencoded({extended: false}));

    app.listen(() => {
        console.log(`Server has started on PORT: ${PORT}`);
    })
}

startAndPrepareServer();