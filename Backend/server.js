const app = require("./app");

const dotenv = require("dotenv");
const connectDatbase = require("./config/database");



//Handling Uncaught Exception
process.on("uncaughtException",err=>{
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to the uncaught Exception`);
    process.exit(1);
})





// config

dotenv.config({ path: "backend/config/config.env" });

// Connecting database

connectDatbase();
const server = app.listen(process.env.PORT, () => {
    console.log(`server is working on http://localhost:${process.env.PORT}`);
})


// unhandled Promise rejection
process.on("unhandledRejection", err => {
    console.log(`Error:${err.message}`);
    console.log("shutting down the server due to unhandled Promise Rejection");
    server.close(() => {
        process.exit(1);
    })
})
