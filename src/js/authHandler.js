// AuthHandler Objekt global definieren
window.AuthHandler = {
    user: null,

    // Login Prozess
    async login() {
        try {
            console.log("Login-Prozess gestartet...");
            const provider = new firebase.auth.GoogleAuthProvider();
            
            // Nutze signInWithPopup für bessere User Experience, 
            // falls das blockiert wird, ist der Fallback signInWithRedirect
            await firebase.auth().signInWithPopup(provider);
            
            console.log("Login erfolgreich!");
        } catch (e) {
            console.error("Login Fehler Details:", e);
            if (e.code === 'auth/popup-blocked') {
                alert("Bitte erlaube Pop-ups für diese Seite oder klicke erneut.");
            } else if (e.code === 'auth/operation-not-supported-in-this-environment') {
                // Falls lokal ohne Webserver gestartet (file://)
                alert("Firebase Login funktioniert nur über einen Webserver (http/https), nicht über lokales Öffnen der Datei.");
            } else {
                alert("Login fehlgeschlagen: " + e.message);
            }
        }
    },

    // Logout Prozess
    async logout() {
        if (confirm("Möchtest du dich wirklich abmelden?")) {
            try {
                await firebase.auth().signOut();
                window.location.reload();
            } catch (e) {
                console.error("Logout Fehler:", e);
            }
        }
    },

    // Klick-Logik für den Login/User-Button
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

    // Speichern in die Cloud
    async saveToCloud(projectName, isAutosave = false) {
        if (!this.user || !projectName) {
            if(!isAutosave) console.warn("Speichern nicht möglich: Kein User oder kein Projektname.");
            return;
        }

        try {
            // Sicherstellen, dass Editor existiert
            const scriptsData = JSON.stringify(window.Editor ? window.Editor.scripts : {});
            
            await firebase.firestore()
                .collection("users").doc(this.user.uid)
                .collection("projects").doc(projectName)
                .set({
                    allScripts: scriptsData,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });

            if (!isAutosave) {
                console.log("✅ Projekt in Cloud gespeichert");
                alert("Gespeichert!");
            }
        } catch (e) {
            console.error("Cloud Save Error:", e);
            alert("Fehler beim Speichern in der Cloud.");
        }
    }
};

// Überwachung des Login-Status (Wird automatisch von Firebase gefeuert)
firebase.auth().onAuthStateChanged(user => {
    window.AuthHandler.user = user;
    const loginBtn = document.getElementById('loginBtn');
    const emailDisplay = document.getElementById('userEmail');

    if (user) {
        console.log("Eingeloggt als:", user.email);
        if (loginBtn) loginBtn.innerText = "👤 " + (user.displayName || "Profil");
        if (emailDisplay) emailDisplay.innerText = user.email;
    } else {
        console.log("Nicht eingeloggt.");
        if (loginBtn) loginBtn.innerText = "🔑 Login";
        if (emailDisplay) emailDisplay.innerText = "Nicht angemeldet";
    }
});

// Schließen des Dropdowns bei Klick außerhalb
window.addEventListener('click', (e) => {
    if (!e.target.matches('#loginBtn')) {
        const dd = document.getElementById("userDropdown");
        if (dd && dd.classList.contains('show')) {
            dd.classList.remove('show');
        }
    }
});