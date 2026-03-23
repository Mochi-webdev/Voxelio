window.ProjectHandler = {
    shareWithEmail: async function(projectName) {
        const email = prompt("E-Mail-Adresse des Empfängers eingeben:");
        if (!email || !AuthHandler.user) return;

        try {
            const projectRef = firebase.firestore()
                .collection('users').doc(AuthHandler.user.uid)
                .collection('projects').doc(projectName);

            // Füge die E-Mail zum Array 'sharedWith' hinzu
            await projectRef.update({
                sharedWith: firebase.firestore.FieldValue.arrayUnion(email.toLowerCase().trim())
            });

            alert(`Projekt wurde für ${email} freigegeben!`);
        } catch (e) {
            // Falls das Dokument noch kein sharedWith Feld hat, setzen wir es neu
            await firebase.firestore()
                .collection('users').doc(AuthHandler.user.uid)
                .collection('projects').doc(projectName)
                .set({ sharedWith: [email.toLowerCase().trim()] }, { merge: true });
            
            alert(`Projekt wurde für ${email} freigegeben!`);
        }
    }
};