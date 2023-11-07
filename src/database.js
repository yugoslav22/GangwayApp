const mongoose = require("mongoose")

mongoose.connect("mongodb://0.0.0.0/gangwayApp")
    .then(db => console.log("DB is connected."))
    .catch(err =>console.log(err))
