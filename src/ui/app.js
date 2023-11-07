const taskForm = document.querySelector("#taskForm")
const taskName = document.querySelector("#taskName")
const taskList = document.querySelector("#taskList")


const taskCode = document.querySelector("#taskCode")
const {ipcRenderer} = require("electron")
// const electron = require("electron")
// const ipc = electron.ipcRenderer


let tasks = []

let updateStatus = false
let idTaskToUpdate = ""
let taskToUpdate = ""


function deleteTask(id) {
    const result = confirm("Are you sure to delete?")
    if(result){
        ipcRenderer.send("delete-task",id)
    }
    return
}


function generateRandomNumber() {
    const min = 10000000000;
    const max = 99999999999; 
    return Math.floor(Math.random() * (max - min + 1)) + min;
}




function changeStatus() {
    const code = taskCode.value;
//burada, tasks'ın içinde dolaşıp, inputa girilen kodu bulup değişkene atıyor.
    const taskToUpdate = tasks.find(task => task.code === parseInt(code));
    
    if (taskToUpdate) {
       
        taskToUpdate.status = taskToUpdate.status === "onboard" ? "ashore" : "onboard";

        
        ipcRenderer.send("update-status", taskToUpdate);
        renderTasks(tasks);
        taskCode.value = ""; // Alanı temizleyin
    } else {
        alert("Girilen kodla eşleşen bir görev bulunamadı.");
    }
}


ipcRenderer.on("update-status-success", (e, args) => {
    const updatedTask = JSON.parse(args);
    
    
    console.log("Görev güncellendi:", updatedTask);

    
    renderTasks(tasks);
});






function editTask(id) {
    updateStatus = true
    idTaskToUpdate = id
    const task = tasks.find(task=> task._id === id)
    taskName.value=task.name
    taskDescription.value = task.description
    
}


function renderTasks(tasks){
    const taskList = document.querySelector("#taskList");
    taskList.innerHTML = ""
    tasks.map(t=>{
        const row = document.createElement("tr");
        taskList.innerHTML += `
        
        <td>${t.name}</td>
        <td>${t.description}</td>
        <td>${t.code}</td>
        <td>${t.status}</td>
        <td>
            <button onclick="deleteTask('${t._id}')">Delete</button>
            <button onclick="editTask('${t._id}')">Edit</button>
        </td>
        
        `
        taskList.appendChild(row);
        
    })
}






taskForm.addEventListener("submit",e=>{
    e.preventDefault();


    const task = {
        name: taskName.value,
        description: taskDescription.value,
        code:generateRandomNumber()
        
    }

    
  
    // ipcRenderer.send("new-task",task)
    if (!updateStatus) {
        ipcRenderer.send("new-task",task)

    }else{
        ipcRenderer.send("update-task",{...task,idTaskToUpdate,taskToUpdate})
        updateStatus = false;
    }

    taskForm.reset() 
})

ipcRenderer.on("new-task-created",(e,args)=>{
    const newTask = JSON.parse(args);
    tasks.push(newTask)
    renderTasks(tasks)
    alert("Task Created Succesfully")
    // console.log(args)
})
ipcRenderer.send("get-tasks")

ipcRenderer.on("get-tasks",(e,args)=>{
    const tasksReceived = JSON.parse(args)
    tasks = tasksReceived
    renderTasks(tasks)
})


ipcRenderer.on("delete-task-success",(e,args)=>{
    const deletedTask = JSON.parse(args)
    const newTasks = tasks.filter(t=>{
        return t._id !== deletedTask._id
    })
    tasks = newTasks
    renderTasks(tasks)
})


ipcRenderer.on("update-task-success",(e,args)=>{
    const updatedTask = JSON.parse(args)
    tasks = tasks.map(t=>{
        if(t._id === updatedTask._id){
            t.name = updatedTask.name
            t.description = updatedTask.description
        }
        return t
    })
    renderTasks(tasks)
})



