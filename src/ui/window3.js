const taskForm = document.querySelector("#taskForm")
const taskName = document.querySelector("#taskName")
const taskDescription = document.querySelector("#taskDescription")
const taskList = document.querySelector("#taskList")
const taskCode = document.querySelector("#taskCode")
const {ipcRenderer} = require("electron")
    
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
 
  
    
function buildTaskData(base64Data) {
  return {
      name: taskName.value,
      description: taskDescription.value,
      photo: base64Data,
  };
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
  return base64Data
}




taskForm.addEventListener("submit",e=>{
  e.preventDefault();
  
  const base64Data = takepicture();
  const taskData = buildTaskData(base64Data);
  console.log(taskData);
  
  ipcRenderer.send("win3ToWin1",taskData)

})


ipcRenderer.on('task-saved', (event, message) => {
  console.log('Received Message:', message);
 
});
