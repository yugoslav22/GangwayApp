
const path = require('path')
const url = require('url')
const mongoose = require('mongoose');

const { app, BrowserWindow, ipcMain,Menu } = require('electron')

const Task = require("./models/Task")

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 700,
        webPreferences:{
            //nodeIntegration true yapılarak ana işlem ile node.js arasında direkt iletişim kurulur.
            sandbox: false,
            nodeIntegration:true,
            contextIsolation: false,
            webSecurity: true,
        }
    })
    

    win.loadFile("src/index.html")
}


//   function openChangeStatusWindow() {
//     const changeStatusWindow = new BrowserWindow({
//       width: 400,
//       height: 300,
//       webPreferences: {
//         sandbox: false,
//         nodeIntegration:true,
//         contextIsolation: false,
//         webSecurity: true,
//       },
//     });
  
//    
//     changeStatusWindow.loadFile('src/status.html');
  
//     
//     changeStatusWindow.show();
//   }



  ipcMain.on("new-task", async (e, args) => {
   
    console.log("Received new-task:", args);
    try {
        const newTask = new Task(args);
        const taskSaved = await newTask.save();
        console.log("Saved task:", taskSaved);

        e.reply("new-task-created", JSON.stringify(taskSaved));
    } catch (error) {
        console.error("Error saving task:", error);
        e.reply("new-task-error", JSON.stringify({ error: "Error saving task" }));
    }
});


ipcMain.on("get-tasks",async (e,args)=>{
    const tasks = await Task.find()
    e.reply("get-tasks",JSON.stringify(tasks))
})


ipcMain.on("delete-task",async(e,args)=>{
   const taskDeleted = await Task.findByIdAndDelete(args)
   e.reply("delete-task-success",JSON.stringify(taskDeleted))
})

ipcMain.on("update-task",async (e,args)=>{
    
    const updatedTask = await Task.findByIdAndUpdate(
        args.idTaskToUpdate,{
            name:args.name,
            description:args.description
        },{new:true})
        e.reply("update-task-success",JSON.stringify(updatedTask))

})


ipcMain.on("update-status", async (e, args) => {
    const updatedTask = await Task.findByIdAndUpdate(
        args._id, 
        { status: args.status },
        { new: true }
        
    );
    console.log("success")
    e.reply("update-status-success", JSON.stringify(updatedTask));
});



module.exports = {createWindow}