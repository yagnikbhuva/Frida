Java.perform(function () {
    console.log("[*] SSL Pinning Bypass Started for com.pragyaware.jdvnlvigilance");

    // Bypass X509TrustManager.checkServerTrusted
    try {
        var X509TrustManager = Java.use('javax.net.ssl.X509TrustManager');
        X509TrustManager.checkServerTrusted.implementation = function(chain, authType) {
            console.log("[+] Bypassing X509TrustManager.checkServerTrusted for authType: " + authType);
            // Do nothing, effectively trusting all certificates
        };
    } catch (err) {
        console.log("[!] Error hooking X509TrustManager: " + err);
    }

    // Bypass HostnameVerifier.verify
    try {
        var HostnameVerifier = Java.use('javax.net.ssl.HostnameVerifier');
        HostnameVerifier.verify.overload('java.lang.String', 'javax.net.ssl.SSLSession').implementation = function(hostname, session) {
            console.log("[+] Bypassing HostnameVerifier for hostname: " + hostname);
            return true; // Accept any hostname
        };
    } catch (err) {
        console.log("[!] Error hooking HostnameVerifier: " + err);
    }

    // Bypass OkHttp CertificatePinner.check
    try {
        var CertificatePinner = Java.use('okhttp3.CertificatePinner');
        CertificatePinner.check.overload('java.lang.String', 'java.util.List').implementation = function(hostname, certificates) {
            console.log("[+] Bypassing OkHttp CertificatePinner.check for hostname: " + hostname);
            // Do nothing to skip pinning validation
        };
    } catch (err) {
        console.log("[!] Error hooking OkHttp CertificatePinner: " + err);
    }

    // Speculative bypass for custom SSL pinning in com.pragyaware.jdvnlvigilance
    try {
        var CustomSSLUtil = Java.use('com.pragyaware.jdvnlvigilance.utils.SSLUtil');
        CustomSSLUtil.verifyCertificate.implementation = function(cert) {
            console.log("[+] Bypassing custom SSLUtil.verifyCertificate");
            return true; // Assume verification passes
        };
    } catch (err) {
        console.log("[!] Custom SSLUtil not found: " + err);
    }

    console.log("[*] SSL Pinning Bypass Completed for com.pragyaware.jdvnlvigilance");
});