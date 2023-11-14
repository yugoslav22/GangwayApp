const taskForm = document.querySelector("#taskForm")
const taskName = document.querySelector("#taskName")
const taskList = document.querySelector("#taskList")
const taskCode = document.querySelector("#taskCode")
const {ipcRenderer} = require("electron")
let updateStatus = false





document.addEventListener("DOMContentLoaded", () => {
    const statusChangeButton = document.querySelector("#statusChangeButton");
    statusChangeButton.addEventListener("click", (event) => {
        event.preventDefault(); 

        const code = taskCode.value; 
        console.log("code", code);
        ipcRenderer.send("status-change-button-clicked", code); // Kodu main.js'e ileti olarak gönder
        taskCode.value=""
    });
})









ipcRenderer.on('updatedStatueforWin2', (e, args) => {
    const updatedTask = JSON.parse(args);
    document.getElementById('name').innerText = `${updatedTask.name}`;
    document.getElementById('surname').innerText = `${updatedTask.description}`;
    // document.getElementById('status').innerText = `${updatedTask.status}`;
    document.getElementById('taskImage').src = `data:image/png;base64, ${updatedTask.photo}`;

    console.log(updatedTask.status)
    const statusElement = document.getElementById('status');

    statusElement.textContent = `${updatedTask.status}`;

    if (updatedTask.status === 'ONBOARD') {
        statusElement.style.color = 'green';
    } else if (updatedTask.status === 'ASHORE') {
        statusElement.style.color = 'red';
    }
});



