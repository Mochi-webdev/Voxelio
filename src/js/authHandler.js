// AuthHandler Objekt global definieren
window.AuthHandler = {
    user: null,

    // Login Prozess
    async login() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            // Redirect ist stabiler gegen COOP-Blockaden in Browsern
            await firebase.auth().signInWithRedirect(provider);
        } catch (e) {
            console.error("Login Fehler:", e);
            alert("Login fehlgeschlagen.");
        }
    },

    // Logout Prozess
    async logout() {
        if (confirm("Möchtest du dich wirklich abmelden?")) {
            await firebase.auth().signOut();
            window.location.reload();
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

    // Speichern in die Cloud (Wird von der Engine aufgerufen)
    async saveToCloud(projectName, isAutosave = false) {
        if (!this.user || !projectName) return;

        try {
            const scriptsData = JSON.stringify(window.Editor ? window.Editor.scripts : {});
            await firebase.firestore()
                .collection("users").doc(this.user.uid)
                .collection("projects").doc(projectName)
                .set({
                    allScripts: scriptsData,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });

            if (!isAutosave) console.log("✅ Projekt in Cloud gespeichert");
        } catch (e) {
            console.error("Cloud Save Error:", e);
        }
    }
};

// Überwachung des Login-Status
firebase.auth().onAuthStateChanged(user => {
    window.AuthHandler.user = user;
    const loginBtn = document.getElementById('loginBtn');
    const emailDisplay = document.getElementById('userEmail');

    if (user) {
        if (loginBtn) loginBtn.innerText = "👤 " + (user.displayName || "Profil");
        if (emailDisplay) emailDisplay.innerText = user.email;
    } else {
        if (loginBtn) loginBtn.innerText = "🔑 Login";
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