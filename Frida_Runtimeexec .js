Java.perform(function () {
    console.log("[*] Advanced Root Detection Bypass Started");

    // Dynamically retrieve the package name
    var currentPackage = Java.use("android.app.ActivityThread").currentApplication().getApplicationContext().getPackageName();
    console.log("[*] Current Package: " + currentPackage);

    // Bypass root detection methods in any package
    try {
        // Bypass R_o_o_t_e_d check (example for a method)
        var UtilitiesClassName = currentPackage + ".utils.Utilities";  // Dynamically build class path
        var Utilities = Java.use(UtilitiesClassName);
        Utilities.R_o_o_t_e_d.implementation = function () {
            console.log("[+] Bypassed R_o_o_t_e_d check");
            return false;  // Return false, assuming it means "not rooted"
        };
    } catch (err) {
        console.log("[!] Error hooking R_o_o_t_e_d: " + err);
    }

    // Bypass SystemProperties checks
    try {
        var SystemProperties = Java.use("android.os.SystemProperties");
        SystemProperties.get.overload('java.lang.String').implementation = function (key) {
            console.log("[*] SystemProperties.get called with: " + key);
            if (key === "ro.debuggable" || key === "ro.secure") {
                console.log("[+] Bypassing SystemProperties check for: " + key);
                return "0";  // Return 0 for secure properties
            }
            return this.get(key);
        };

        SystemProperties.getInt.overload('java.lang.String', 'int').implementation = function (key, def) {
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

    // Bypass Runtime.exec checks
    try {
        var Runtime = Java.use("java.lang.Runtime");
        Runtime.exec.overloads.forEach(function (exec) {
            exec.implementation = function () {
                var cmd = "";
                if (arguments[0] instanceof Array) {
                    cmd = arguments[0].join(" ");
                } else if (typeof arguments[0] === "string") {
                    cmd = arguments[0];
                }
                console.log("[*] Runtime.exec called with: " + cmd);
                if (cmd.indexOf("su") !== -1 || cmd.indexOf("which") !== -1 || cmd.indexOf("busybox") !== -1) {
                    console.log("[+] Bypassing root command: " + cmd);
                    return Java.use("java.lang.Process").$new();  // Mock process creation
                }
                return exec.apply(this, arguments);  // Proceed with original command if safe
            };
        });
    } catch (err) {
        console.log("[!] Error hooking Runtime.exec: " + err);
    }

    // Bypass File.exists() checks
    try {
        var File = Java.use("java.io.File");
        File.exists.implementation = function () {
            var fileName = this.getAbsolutePath();
            console.log("[*] File.exists check on: " + fileName);
            if (fileName.indexOf("su") !== -1 || fileName.indexOf("busybox") !== -1 || fileName.indexOf("magisk") !== -1) {
                console.log("[+] Bypassing file check for: " + fileName);
                return false;  // Pretend the file doesn't exist
            }
            return this.exists.call(this);
        };
    } catch (err) {
        console.log("[!] Error hooking File.exists: " + err);
    }

    // Allow AlertDialog to show but log when it is triggered
    try {
        var AlertDialog = Java.use("android.app.AlertDialog");
        AlertDialog.show.implementation = function () {
            console.log("[*] AlertDialog.show called, allowing it to display.");
            this.show();  // Call original method to allow dialog to be displayed
        };
    } catch (err) {
        console.log("[!] Error hooking AlertDialog.show: " + err);
    }

    console.log("[*] Root Detection Bypass Completed");
});
