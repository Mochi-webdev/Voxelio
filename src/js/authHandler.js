/**
 * AuthHandler - Verwaltet Login, Logout und Cloud-Synchronisation
 * Speichert Blockly-Skripte UND Texturen in Firebase Firestore.
 */
window.AuthHandler = {
    user: null,

    // Login Prozess (Google Popup)
    async login() {
        try {
            console.log("Login-Prozess gestartet...");
            const provider = new firebase.auth.GoogleAuthProvider();
            
            // Popup für Google Login
            await firebase.auth().signInWithPopup(provider);
            
            console.log("Login erfolgreich!");
        } catch (e) {
            console.error("Login Fehler Details:", e);
            if (e.code === 'auth/popup-blocked') {
                alert("Bitte erlaube Pop-ups für diese Seite, um dich anzumelden.");
            } else if (e.code === 'auth/operation-not-supported-in-this-environment') {
                alert("Firebase Login funktioniert nur über einen Webserver (http/https). Bitte nutze 'Live Server' in VS Code.");
            } else {
                alert("Login fehlgeschlagen: " + e.message);
            }
        }
    },

    // Logout Prozess
    async logout() {
        if (confirm("Möchtest du dich wirklich abmelden? Dein Fortschritt sollte vorher gespeichert sein.")) {
            try {
                await firebase.auth().signOut();
                window.location.reload();
            } catch (e) {
                console.error("Logout Fehler:", e);
            }
        }
    },

    // Klick-Logik für den Button (Login oder Dropdown öffnen)
    handleUserClick() {
        if (!this.user) {
            this.login();
        } else {
            const dropdown = document.getElementById("userDropdown");
            if (dropdown) {
                dropdown.classList.toggle("show");
            }
        }
    },

    /**
     * Speichert das aktuelle Projekt in der Cloud.
     * @param {string} projectName - Name des Projekts
     * @param {boolean} isAutosave - Wenn true, erscheint kein Alert
     */
    async saveToCloud(projectName, isAutosave = false) {
        if (!this.user || !projectName) {
            if(!isAutosave) console.warn("Speichern abgebrochen: Kein User oder kein Projektname.");
            return;
        }

        try {
            // 1. Skripte aus dem Editor sammeln
            const scriptsData = JSON.stringify(window.Editor ? window.Editor.scripts : {});
            
            // 2. Texturen aus der App sammeln
            const textureData = JSON.stringify(window.App ? window.App.textures : {});

            // 3. In Firestore speichern (im User-Dokument unter 'projects')
            await firebase.firestore()
                .collection("users").doc(this.user.uid)
                .collection("projects").doc(projectName)
                .set({
                    allScripts: scriptsData,
                    allTextures: textureData, // Speichert die Pixel-Bilder
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });

            if (!isAutosave) {
                console.log("✅ Projekt & Texturen erfolgreich in Cloud gespeichert");
                alert("Projekt erfolgreich gespeichert!");
            }
        } catch (e) {
            console.error("Cloud Save Error:", e);
            alert("Fehler beim Speichern in der Cloud. Details in der Konsole.");
        }
    }
};

/**
 * Firebase Auth Listener
 * Reagiert auf Login/Logout und aktualisiert die UI-Elemente
 */
firebase.auth().onAuthStateChanged(user => {
    window.AuthHandler.user = user;
    const loginBtn = document.getElementById('loginBtn');
    const emailDisplay = document.getElementById('userEmail');

    if (user) {
        console.log("Angemeldet als:", user.email);
        if (loginBtn) {
            loginBtn.innerText = "👤 " + (user.displayName || "Profil");
            loginBtn.classList.add("logged-in");
        }
        if (emailDisplay) emailDisplay.innerText = user.email;
    } else {
        console.log("Aktuell nicht angemeldet.");
        if (loginBtn) {
            loginBtn.innerText = "🔑 Login";
            loginBtn.classList.remove("logged-in");
        }
        if (emailDisplay) emailDisplay.innerText = "Nicht angemeldet";
    }
});

/**
 * Globaler Klick-Listener für das User-Dropdown
 * Schließt das Menü, wenn man daneben klickt
 */
window.addEventListener('click', (e) => {
    const dropdown = document.getElementById("userDropdown");
    if (!e.target.matches('#loginBtn') && dropdown) {
        if (dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
        }
    }
});