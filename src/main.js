
const path = require('path')
const url = require('url')
const mongoose = require('mongoose');
const { app, BrowserWindow, ipcMain,Menu,protocol,webContents } = require('electron')
const Task = require("./models/Task")
require("./database")


app.allowRendererProcessReuse = false




//****************************************************************** */


app.whenReady().then(() => {

    

    let window1; 
    let window2;
    let window3;
    



    const mainMenuTemplate=[
        {
            label:"Dosya",
            submenu:[
                {
                    label:"Change Status",
                    accelerator:process.platform == "darwin"?"Command+B":"Ctrl+B",
                    click: () => {
                     
                        if (!window2) {
                            window2 = createWindow2();
                        } else {
                            window2.show();
                        }
                    }
                },
                {
                    label:"Add Passenger",
                    accelerator:process.platform == "darwin"?"Command+N":"Ctrl+N",
                    click: () => {
                       
                        if (!window3) {
                            window3 = createWindow3();
                        } else {
                            window3.show();
                        }
                    }
                },
                
                {
                    label:"Exit",
                    accelerator:process.platform == "darwin"?"Command+Q":"Ctrl+Q",
                    role:"quit"
                    
                }
            ]
    },
        {
            label:"Dev Tools",
            submenu:[
                {
                    label:"Open DevTools",
                    click(item,focusedWindow){
                        focusedWindow.toggleDevTools()
                    }
                },
                {
                    label:"Refresh",
                    role:"reload"
                }
            ]
        }   
    ]
    


/********************************************************** */


function createWindow1 () {
    let window1 = new BrowserWindow({width: 1920,
        height: 1080,
        
        webPreferences:{
            //nodeIntegration true yapılarak ana işlem ile node.js arasında direkt iletişim kurulur.
            sandbox: false,
            nodeIntegration:true,
            contextIsolation: false,
            webSecurity: true,
        }
    })
    
    window1.loadURL(`file://${__dirname}/window1.html`)

    
    window1.on('closed', function () {
       window1 = null
    })
    return window1
}

function createWindow2 () {
    let window2 = new BrowserWindow({width: 470,
        height: 600,
        x: 0,
        y:0,
        
        webPreferences:{
            
            sandbox: false,
            nodeIntegration:true,
            contextIsolation: false,
            webSecurity: true,
        }
    })
    
    window2.loadURL(`file://${__dirname}/window2.html`)

    
   
    window2.on('close', (event) => {
        if (window2.isVisible()) {
            event.preventDefault();
            window2.hide();
        }
    });
    window2.hide();
    return window2
}


function createWindow3 () {
    let window3 = new BrowserWindow({width: 470,
        height: 600,
        x: 470,
        y:0,
        webPreferences:{
            
            sandbox: false,
            nodeIntegration:true,
            contextIsolation: false,
            webSecurity: true,
        }
    })
    
    window3.loadURL(`file://${__dirname}/window3.html`)

   
    window3.on('close', (event) => {
        if (window3.isVisible()) {
            event.preventDefault();
            window3.hide();
        }
    });
    window3.hide();
    return window3
}
















    
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
    
   
    ipcMain.on("get-tasks", async (e, args) => {
        const tasks = await Task.find();
        e.reply("get-tasks", JSON.stringify(tasks));

        if (!window2) {
            window2 = createWindow2();
        } else {
            window2.webContents.send('tasksforWin2', JSON.stringify(tasks));
        }
        if (!window3) {
            window3 = createWindow3();
        } else {
            window3.webContents.send('tasksforWin3', JSON.stringify(tasks));
        }
    });
    
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
        
        window2.webContents.send( 'updatedStatueforWin2',JSON.stringify(updatedTask) );
    });
    
    ipcMain.on("status-change-button-clicked", (e, code) => {
        console.log("code",code)
       
        window1.webContents.send('status-change-button-clicked', code);
    });

    ipcMain.on("win3ToWin1", (e, args) => {
        console.log("args",args)
       
        e.reply('task-saved', args);
        window1.webContents.send('task-savedForWin1', args);
    });



    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)
    Menu.setApplicationMenu(mainMenu)

    window1 = createWindow1();
    
  
});






//************************************************************************************************ */







