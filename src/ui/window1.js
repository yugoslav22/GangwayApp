const taskForm = document.querySelector("#taskForm")
const taskName = document.querySelector("#taskName")
const taskList = document.querySelector("#taskList")
const taskCode = document.querySelector("#taskCode")
const {ipcRenderer} = require("electron")


let tasks = []

let updateStatus = false
let idTaskToUpdate = ""
let taskToUpdate = ""
let receivedTaskData;


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

function changeStatus(code) {
   
//burada, tasks'ın içinde dolaşıp, inputa girilen kodu bulup değişkene atıyor.
    const taskToUpdate = tasks.find(task => task.code === parseInt(code));
    
    if (taskToUpdate) {
       
        taskToUpdate.status = taskToUpdate.status === "ONBOARD" ? "ASHORE" : "ONBOARD";

        
        ipcRenderer.send("update-status", taskToUpdate);
        renderTasks(tasks);
        taskCode.value = "";
    } else {
        alert("Girilen kodla eşleşen bir görev bulunamadı.");
    }
}

function editTask(id) {
    updateStatus = true
    idTaskToUpdate = id
    const task = tasks.find(task=> task._id === id)
    taskName.value=task.name
    taskDescription.value = task.description
    
}

function renderTasks(tasks) {
  const taskList = document.querySelector("#taskList");
  taskList.innerHTML = "";

  tasks.forEach(task => {
    const row = document.createElement("tr");

    const imageCell = document.createElement("td");
    const imageElement = document.createElement("img");
    imageElement.src = `data:image/png;base64,${task.photo}`;
    imageElement.width = 200;
    imageElement.height = 150;
    imageCell.appendChild(imageElement);
    row.appendChild(imageCell);

    const nameCell = document.createElement("td");
    nameCell.textContent = task.name;
    row.appendChild(nameCell);

    const descCell = document.createElement("td");
    descCell.textContent = task.description;
    row.appendChild(descCell);

    const codeCell = document.createElement("td");
    codeCell.textContent = task.code;
    row.appendChild(codeCell);

    const statusCell = document.createElement("td");
    statusCell.textContent = task.status;
    statusCell.style.color = task.status === 'ONBOARD' ? 'green' : 'red';
    row.appendChild(statusCell);

    const actionsCell = document.createElement("td");

    
    const copyButton = document.createElement("button-copy");
    copyButton.textContent = "Copy";
    copyButton.onclick = () => copyToClipboard(task.code);
    actionsCell.appendChild(copyButton);
  
    actionsCell.appendChild(document.createTextNode(' '));
    
    const deleteButton = document.createElement("button");
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = () => deleteTask(task._id);
    actionsCell.appendChild(deleteButton);

    row.appendChild(actionsCell);

    taskList.appendChild(row);
  });
}

function copyToClipboard(code) {
  const tempInput = document.createElement("input");
  tempInput.value = code;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand("copy");
  document.body.removeChild(tempInput);

  
}

function takepicture() {
  
  const base64Data = receivedTaskData ? receivedTaskData.photo : null;

  if (base64Data) {
    const task = buildTaskData(base64Data);

    
    task.code = generateRandomNumber();

    handleTask(task, base64Data);
    taskForm.reset();
  } else {
    console.error('Base64 data is not available.');
  }
}

function buildTaskData(base64Data) {
  if (!receivedTaskData) {
    console.error('Received task data is not available.');
    return null;
  }

  return {
    name: receivedTaskData.name,
    description: receivedTaskData.description,
    photo: base64Data,
  };
}

function handleTask(task,base64Data) {
  if (!updateStatus) {
      ipcRenderer.send("new-task", { ...task, photo: base64Data });
  } else {
      ipcRenderer.send("update-task", { ...task, idTaskToUpdate, taskToUpdate });
      updateStatus = false;
  }
}




taskForm.addEventListener("submit",e=>{
    e.preventDefault();
   
    takepicture()
})



ipcRenderer.on("status-change-button-clicked", (e, code) => {
  console.log("code",code)
  changeStatus(code)
  
});

ipcRenderer.on("update-status-success", (e, args) => {
    const updatedTask = JSON.parse(args);
    
    
    console.log("Görev güncellendi:", updatedTask);

    
    renderTasks(tasks);
});

ipcRenderer.on('task-savedForWin1', (e, args) => {
  console.log("args",args)
  receivedTaskData = args; 
  const taskData = buildTaskData(receivedTaskData.photo);
  console.log("Built Task Data", taskData);
  const taskForm = document.querySelector("#taskForm");
  if (taskForm) {
    const submitEvent = new Event('submit', {
      bubbles: true,
      cancelable: true,
    });
    taskForm.dispatchEvent(submitEvent);
  }
});

ipcRenderer.on("new-task-created",(e,args)=>{
    const newTask = JSON.parse(args);
    tasks.push(newTask)
    renderTasks(tasks)
    alert("Task Created Succesfully")
    
})

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

ipcRenderer.send("get-tasks")

