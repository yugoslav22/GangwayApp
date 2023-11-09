const taskForm = document.querySelector("#taskForm")
const taskName = document.querySelector("#taskName")
const taskList = document.querySelector("#taskList")
const taskCode = document.querySelector("#taskCode")
const {ipcRenderer} = require("electron")


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

(() => {
    
    const width = 320; 
    let height = 0; 
  
    let streaming = false;
  
    let video = null;
    let canvas = null;
    let photo = null;
    let startbutton = null;
  
    function showViewLiveResultButton() {
      if (window.self !== window.top) {
        
        document.querySelector(".contentarea").remove();
        const button = document.createElement("button");
        button.textContent = "View live result of the example code above";
        document.body.append(button);
        button.addEventListener("click", () => window.open(location.href));
        return true;
      }
      return false;
    }
  
    function startup() {
      if (showViewLiveResultButton()) {
        return;
      }
      video = document.getElementById("video");
      canvas = document.getElementById("canvas");
      photo = document.getElementById("photo");
      startbutton = document.getElementById("startbutton");
  
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
          video.srcObject = stream;
          video.play();
        })
        .catch((err) => {
          console.error(`An error occurred: ${err}`);
        });
  
      video.addEventListener(
        "canplay",
        (ev) => {
          if (!streaming) {
            height = video.videoHeight / (video.videoWidth / width);
  
            if (isNaN(height)) {
              height = width / (4 / 3);
            }
  
            video.setAttribute("width", width);
            video.setAttribute("height", height);
            canvas.setAttribute("width", width);
            canvas.setAttribute("height", height);
            streaming = true;
          }
        },
        false,
      );
  
      startbutton.addEventListener(
        "click",
        (ev) => {
          takepicture();
          ev.preventDefault();
        },
        false,
      );
  
      clearphoto();
    }

    function clearphoto() {
      const context = canvas.getContext("2d");
      context.fillStyle = "#AAA";
      context.fillRect(0, 0, canvas.width, canvas.height);
  
      const data = canvas.toDataURL("image/png");
      photo.setAttribute("src", data);
    }
  
    
    window.addEventListener("load", startup, false);
  })();
  


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
        const imageCell = document.createElement("td");
        const imageElement = document.createElement("img");
        imageElement.src = t.photo;  // Kullanıcının fotoğrafını burada gösteriyoruz
        // imageElement.alt = "User Photo";
        // imageCell.appendChild(imageElement);
        taskList.innerHTML += `
        <td><img width="200" height="150" src="data:image/png;base64,${t.photo}" alt="User Photo"></td>
        <td>${t.name}</td>
        <td>${t.description}</td>
        <td>${t.code}</td>
        <td>${t.status}</td>
        
        
        
        
        <td>
            <button onclick="deleteTask('${t._id}')">Delete</button>
            <button onclick="editTask('${t._id}')">Edit</button>
        </td>
        
        `
        // row.appendChild(imageCell);
        taskList.appendChild(row);
        
    })
}


function takepicture() {
    const context = canvas.getContext("2d");
    const width = 320;
    const height = video.videoHeight / (video.videoWidth / width);

    canvas.width = width;
    canvas.height = height;
    context.drawImage(video, 0, 0, width, height);

    const data = canvas.toDataURL("image/png");
    const base64Data = data.replace(/^data:image\/png;base64,/, "");
    photo.setAttribute("src", data);

    const task = {
        name: taskName.value,
        description: taskDescription.value,
        code: generateRandomNumber(),
        photo: base64Data, // Kişiye özel fotoğraf
    };

    

    if (!updateStatus) {
        ipcRenderer.send("new-task", { ...task, photo: base64Data });
    } else {
        ipcRenderer.send("update-task", { ...task, idTaskToUpdate, taskToUpdate });
        updateStatus = false;
    }

    taskForm.reset();
}


taskForm.addEventListener("submit",e=>{
    e.preventDefault();

    takepicture()
    
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



