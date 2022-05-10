let socket = io();
// For each virtual device
// For each controller channel
// Default 8 controls for now

let renderDevice = function (device) {
  let container = document.createElement("div");
  let title = document.createElement("p");
  title.innerHTML = device.name;
  container.appendChild(title);
  for (let c = 0; c < 16; c++) {
    let channel = document.createElement("div");
    channel.innerHTML = "<p>Channel " + c + "</p>";
    for (let i = 0; i < 8; i++) {
      let controller = document.createElement("div");
      controller.classList.add("controller");
      controller.innerHTML = i;
      controller.addEventListener("click", () => {
        socket.emit("play_cc", {
          device: device.name,
          controller: i,
          channel: c,
        });
      });
      channel.appendChild(controller);
    }
    container.appendChild(channel);
  }
  return container;
};

socket.emit("list_devices");

socket.on("list_devices", (data) => {
  console.log(data);
  for (let d of Object.values(data)) {
    document.body.appendChild(renderDevice(d));
  }
});

window.onload = () => {
  document.getElementById("status").addEventListener("click", () => {
    console.log("test");
    socket.emit("toggle", {});
  });

  socket.on("status", (data) => {
    document.getElementById("status").innerHTML = data;
  });
};
