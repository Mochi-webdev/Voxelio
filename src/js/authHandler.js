
window.AuthHandler = {
    user: null,


    async login() {
        try {
            console.log("Login-Prozess gestartet...");
            const provider = new firebase.auth.GoogleAuthProvider();


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
    saveToCloud: async function (projectName, silent = false) {
        const targetProject = projectName || window.activeProjectName;
        if (!this.user || !targetProject) return;

        if (window.workspace && window.Editor && window.Editor.currentScript) {
            try {
                const state = Blockly.serialization.workspaces.save(window.workspace);
                window.Editor.scripts[window.Editor.currentScript] = state || {};
            } catch (e) {
                console.error(e);
            }
        }

        const encodeData = (obj) => {
            try {
                // Sicherstellen, dass wir mindestens ein leeres Main-Script haben
                const dataToEncode = (obj && Object.keys(obj).length > 0) ? obj : { "Main": {} };
                const json = JSON.stringify(dataToEncode);
                return btoa(unescape(encodeURIComponent(json)));
            } catch (e) {
                return btoa("{}");
            }
        };

        const projectData = {
            scripts: encodeData(window.Editor.scripts),
            textures: window.App.textures || {},
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
            projectName: targetProject // Hilfreich für das Dashboard
        };

        try {
            await firebase.firestore()
                .collection('users')
                .doc(this.user.uid)
                .collection('projects')
                .doc(targetProject)
                .set(projectData, { merge: true });

            if (!silent) console.log("Cloud Save: OK");
        } catch (error) {
            console.error("Cloud Save Error:", error);
        }
    }
};


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

window.addEventListener('click', (e) => {
    const dropdown = document.getElementById("userDropdown");
    if (!e.target.matches('#loginBtn') && dropdown) {
        if (dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
        }
    }
});