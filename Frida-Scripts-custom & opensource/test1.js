if (Java.available) {
    Java.perform(function () {
        console.log("Starting root detection and anti-instrumentation bypass");

        // Hook Anti-Frida Detection (Detecting Active Hooks or Instrumentation)
        var Debug = Java.use("android.os.Debug");
        Debug.isDebuggerConnected.implementation = function () {
            console.log("Bypassing Debugger detection");
            return false;
        };

        Debug.waitForDebugger.implementation = function () {
            console.log("Bypassing Debugger wait");
            return false;
        };

        // Hook Anti-Tampering Detection (Instrumentation Checks)
        var ActivityThread = Java.use("android.app.ActivityThread");
        ActivityThread.currentActivityThread.overload().implementation = function () {
            console.log("Preventing instrumentation detection");
            var activityThread = this.currentActivityThread();
            activityThread.mInstrumentation = null; // Reset any instrumentation
            return activityThread;
        };

        // Bypass RootBeer Checks
        var RootBeerClass = Java.use("com.scottyab.rootbeer.RootBeer");
        RootBeerClass.checkForBinary.implementation = function () {
            console.log("Bypassing RootBeer binary check");
            return false;
        };

        RootBeerClass.isRooted.implementation = function () {
            console.log("Bypassing RootBeer isRooted check");
            return false;
        };

        RootBeerClass.checkForDangerousProps.implementation = function () {
            console.log("Bypassing RootBeer dangerous props check");
            return false;
        };

        // Native SU Path Check Hook
        var libc = Module.findExportByName("libc.so", "stat");
        if (libc) {
            Interceptor.attach(libc, {
                onEnter: function (args) {
                    var path = Memory.readUtf8String(args[0]);
                    if (path && path.includes("su")) {
                        console.log("Bypassing native SU check for: " + path);
                        Memory.writeUtf8String(args[0], "/nonexistent/path");
                    }
                },
            });
        }

        // Bypass Runtime.exec for Commands like 'su'
        var Runtime = Java.use("java.lang.Runtime");
        Runtime.exec.overload("java.lang.String").implementation = function (command) {
            console.log("Intercepting Runtime.exec: " + command);
            if (command.includes("su") || command.includes("magisk")) {
                console.log("Bypassing root-related command execution");
                return null; // Ignore commands trying to check for root
            }
            return this.exec(command);
        };

        // Bypass File.exists for SU Binary Paths
        var File = Java.use("java.io.File");
        File.exists.implementation = function () {
            var path = this.getAbsolutePath();
            if (path.includes("su") || path.includes("magisk")) {
                console.log("Bypassing File.exists check for path: " + path);
                return false; // Pretend file doesn't exist
            }
            return this.exists();
        };

        // Bypass Process Termination Signals
        var Process = Java.use("android.os.Process");
        Process.killProcess.implementation = function (pid) {
            console.log("Bypassing process termination for pid: " + pid);
            return; // Prevent the process from being killed
        };

        // Prevent Signal-based Process Kills
        var libc_kill = Module.findExportByName("libc.so", "kill");
        if (libc_kill) {
            Interceptor.attach(libc_kill, {
                onEnter: function (args) {
                    console.log("Intercepting kill signal for pid: " + args[0].toInt32());
                    var signal = args[1].toInt32();
                    if (signal === 9) { // SIGKILL
                        console.log("Preventing SIGKILL signal");
                        args[1] = ptr(0); // Change signal to 0 (noop)
                    }
                },
            });
        }

        console.log("All root detection and anti-instrumentation hooks applied!");
    });
} else {
    console.log("Java runtime not available!");
}
