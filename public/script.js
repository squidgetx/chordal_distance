let socket = io();
const ACK_INTERVAL = 500;
// For each virtual device
// For each controller channel
// Default 8 controls for now

let renderDevice = function (device) {
  let container = document.createElement("div");
  let title = document.createElement("h3");
  title.innerHTML = `Device: <b>${device.name}</b>`;
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

let setup_slider = function (name) {
  const aslider = document.getElementById(`angle${name}_slider`);
  aslider.oninput = () => {
    console.log(aslider.value);
    socket.emit("angle" + name, parseInt(aslider.value) / 100);
  };
};

let setup_monitor = function (m, socket) {
  let canvas = document.createElement("canvas");
  canvas.setAttribute("width", 400);
  canvas.setAttribute("height", 200);
  let smoothie = new SmoothieChart();
  let timeseries = new TimeSeries();
  smoothie.streamTo(canvas);
  smoothie.addTimeSeries(timeseries, {
    strokeStyle: "#efe",
    lineWidth: 2,
    fillStyle: "#444",
  });
  socket.on(m.id, (data) => timeseries.append(new Date().getTime(), data));
  m.innerHTML = `<p class='signal-label'>${m.id}</p>`;
  m.appendChild(canvas);
};

let setup_monitors = function (socket) {
  let monitors = document.getElementsByTagName("signal-monitor");
  for (let m of monitors) {
    setup_monitor(m, socket);
  }
};

let render_connection_status = function (connected) {
  const connection_status = document.getElementById("connected");
  connection_status.innerHTML = "<h3>Connection Status</h3>";
  for (let device_id in connected) {
    let p = document.createElement("p");
    let cstring = connected[device_id] ? "connected" : "disconnected";
    p.innerHTML = `${device_id}: <span class='${cstring}'>${cstring}</span>`;
    connection_status.appendChild(p);
  }
};

window.onload = () => {
  document.getElementById("status").addEventListener("click", () => {
    console.log("test");
    socket.emit("toggle", {});
  });

  socket.on("status", (data) => {
    document.getElementById("status").innerHTML = data;
  });

  const slider = document.getElementById("tension_slider");
  slider.oninput = () => {
    console.log(slider.value);
    socket.emit("tension", parseInt(slider.value));
  };
  const connected = {
    Server: false,
    Primary: false,
    Secondary: false,
  };
  socket.on("connect_ble", (data) => {
    connected[data] = true;
    render_connection_status(connected);
  });
  socket.on("disconnect_ble", (data) => {
    connected[data] = false;
    render_connection_status(connected);
  });
  setup_slider("X1");
  setup_slider("X2");
  setup_slider("Y1");
  setup_slider("Y2");
  setup_monitors(socket);

  // every 0.5s, check to see if the server is alive
  let lastAckTime = 0;
  setInterval(() => {
    socket.emit("server_check");
    let now = new Date().getTime();
    if (now - lastAckTime > ACK_INTERVAL * 1.5) {
      connected["Server"] = false;
    } else {
      connected["Server"] = true;
    }
    render_connection_status(connected);
  }, ACK_INTERVAL);
  socket.on("server_ack", (time) => {
    lastAckTime = new Date().getTime();
  });

  const button = document.getElementById("calibrate");
  const cal_status = document.getElementById("calibrate-status");
  button.addEventListener("click", () => {
    socket.emit("calibrate_begin");
    button.setAttribute("disabled", true);
  });

  socket.on("calibrate_message", (data) => {
    cal_status.innerHTML = data;
  });

  socket.on("calibrate_finish", (_) => {
    cal_status.innerHTML = "";
    button.removeAttribute("disabled");
  });

  const restart = document.getElementById("restart");
  restart.addEventListener("click", () => {
    socket.emit("restart");
  });
};
