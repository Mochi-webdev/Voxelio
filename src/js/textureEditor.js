window.TextureEditor = {
    initialized: false,
    drawing: false,
    grid: 16,
    mode: 'paint', // 'paint' oder 'erase'

    init() {
        this.canvas = document.getElementById('pixelCanvas');
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
        
        // Radierer ist einfach Weiß (oder transparent, falls gewünscht)
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
        info.innerText = msg;
        info.style.color = isError ? "#ff4444" : "#4CFF00";
    },

    clear() {
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.setStatus("Leinwand geleert.");
    },

    save() {
        const name = document.getElementById('textureName').value.trim();
        if(!name) {
            this.setStatus("Fehler: Name fehlt!", true);
            return;
        }
        
        App.textures[name] = this.canvas.toDataURL();
        this.setStatus(`Textur '${name}' gespeichert!`);
        
        // WICHTIG: Blockly Dropdowns aktualisieren
        if (window.workspace) {
            Blockly.Events.fire(new Blockly.Events.ViewportChange(window.workspace));
        }
    }
};