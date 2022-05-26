const { exec } = require("child_process");

let restart_all = function () {
  // Close all applications and send a restart command to the OS
  console.log("restarting");
  let exec_handler = (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  };
  exec("./restart.sh", exec_handler);
  process.exit();
};

module.exports = { restart_all };
