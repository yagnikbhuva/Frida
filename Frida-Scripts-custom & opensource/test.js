Java.perform(function () {

    console.log("[*] Advanced Root Detection Bypass Started");

 

    // Bypass common root detection methods

    try {

        var Utilities = Java.use("com.infrasofttech.centralbankupi.Utils.Utilities");

        Utilities.O.implementation = function() {

            console.log("[+] Bypassed Utilities.O root check");

            return false; // Assuming 'false' indicates no root access

        };

        Utilities.Z.implementation = function() {

            console.log("[+] Bypassed Utilities.Z root check");

            return false;

        };

    } catch (err) {

        console.log("[!] Error hooking Utilities methods: " + err);

    }

 

    // Bypass SystemProperties checks

    try {

        var SystemProperties = Java.use("android.os.SystemProperties");

        SystemProperties.get.overload('java.lang.String').implementation = function(key) {

            console.log("[*] SystemProperties.get called with: " + key);

            if (key === "ro.debuggable" || key === "ro.secure") {

                console.log("[+] Bypassing SystemProperties check for: " + key);

                return "0"; // Return '0' for these secure properties

            }

            return this.get(key);

        };

 

        SystemProperties.getInt.overload('java.lang.String', 'int').implementation = function(key, def) {

            console.log("[*] SystemProperties.getInt called with: " + key);

            if (key === "ro.debuggable" || key === "ro.secure") {

                console.log("[+] Bypassing SystemProperties int check for: " + key);

                return 0;

            }

            return this.getInt(key, def);

        };

    } catch (err) {

        console.log("[!] Error hooking SystemProperties: " + err);

    }

 

    // Bypass Runtime.exec for root commands without using a MockProcess

    try {

        var Runtime = Java.use("java.lang.Runtime");

        Runtime.exec.overloads.forEach(function(exec) {

            exec.implementation = function(cmd) {

                var command = Array.isArray(cmd) ? cmd.join(" ") : cmd;

                console.log("[*] Runtime.exec called with: " + command);

                if (command.indexOf("su") !== -1 || command.indexOf("which") !== -1 || command.indexOf("busybox") !== -1) {

                    console.log("[+] Blocking root command: " + command);

                    return null; // Return null or an empty result to bypass the command

                }

                return exec.call(this, cmd); // Allow safe commands to proceed

            };

        });

    } catch (err) {

        console.log("[!] Error hooking Runtime.exec: " + err);

    }

 

    // Bypass File.exists() checks for specific root-related files

    try {

        var File = Java.use("java.io.File");

        File.exists.implementation = function() {

            var filePath = this.getAbsolutePath();

            console.log("[*] File.exists check on: " + filePath);

            if (filePath.indexOf("su") !== -1 || filePath.indexOf("busybox") !== -1 || filePath.indexOf("magisk") !== -1) {

                console.log("[+] Pretending file does not exist: " + filePath);

                return false; // Pretend the root-related file does not exist

            }

            return this.exists.call(this); // Proceed normally for other files

        };

    } catch (err) {

        console.log("[!] Error hooking File.exists: " + err);

    }

 

    console.log("[*] Root Detection Bypass Completed");

});