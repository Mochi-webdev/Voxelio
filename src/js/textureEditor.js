window.TextureEditor = {
    canvas: null,
    ctx: null,
    mode: 'paint',
    isDrawing: false,
    mirrorMode: false,
    grid: 16, 

    init: function() {
        this.canvas = document.getElementById('pixelCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
     
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

     
        this.canvas.onmousedown = (e) => { this.isDrawing = true; this.handleInput(e); };
        this.canvas.onmousemove = (e) => { if (this.isDrawing) this.handleInput(e); };
        this.canvas.onclick = (e) => this.handleInput(e);
        window.onmouseup = () => { this.isDrawing = false; };
        
        this.setStatus("Bereit zum Zeichnen.");
    },

    setMode: function(m, btn) {
        this.mode = m;
        
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        if (btn) btn.classList.add('active');
        this.setStatus(`Modus: ${m.toUpperCase()}`);
    },

    toggleMirror: function(btn) {
        this.mirrorMode = !this.mirrorMode;
        btn.classList.toggle('active', this.mirrorMode);
        this.setStatus(`Symmetrie: ${this.mirrorMode ? 'AN' : 'AUS'}`);
    },

    handleInput: function(e) {
        const rect = this.canvas.getBoundingClientRect();
       
        const x = Math.floor((e.clientX - rect.left) / (rect.width / this.grid)) * (this.canvas.width / this.grid);
        const y = Math.floor((e.clientY - rect.top) / (rect.height / this.grid)) * (this.canvas.height / this.grid);
        const size = this.canvas.width / this.grid;

        if (this.mode === 'fill') {
            this.fillAll();
        } else {
            this.applyPixel(x, y, size);
            if (this.mirrorMode) {
                const mirroredX = this.canvas.width - x - size;
                this.applyPixel(mirroredX, y, size);
            }
        }
    },

    applyPixel: function(x, y, size) {
        if (this.mode === 'paint') {
            this.ctx.fillStyle = document.getElementById('paintColor').value;
            this.ctx.fillRect(x, y, size, size);
        } else if (this.mode === 'erase') {
            
            this.ctx.fillStyle = "#ffffff";
            this.ctx.fillRect(x, y, size, size);
        }
    },

    fillAll: function() {
        this.ctx.fillStyle = document.getElementById('paintColor').value;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    },

    brighten: function() {
        this.ctx.globalCompositeOperation = 'lighter';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.globalCompositeOperation = 'source-over';
    },

    darken: function() {
        this.ctx.globalCompositeOperation = 'multiply';
        this.ctx.fillStyle = 'rgba(200, 200, 200, 1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.globalCompositeOperation = 'source-over';
    },

    setStatus: function(msg, isError = false) {
        const statusEl = document.getElementById('tex-status');
        if (statusEl) {
            statusEl.innerText = `> ${msg}`;
            statusEl.style.color = isError ? "#ff4444" : "";
        }
    },

    clear: function() {
        if (confirm("Ganze Textur löschen?")) {
            this.ctx.fillStyle = "#ffffff";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.setStatus("Leinwand geleert.");
        }
    },

   async save() {
        const nameInput = document.getElementById('textureName');
        const name = nameInput ? nameInput.value.trim() : "";
        
        if(!name) {
            this.setStatus("Fehler: Name fehlt!", true);
            return;
        }
        
        this.setStatus("Speichere...");

       
        if (!window.App.textures) window.App.textures = {};
        window.App.textures[name] = this.canvas.toDataURL(); 
        
        window.hasChanges = true;

        if(window.AuthHandler && window.activeProjectName) {
            try {
                
                await AuthHandler.saveToCloud(window.activeProjectName, true);
                this.setStatus(`'${name}' gesichert!`);
                
                if (window.Editor && typeof Editor.renderList === "function") {
                    Editor.renderList(); 
                }
            } catch (err) {
                this.setStatus("Cloud-Fehler!", true);
                console.error(err);
            }
        } else {
            this.setStatus("Lokal gespeichert.");
        }
    },
    loadTexture: function(name) {
        if (!window.App.textures || !window.App.textures[name]) return;
        
        const img = new Image();
        img.onload = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
            document.getElementById('textureName').value = name;
            this.setStatus(`Textur '${name}' geladen.`);
        };
        img.src = window.App.textures[name];
    },
    
    
};
window.addEventListener('load', () => TextureEditor.init());
// Event-Listener für den Datei-Upload
document.getElementById('textureFileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        const base64Data = event.target.result;
        
        // Dateiname ohne Endung als Textur-ID verwenden
        const textureName = file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_');

        // In der Engine speichern
        window.App.textures[textureName] = base64Data;

        console.log(`Textur "${textureName}" erfolgreich importiert.`);
        
        // UI aktualisieren (falls du eine Liste der Texturen anzeigst)
        if (window.Editor && window.Editor.renderTextureList) {
            window.Editor.renderTextureList();
        }

        // Optional: Automatisch in der Cloud speichern
        const pName = new URLSearchParams(window.location.search).get('project');
        if (pName && window.AuthHandler) {
            window.AuthHandler.saveToCloud(pName, true);
        }
    };
    
    reader.readAsDataURL(file); // Wandelt das Bild in einen Base64 String um
});