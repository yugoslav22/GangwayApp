const {model,Schema} = require("mongoose")

const newTaskSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    code: {
      type: Number, 
      required: true
    },
    status: {
        type: String,
        enum: ["onboard", "ashore"], 
        default: "onboard" 
    }
})

module.exports = model("Task",newTaskSchema)