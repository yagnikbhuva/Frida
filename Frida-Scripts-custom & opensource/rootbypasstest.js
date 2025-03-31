if (Java.available) {
    Java.perform(function () {
        console.log("Starting root detection bypass for com.iiits.avvnl_fms");

        /*******************************
         * Anti-Debugging Checks
         *******************************/
        var Debug = Java.use("android.os.Debug");
        Debug.isDebuggerConnected.implementation = function () {
            console.log("[*] Bypassing Debug.isDebuggerConnected");
            return false;
        };

        /*******************************
         * Spoof Build Properties
         *******************************/
        var System = Java.use("java.lang.System");
        System.getProperty.overload('java.lang.String').implementation = function (prop) {
            console.log("[*] getProperty called for: " + prop);
            if (prop === "ro.build.tags") {
                console.log("[*] Spoofing ro.build.tags to release-keys");
                return "release-keys";
            } else if (prop === "ro.debuggable") {
                console.log("[*] Spoofing ro.debuggable to 0");
                return "0";
            }
            return this.getProperty.call(this, prop);
        };

        var Build = Java.use("android.os.Build");
        Build.TAGS.value = "release-keys";

        /*******************************
         * Bypass RootBeer Library (if present)
         *******************************/
        try {
            var RootBeer = Java.use("com.scottyab.rootbeer.RootBeer");
            RootBeer.isRooted.implementation = function () {
                console.log("[*] Bypassing RootBeer.isRooted");
                return false;
            };
        } catch (e) {
            console.log("[*] RootBeer not found, skipping: " + e);
        }

        /*******************************
         * Hook Native File Checks
         *******************************/
        var libc_stat = Module.findExportByName("libc.so", "stat");
        if (libc_stat) {
            Interceptor.attach(libc_stat, {
                onEnter: function (args) {
                    var path = Memory.readUtf8String(args[0]);
                    if (path.includes("su") || path.includes("magisk") || path.includes("busybox")) {
                        console.log("[*] Bypassing native stat check for: " + path);
                        Memory.writeUtf8String(args[0], "/data/local/tmp/fake");
                    }
                }
            });
        }

        /*******************************
         * Bypass Runtime.exec Checks
         *******************************/
        var Runtime = Java.use("java.lang.Runtime");
        Runtime.exec.overload("java.lang.String").implementation = function (command) {
            console.log("[*] Runtime.exec called: " + command);
            if (command.includes("su") || command.includes("magisk") || command.includes("which")) {
                console.log("[*] Blocking root command: " + command);
                throw Java.use("java.io.IOException").$new("Command not found");
            }
            return this.exec(command);
        };

        /*******************************
         * Bypass File.exists Checks
         *******************************/
        var File = Java.use("java.io.File");
        File.exists.implementation = function () {
            var path = this.getAbsolutePath();
            if (path.includes("su") || path.includes("magisk") || path.includes("/system/xbin")) {
                console.log("[*] Bypassing File.exists for: " + path);
                return false;
            }
            return this.exists();
        };

        /*******************************
         * Custom Security Checks
         *******************************/
        try {
            var CustomRootCheck = Java.use("com.iiits.avvnl_fms.security.RootDetection");
            CustomRootCheck.isDeviceRooted.implementation = function () {
                console.log("[*] Bypassing custom RootDetection.isDeviceRooted");
                return false;
            };
        } catch (e) {
            console.log("[*] Custom RootDetection not found: " + e);
        }

        console.log("[*] Root detection bypass hooks applied for com.iiits.avvnl_fms!");
    });
} else {
    console.log("[!] Java runtime not available!");
}