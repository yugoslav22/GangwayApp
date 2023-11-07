
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

ipcMain.on("new-task",async (e,args) =>{
    
    const newTask = new Task(args)
    const taskSaved = await newTask.save()
    // console.log(taskSaved)
    // Object serialization uygularken data normal gitmiyor. JSON formatına cevirmek zorundayım.
    e.reply("new-task-created",JSON.stringify(taskSaved))
})


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





























// let mainWindow

// app.on('ready', () => {
//   mainWindow = new BrowserWindow({ width: 800, height: 600,webPreferences:{
//     preload: path.join(__dirname,"preload.js")
//   } })
  
//   mainWindow.loadURL(
//     url.format({
//       pathname: path.join(__dirname, 'main.html'),
//       protocol: 'file:',
//       slashes: true
//     })
//   )
//   const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)
//   Menu.setApplicationMenu(mainMenu)

//   ipcMain.on("key",(err,data)=>{
//     console.log(data);

//   })
// })
// const mainMenuTemplate = [
//     {
//         label:"Dosya",
//         submenu:[
//             {
//                 label:"Yeni Todo Ekle"
//             },
//             {
//                 label:"Tümünü sil"
//             },
//             {
//                 label:"Cikis",
//                 role:"quit"
//             }
//         ]
//     }
// ]