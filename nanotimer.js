function NanoTimer(log) {
  var version = process.version;
  var major = version.split(".")[0];
  major = major.split("v")[1];
  var minor = version.split(".")[1];

  if (major == 0 && minor < 10) {
    console.log(
      "Error: Please update to the latest version of node! This library requires 0.10.x or later"
    );
    process.exit(0);
  }

  //Time reference variables
  this.intervalT1 = null;
  this.timeOutT1 = null;
  this.intervalCount = 1;

  //Deferred reference indicator variables.  Indicate whether the timer used/will use the deferred call. ie - delay/interval > 25ms
  this.deferredInterval = false;
  this.deferredTimeout = false;

  //Deferred reference variables.  Used to clear the native js timeOut calls
  this.deferredTimeoutRef = null;
  this.deferredIntervalRef = null;

  //Callback reference variables.  Used to be able to still successfully call callbacks when timeouts or intervals are cleared.
  this.timeoutCallbackRef = null;
  this.intervalCallbackRef = null;

  //Immediate reference variables. Used to clear functions scheduled with setImmediate from running in the event timeout/interval is cleared.
  this.timeoutImmediateRef = null;
  this.intervalImmediateRef = null;

  this.intervalErrorChecked = false;

  this.intervalType = "";

  this.timeoutTriggered = false;

  if (log) {
    this.logging = true;
  }
}

NanoTimer.prototype.setInterval = function (task, args, interval, callback) {
  if (!this.intervalErrorChecked) {
    //Task error handling
    if (!task) {
      console.log("A task function must be specified to setInterval");
      process.exit(1);
    } else {
      if (typeof task != "function") {
        console.log(
          "Task argument to setInterval must be a function reference"
        );
        process.exit(1);
      }
    }

    //Interval error handling
    if (!interval) {
      console.log("An interval argument must be specified");
      process.exit(1);
    } else {
      if (typeof interval != "number") {
        console.log(
          "Interval argument to setInterval must be a number specifying the number of milliseconds"
        );
        process.exit(1);
      }
    }

    //This ref is used if deferred timeout is cleared, so the callback can still be accessed
    if (callback) {
      if (typeof callback != "function") {
        console.log(
          "Callback argument to setInterval must be a function reference"
        );
        process.exit(1);
      } else {
        this.intervalCallbackRef = callback;
      }
    }

    this.intervalTime = interval * 1000000;
    this.intervalErrorChecked = true;
  }

  //Avoid dereferencing inside of function objects later
  //Must be performed on every execution
  var thisTimer = this;

  if (this.intervalTime > 0) {
    //Check and set constant t1 value.
    if (this.intervalT1 == null) {
      this.intervalT1 = process.hrtime();
    }

    //Check for overflow.  Every 8,000,000 seconds (92.6 days), this will overflow
    //and the reference time T1 will be re-acquired.  This is the only case in which error will
    //propagate.
    if (this.intervalTime * this.intervalCount > 8000000000000000) {
      this.intervalT1 = process.hrtime();
      this.intervalCount = 1;
    }

    //Get comparison time
    this.difArray = process.hrtime(this.intervalT1);
    this.difTime = this.difArray[0] * 1000000000 + this.difArray[1];

    //If updated time < expected time, continue
    //Otherwise, run task and update counter
    if (this.difTime < this.intervalTime * this.intervalCount) {
      //Can potentially defer to less accurate setTimeout if intervaltime > 25ms
      if (this.intervalTime > 25000000) {
        if (this.deferredInterval == false) {
          this.deferredInterval = true;
          var msDelay = (this.intervalTime - 25000000) / 1000000.0;
          this.deferredIntervalRef = setTimeout(function () {
            thisTimer.setInterval(task, args, interval, callback);
          }, msDelay);
        } else {
          this.deferredIntervalRef = null;
          this.intervalImmediateRef = setImmediate(function () {
            thisTimer.setInterval(task, args, interval, callback);
          });
        }
      } else {
        this.intervalImmediateRef = setImmediate(function () {
          thisTimer.setInterval(task, args, interval, callback);
        });
      }
    } else {
      this.intervalImmediateRef = null;

      if (this.logging) {
        console.log("nanotimer log: " + "cycle time at - " + this.difTime);
      }

      if (args) {
        task.apply(null, args);
      } else {
        task();
      }

      //Check if the intervalT1 is still not NULL. If it is, that means the task cleared the interval so it should not run again.
      if (this.intervalT1) {
        this.intervalCount++;
        this.deferredInterval = false;
        this.intervalImmediateRef = setImmediate(function () {
          thisTimer.setInterval(task, args, interval, callback);
        });
      }
    }

    //If interval = 0, run as fast as possible.
  } else {
    //Check and set constant t1 value.
    if (this.intervalT1 == null) {
      this.intervalT1 = process.hrtime();
    }

    if (args) {
      task.apply(null, args);
    } else {
      task();
    }

    // This needs to be re-checked here incase calling task turned this off
    if (this.intervalT1) {
      this.intervalImmediateRef = setImmediate(function () {
        thisTimer.setInterval(task, args, interval, callback);
      });
    }
  }
};

NanoTimer.prototype.setTimeout = function (task, args, delay, callback) {
  //Task error handling
  if (!task) {
    console.log("A task function must be specified to setTimeout");
    process.exit(1);
  } else {
    if (typeof task != "function") {
      console.log("Task argument to setTimeout must be a function reference");
      process.exit(1);
    }
  }

  //Delay error handling
  if (!delay) {
    console.log("A delay argument must be specified");
    process.exit(1);
  } else {
    if (typeof delay != "number") {
      console.log(
        "Delay argument to setTimeout must be a number (milliseconds)"
      );
      process.exit(1);
    }
  }

  //This ref is used if deferred timeout is cleared, so the callback can still be accessed
  if (callback) {
    if (typeof callback != "function") {
      console.log(
        "Callback argument to setTimeout must be a function reference"
      );
      process.exit(1);
    } else {
      this.timeoutCallbackRef = callback;
    }
  }

  //Avoid dereferencing
  var thisTimer = this;

  if (this.timeoutTriggered) {
    this.timeoutTriggered = false;
  }

  var delayTime = delay * 1000000;

  //Set marker
  if (this.timeOutT1 == null) {
    this.timeOutT1 = process.hrtime();
  }

  var difArray = process.hrtime(this.timeOutT1);
  var difTime = difArray[0] * 1000000000 + difArray[1];

  if (difTime < delayTime) {
    //Can potentially defer to less accurate setTimeout if delayTime > 25ms
    if (delayTime > 25000000) {
      if (this.deferredTimeout == false) {
        this.deferredTimeout = true;
        var msDelay = (delayTime - 25000000) / 1000000.0;
        this.deferredTimeoutRef = setTimeout(function () {
          thisTimer.setTimeout(task, args, delay, callback);
        }, msDelay);
      } else {
        this.deferredTimeoutRef = null;
        this.timeoutImmediateRef = setImmediate(function () {
          thisTimer.setTimeout(task, args, delay, callback);
        });
      }
    } else {
      this.timeoutImmediateRef = setImmediate(function () {
        thisTimer.setTimeout(task, args, delay, callback);
      });
    }
  } else {
    this.timeoutTriggered = true;
    this.timeoutImmediateRef = null;
    this.timeOutT1 = null;
    this.deferredTimeout = false;

    if (this.logging == true) {
      console.log("nanotimer log: " + "actual wait - " + difTime);
    }

    if (args) {
      task.apply(null, args);
    } else {
      task();
    }

    if (callback) {
      var data = { waitTime: difTime };
      callback(data);
    }
  }
};

NanoTimer.prototype.clearInterval = function () {
  if (this.deferredIntervalRef) {
    clearTimeout(this.deferredIntervalRef);

    this.deferredInterval = false;
  }

  if (this.intervalImmediateRef) {
    clearImmediate(this.intervalImmediateRef);
  }

  this.intervalT1 = null;
  this.intervalCount = 1;
  this.intervalErrorChecked = false;

  if (this.intervalCallbackRef) {
    this.intervalCallbackRef();
  }
};

NanoTimer.prototype.clearTimeout = function () {
  // Only do something if this is not being called as a result
  // of the timeout triggering
  if (this.timeoutTriggered == false) {
    if (this.deferredTimeoutRef) {
      clearTimeout(this.deferredTimeoutRef);

      if (this.timeOutT1) {
        var difArray = process.hrtime(this.timeOutT1);
        var difTime = difArray[0] * 1000000000 + difArray[1];
      }

      this.deferredTimeout = false;
    }

    if (this.timeoutImmediateRef) {
      clearImmediate(this.timeoutImmediateRef);
    }

    this.timeOutT1 = null;

    if (this.timeoutCallbackRef) {
      var data = { waitTime: difTime };
      this.timeoutCallbackRef(data);
    }
  }
};

NanoTimer.prototype.hasTimeout = function () {
  return this.timeOutT1 != null;
};

module.exports = NanoTimer;
