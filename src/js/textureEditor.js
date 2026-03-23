window.TextureEditor = {
    initialized: false,
    drawing: false,
    grid: 16,
    mode: 'paint', // 'paint' oder 'erase'

    init() {
        this.canvas = document.getElementById('pixelCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.initialized = true;

        this.canvas.onmousedown = () => this.drawing = true;
        window.onmouseup = () => this.drawing = false;
        this.canvas.onmousemove = (e) => this.paint(e);
        this.canvas.onclick = (e) => this.paint(e);
        this.clear();
    },

    setMode(newMode) {
        this.mode = newMode;
        this.setStatus(`Modus: ${newMode === 'paint' ? 'Stift' : 'Radierer'}`);
    },

    paint(e) {
        if(!this.drawing && e.type !== 'click') return;
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / (this.canvas.width / this.grid));
        const y = Math.floor((e.clientY - rect.top) / (this.canvas.height / this.grid));
        
        this.ctx.fillStyle = (this.mode === 'paint') ? document.getElementById('paintColor').value : "#ffffff";
        this.ctx.fillRect(
            x * (this.canvas.width / this.grid), 
            y * (this.canvas.height / this.grid), 
            this.canvas.width / this.grid, 
            this.canvas.height / this.grid
        );
    },

    setStatus(msg, isError = false) {
        const info = document.getElementById('tex-status');
        if (info) {
            info.innerText = msg;
            info.style.color = isError ? "#ff4444" : "#4CFF00";
        }
    },

    clear() {
        if (!this.ctx) return;
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.setStatus("Leinwand geleert.");
    },

    async save() {
        const nameInput = document.getElementById('textureName');
        const name = nameInput ? nameInput.value.trim() : "";
        
        if(!name) {
            this.setStatus("Fehler: Name fehlt!", true);
            return;
        }
        
        // 1. In der App lokal speichern (Base64 String)
        if (!window.App.textures) window.App.textures = {};
        window.App.textures[name] = this.canvas.toDataURL(); 
        
        // 2. Cloud-Speicherung triggern
        // Wir nutzen window.activeProjectName, da diese Variable in der index.html global definiert ist
        if(window.AuthHandler && window.activeProjectName) {
            this.setStatus("Speichere in Cloud...");
            try {
                await AuthHandler.saveToCloud(window.activeProjectName, true);
                this.setStatus(`Textur '${name}' gespeichert!`);
                
                // 3. WICHTIG: Blockly-Toolbox aktualisieren, damit die neue Textur im Dropdown erscheint
                if (window.workspace) {
                    // Erzwingt eine Aktualisierung der Dropdowns in den Blöcken
                    Blockly.mainWorkspace.getToolbox().refreshSelection();
                }
            } catch (err) {
                this.setStatus("Cloud-Fehler!", true);
                console.error(err);
            }
        } else {
            this.setStatus("Lokal gespeichert (kein Projekt offen)");
        }
    }
};