Java.perform(function() {
    console.log("[*] Starting Modified Flutter SSL Pinning Bypass...");
    
    // Helper function for error handling
    function cautiously(desc, func) {
        try {
            func();
        } catch (e) {
            console.log(`[-] ${desc} failed: ${e}`);
        }
    }

    // Basic SSL/TLS bypass
    cautiously("SSL context", function() {
        const X509TrustManager = Java.use("javax.net.ssl.X509TrustManager");
        const SSLContext = Java.use("javax.net.ssl.SSLContext");
        
        // Create a custom trust manager
        const TrustManager = Java.registerClass({
            name: "custom.TrustManager",
            implements: [X509TrustManager],
            methods: {
                checkClientTrusted: function(chain, authType) {},
                checkServerTrusted: function(chain, authType) {},
                getAcceptedIssuers: function() {
                    return Java.array("Ljava.security.cert.X509Certificate;", []);
                }
            }
        });

        // Create a new trust manager instance
        const trustManager = TrustManager.$new();
        const TrustManagers = [trustManager];

        // Get the default SSL context
        const sslContext = SSLContext.getInstance("TLS");
        sslContext.init.overload(
            "[Ljavax.net.ssl.KeyManager;", 
            "[Ljavax.net.ssl.TrustManager;", 
            "java.security.SecureRandom"
        ).implementation = function(keyManager, trustManager, secureRandom) {
            console.log("[+] Bypassing SSL Context initialization");
            this.init.call(this, null, TrustManagers, null);
        };
    });

    // WebView SSL Error Bypass
    cautiously("WebView", function() {
        const WebViewClient = Java.use("android.webkit.WebViewClient");
        const SslError = Java.use("android.webkit.SslErrorHandler");
        
        WebViewClient.onReceivedSslError.implementation = function(webView, sslErrorHandler, error) {
            console.log("[+] WebViewClient SSL Error bypassed");
            sslErrorHandler.proceed();
        };
    });

    // Try to hook the native library if it exists
    cautiously("Native library", function() {
        const flutterModule = Process.findModuleByName("libflutter.so") || 
                            Process.findModuleByName("libapp.so") || 
                            Process.findModuleByName("libclient.so");
        
        if (flutterModule) {
            console.log("[+] Found Flutter library at: " + flutterModule.base);
            
            // Hook native SSL verification
            const pattern = "75 ?? 74 ?? 88 ?? 87 ?? 65 ?? 64";  // Sample pattern for SSL check
            Memory.scan(flutterModule.base, flutterModule.size, pattern, {
                onMatch: function(address, size) {
                    console.log("[+] Found potential SSL check at: " + address.toString());
                    Memory.protect(address, 4, 'rwx');
                    Memory.writeByteArray(address, [0x00, 0x00, 0x00, 0x00]);
                },
                onComplete: function() {
                    console.log("[*] Memory scan completed");
                }
            });
        }
    });

    // Conscrypt bypass
    cautiously("Conscrypt", function() {
        const conscrypt = Java.use("com.android.org.conscrypt.TrustManagerImpl");
        conscrypt.verifyChain.implementation = function(untrustedChain, trustAnchorChain, host, clientAuth, ocspData, tlsSctData) {
            console.log("[+] Conscrypt verification bypassed");
            return untrustedChain;
        };
    });

    // Additional certificate chain validators
    cautiously("Chain validation", function() {
        const chainValidator = Java.use("android.security.net.config.NetworkSecurityTrustManager");
        if (chainValidator) {
            chainValidator.checkPins.implementation = function() {
                console.log("[+] Certificate pin check bypassed");
            };
        }
    });

    // System SSL socket factory
    cautiously("SSLSocketFactory", function() {
        const factory = Java.use("javax.net.ssl.SSLSocketFactory");
        factory.createSocket.overload(
            "java.net.Socket", 
            "java.lang.String", 
            "int", 
            "boolean"
        ).implementation = function(socket, host, port, autoClose) {
            console.log("[+] SSLSocket creation intercepted for " + host + ":" + port);
            return this.createSocket.call(this, socket, host, port, autoClose);
        };
    });

    // Monitor application's class loader for dynamic loading
    cautiously("ClassLoader", function() {
        const DexClassLoader = Java.use("dalvik.system.DexClassLoader");
        DexClassLoader.loadClass.implementation = function(name) {
            console.log("[*] Loading class: " + name);
            return this.loadClass.call(this, name);
        };
    });

    console.log("[*] SSL Pinning Bypass Complete - Monitoring for SSL traffic...");
});
