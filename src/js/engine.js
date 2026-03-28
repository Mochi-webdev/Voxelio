window.Editor = {
    scripts: { "main": {} },
    currentScript: "main",

    renderList() {
        const list = document.getElementById('scriptList');
        if (!list) return;
        list.innerHTML = "";
        Object.keys(this.scripts).forEach(name => {
            const btn = document.createElement('div');
            btn.className = `script-item ${this.currentScript === name ? 'active' : ''}`;
            btn.innerHTML = `<span>${name}</span>`;
            if (name !== 'main') {
                btn.innerHTML += `<button onclick="event.stopPropagation(); Editor.deleteScript('${name}')" style="background:none; border:none; color:red; cursor:pointer; margin-left:8px;">×</button>`;
            }
            btn.onclick = () => this.switchScript(name);
            list.appendChild(btn);
        });
    },

    switchScript(name) {
        if (!window.workspace) return;
        this.updateCurrentScriptBuffer();
        this.currentScript = name;
        const data = this.scripts[name] || {};
        window.workspace.clear();
        Blockly.serialization.workspaces.load(data, window.workspace);
        this.renderList();
    },

    createScript() {
        const input = document.getElementById('scriptNameInput');
        const name = input.value.trim().replace(/[^a-zA-Z0-9]/g, '_');
        if (name && !this.scripts[name]) {
            this.scripts[name] = {};
            if (this.hideModal) this.hideModal();
            this.switchScript(name);
            const pName = new URLSearchParams(window.location.search).get('project');
            if (pName && window.AuthHandler) AuthHandler.saveToCloud(pName, true);
        }
        input.value = "";
    },

    deleteScript(name) {
        if (name === 'main') return;
        delete this.scripts[name];
        if (this.currentScript === name) this.switchScript('main');
        else this.renderList();
    },

    showModal() { document.getElementById('nameModal').style.display = 'flex'; },
    hideModal() { document.getElementById('nameModal').style.display = 'none'; },

    getAllCode() {
        this.updateCurrentScriptBuffer();
        let fullCode = "";
        const generator = window.javascriptGenerator || Blockly.JavaScript;
        Object.values(this.scripts).forEach(saveData => {
            if (saveData && Object.keys(saveData).length > 0) {
                const tempWorkspace = new Blockly.Workspace();
                Blockly.serialization.workspaces.load(saveData, tempWorkspace);
                fullCode += generator.workspaceToCode(tempWorkspace) + "\n";
                tempWorkspace.dispose();
            }
        });
        return fullCode;
    },

    updateCurrentScriptBuffer() {
        if (window.workspace) {
            this.scripts[this.currentScript] = Blockly.serialization.workspaces.save(window.workspace);
        }
    }
};

window.App = {
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    objects: {},
    uiElements: {},
    textures: {},
    variables: {},
    keyListeners: {},
    tickListeners: [],
    solids: [],
    variableDisplays: {},
    isRunning: false,
    fpcPlayer: null,
    velocityy: 0,
    isGrounded: true,
    gravity: -0.015,
    mouseDelta: { x: 0, y: 0 },

    init() {
        let c = document.getElementById('canvas3d');
        if (!c) return;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, c.clientWidth / c.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(c.clientWidth, c.clientHeight);
        c.appendChild(this.renderer.domElement);

        const geometry = new THREE.PlaneGeometry(100, 100);
        const material = new THREE.MeshStandardMaterial({ color: 0x808080 });
        this.floor = new THREE.Mesh(geometry, material);
        this.floor.rotation.x = -Math.PI / 2;
        this.floor.receiveShadow = true;
        this.floor.name = "mainFloor";
        this.scene.add(this.floor);

        this.scene.add(new THREE.AmbientLight(0xffffff, 0.8));
        let l = new THREE.DirectionalLight(0xffffff, 0.5);
        l.position.set(5, 10, 7);
        this.scene.add(l);

        this.scene.background = new THREE.Color(0x0b0b0e);
        this.scene.add(new THREE.GridHelper(30, 30, 0x222222, 0x333333));

        this.camera.position.set(8, 8, 8);
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

        window.addEventListener('keydown', (e) => {
            if (!this.isRunning) return;
            let k = e.key === " " ? " " : e.key;
            let f = this.keyListeners[k.toLowerCase()] || this.keyListeners[k];
            if (f) f();
        });

        window.addEventListener('mousemove', (e) => {
            if (this.isRunning) {
                this.mouseDelta.x = e.movementX || 0;
                this.mouseDelta.y = e.movementY || 0;
            }
        });

        window.addEventListener('resize', () => this.onResize());
        this.animate();
    },

    animate() {
        requestAnimationFrame(() => this.animate());
        if (this.isRunning) {
            if (this.fpcPlayer) this.updateFPCLook();
            this.updatePhysics();
            this.tickListeners.forEach(f => f());
            Object.values(this.objects).forEach(o => {
                if (o.userData && o.userData.animations) {
                    o.userData.animations.forEach(f => f());
                }
            });
        }
        if (this.controls && this.controls.enabled) this.controls.update();
        this.renderer.render(this.scene, this.camera);
    },

    spawn(t, c, n, p = "Szene") {
        if (this.objects[n]) this.scene.remove(this.objects[n]);
        let obj;
        if (t === 'group') {
            obj = new THREE.Group();
        } else {
            let g;
            switch (t) {
                case 'sphere': g = new THREE.SphereGeometry(1, 32, 16); break;
                case 'torus': g = new THREE.TorusGeometry(1, 0.3, 12, 48); break;
                case 'cylinder': g = new THREE.CylinderGeometry(1, 1, 2, 32); break;
                default: g = new THREE.BoxGeometry(1.5, 1.5, 1.5);
            }
            obj = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: c }));
        }
        obj.name = n;
        obj.userData = { animations: [] };
        if (p !== "Szene" && this.objects[p]) this.objects[p].add(obj);
        else this.scene.add(obj);
        this.objects[n] = obj;
        this.updateExplorer();
    },

    cloneObject(originalName, newId) {
        const original = this.objects[originalName];
        if (!original) return;

        // Falls die ID schon existiert, hängen wir einen Zeitstempel oder Zufall an
        let finalId = newId;
        if (this.objects[newId]) {
            finalId = newId + "_" + Math.floor(Math.random() * 1000);
        }

        const clone = original.clone();
        clone.name = finalId;
        this.objects[finalId] = clone;
        this.scene.add(clone);
        this.updateExplorer();
    },

    move(n, a, v) { if (this.objects[n]) this.objects[n].position[a] += parseFloat(v); },
    transform(n, a, v) { if (this.objects[n]) this.objects[n].position[a] = parseFloat(v); },
    setScale(n, v) { if (this.objects[n]) this.objects[n].scale.set(v, v, v); },
    setRotation(name, axis, degree) {
        if (this.objects[name]) this.objects[name].rotation[axis] = THREE.MathUtils.degToRad(parseFloat(degree));
    },
    setDimension(name, axis, value) {
        if (this.objects[name]) this.objects[name].scale[axis] = parseFloat(value);
    },
    addRotation(n, a, s) {
        if (this.objects[n]) this.objects[n].userData.animations.push(() => this.objects[n].rotation[a] += s);
    },

    setupFPC(name) {
        this.fpcPlayer = this.objects[name];
        if (this.fpcPlayer) {
            this.fpcPlayer.add(this.camera);
            this.camera.position.set(0, 1.6, 0);
            this.camera.rotation.set(0, 0, 0);
            this.controls.enabled = false;
            this.renderer.domElement.requestPointerLock();
        }
    },

    updateFPCLook() {
        if (!this.fpcPlayer) return;
        const sensitivity = 0.002;
        this.fpcPlayer.rotation.y -= this.mouseDelta.x * sensitivity;
        this.camera.rotation.x -= this.mouseDelta.y * sensitivity;
        this.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.camera.rotation.x));
        this.mouseDelta = { x: 0, y: 0 };
    },

    moveFPC(dir, speed) {
        if (!this.fpcPlayer) return;
        const s = parseFloat(speed);
        const moveVec = new THREE.Vector3();
        if (dir === 'forward') moveVec.z -= s;
        if (dir === 'backward') moveVec.z += s;
        if (dir === 'left') moveVec.x -= s;
        if (dir === 'right') moveVec.x += s;
        moveVec.applyQuaternion(this.fpcPlayer.quaternion);
        if (!this.checkCollision(this.fpcPlayer.position, moveVec, s)) {
            this.fpcPlayer.position.add(moveVec);
        }
    },

    jump(force) {
        if (this.isGrounded) {
            this.velocityy = parseFloat(force);
            this.isGrounded = false;
        }
    },

    updatePhysics() {
        if (!this.isRunning || !this.fpcPlayer) return;
        this.velocityy += this.gravity;
        this.fpcPlayer.position.y += this.velocityy;
        if (this.fpcPlayer.position.y <= 0) {
            this.fpcPlayer.position.y = 0;
            this.velocityy = 0;
            this.isGrounded = true;
        } else {
            this.isGrounded = false;
        }
    },

    setSolid(name, isSolid) {
        const obj = this.objects[name];
        if (!obj) return;
        if (isSolid) {
            if (!this.solids.includes(obj)) this.solids.push(obj);
        } else {
            this.solids = this.solids.filter(s => s !== obj);
        }
    },

    checkCollision(currentPos, direction, distance) {
        if (this.solids.length === 0) return false;
        const raycaster = new THREE.Raycaster(currentPos, direction.clone().normalize());
        const intersections = raycaster.intersectObjects(this.solids);
        return intersections.length > 0 && intersections[0].distance < distance + 0.5;
    },

    checkCollisionBetween(name1, name2) {
        const obj1 = this.objects[name1];
        const obj2 = this.objects[name2];
        if (!obj1 || !obj2) return false;
        const box1 = new THREE.Box3().setFromObject(obj1);
        const box2 = new THREE.Box3().setFromObject(obj2);
        return box1.intersectsBox(box2);
    },

    createUI(type, id, x, y, w, h, text = "", texture = "", parentId = null) {
        if (this.uiElements[id]) this.uiElements[id].remove();
        const el = document.createElement(type === 'button' ? 'button' : 'div');
        el.id = id;
        Object.assign(el.style, {
            position: "absolute", left: x + "px", top: y + "px", width: w + "px", height: h + "px",
            zIndex: "100", display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "sans-serif", boxSizing: "border-box", border: "none", transition: "opacity 0.3s ease", opacity: "1"
        });

        if (type === 'button') {
            el.innerText = text;
            el.style.cursor = "pointer";
            el.onclick = () => this.setVariable(`btn_${id}_clicked`, true);
        } else if (type === 'scrolling_frame') {
            el.style.overflowY = "auto";
            el.style.display = "block";
        }

        if (texture && texture !== "none" && this.textures[texture]) {
            el.style.backgroundImage = `url(${this.textures[texture]})`;
            el.style.backgroundSize = "100% 100%";
            el.style.backgroundColor = "transparent";
        } else {
            el.style.backgroundColor = type === 'button' ? "#444" : "rgba(0,0,0,0.5)";
            if (type === 'button') el.style.color = "white";
        }

        let target = (parentId && this.uiElements[parentId]) ? this.uiElements[parentId] : document.getElementById('canvas3d');
        if (target) {
            target.appendChild(el);
            this.uiElements[id] = el;
        }
        this.updateExplorer();
    },

    setUIVisibility(id, visible) {
        const el = this.uiElements[id] || document.getElementById(id);
        if (!el) return;
        if (el._hideTimer) clearTimeout(el._hideTimer);
        if (visible) {
            el.style.display = "flex";
            void el.offsetWidth;
            el.style.opacity = "1";
            el.style.pointerEvents = "auto";
        } else {
            el.style.opacity = "0";
            el.style.pointerEvents = "none";
            el._hideTimer = setTimeout(() => { if (el.style.opacity === "0") el.style.display = "none"; }, 300);
        }
    },

    setUIText(id, text) {
        if (this.uiElements[id]) this.uiElements[id].innerText = text;
    },

    styleUI(id, props) {
        const el = this.uiElements[id];
        if (!el) return;
        if (props.radius !== undefined) el.style.borderRadius = props.radius + "px";
        if (props.bgColor !== undefined) el.style.backgroundColor = props.bgColor;
        if (props.opacity !== undefined) el.style.opacity = props.opacity;
        if (props.padding !== undefined) el.style.padding = props.padding + "px";
        if (props.strokeWidth !== undefined) el.style.border = `${props.strokeWidth}px solid ${props.strokeColor || '#fff'}`;
    },

    animateUI(id, type) {
        const el = this.uiElements[id];
        if (!el) return;
        el.style.transition = "all 0.3s ease-out";
        if (type === 'pop') {
            el.style.transform = "scale(1.2)";
            setTimeout(() => el.style.transform = "scale(1)", 200);
        } else if (type === 'fade_in') {
            this.setUIVisibility(id, true);
        } else if (type === 'fade_out') {
            this.setUIVisibility(id, false);
        }
    },

    setHoverEffect(id, scale, brightness) {
        const el = this.uiElements[id];
        if (!el) return;
        el.style.transition = "transform 0.2s, filter 0.2s";
        el.onmouseenter = () => { el.style.transform = `scale(${scale})`; el.style.filter = `brightness(${brightness}%)`; };
        el.onmouseleave = () => { el.style.transform = "scale(1)"; el.style.filter = "brightness(100%)"; };
    },

    isButtonClicked(id) {
        const varName = `btn_${id}_clicked`;
        if (this.getVariable(varName) === true) {
            this.setVariable(varName, false);
            return true;
        }
        return false;
    },

    applyTexture(objName, texName) {
        const obj = this.objects[objName];
        const texData = this.textures[texName];
        if (obj && texData) {
            new THREE.TextureLoader().load(texData, (t) => {
                t.magFilter = t.minFilter = THREE.NearestFilter;
                obj.material.map = t;
                obj.material.needsUpdate = true;
            });
        }
    },

    setSkybox(textureName) {
        if (this.textures[textureName]) {
            new THREE.TextureLoader().load(this.textures[textureName], (t) => {
                t.mapping = THREE.EquirectangularReflectionMapping;
                this.scene.background = t;
            });
        }
    },

    setFloor(textureName) {
        if (this.textures[textureName] && this.floor) {
            new THREE.TextureLoader().load(this.textures[textureName], (t) => {
                t.wrapS = t.wrapT = THREE.RepeatWrapping;
                t.repeat.set(10, 10);
                this.floor.material.map = t;
                this.floor.material.needsUpdate = true;
            });
        }
    },

    getVariable(name) { return this.variables[name] !== undefined ? this.variables[name] : 0; },
    setVariable(name, val) { this.variables[name] = val; },
    displayVariable(name, label) {
        let hud = document.getElementById('gameHUD');
        if (!hud) return;
        if (!this.variableDisplays[name]) {
            let el = document.createElement('div');
            el.id = "hud-" + name;
            hud.appendChild(el);
            this.variableDisplays[name] = el;
        }
        this.variableDisplays[name].innerText = `${label}: ${this.getVariable(name)}`;
    },

    getPlayerPosition() {
        if (!this.fpcPlayer) return null;
        const v = new THREE.Vector3();
        this.fpcPlayer.getWorldPosition(v);
        return { x: v.x, y: v.y, z: v.z };
    },

    getObjectPosition(name) {
        if (!this.objects[name]) return null;
        const v = new THREE.Vector3();
        this.objects[name].getWorldPosition(v);
        return { x: v.x, y: v.y, z: v.z };
    },

    onResize() {
        let c = document.getElementById('canvas3d');
        if (!c || !this.renderer) return;

        // Nutze offsetWidth/Height für exakte Pixelmaße
        const width = c.offsetWidth;
        const height = c.offsetHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    },

    updateExplorer() {
        const list = document.getElementById('sceneList');
        if (!list) return;
        list.innerHTML = "<small style='color: #888;'>3D OBJEKTE</small>";
        Object.keys(this.objects).forEach(name => {
            const item = document.createElement('div');
            item.className = "scene-item";
            item.innerHTML = `<span>📦 ${name}</span>`;
            list.appendChild(item);
        });
        list.innerHTML += "<hr style='border:0; border-top:1px solid #333; margin:10px 0;'><small style='color: #888;'>UI ELEMENTE</small>";
        Object.keys(this.uiElements).forEach(id => {
            const item = document.createElement('div');
            item.className = "scene-item ui-item";
            const type = this.uiElements[id].tagName.toLowerCase() === 'button' ? 'Button' : 'Frame';
            item.innerHTML = `<span>🖼️ ${id} <small>(${type})</small></span>`;
            list.appendChild(item);
        });
    },

    onTick(callback) { this.tickListeners.push(callback); },
    registerKeyEvent(k, f) { this.keyListeners[k.toLowerCase()] = f; },

    run() {
        console.log("Engine startet...");
        this.stop(); // Vorher alles sauber machen
        this.isRunning = true;

        // UI Feedback: Status Tag ändern
        const statusTag = document.getElementById('statusTag');
        if (statusTag) {
            statusTag.innerText = "RUNNING";
            statusTag.style.background = "#4CFF00";
            statusTag.style.color = "#000";
        }

        const rawCode = window.Editor.getAllCode();
        // Verpacke den Code in eine async function, damit 'await' (z.B. wait_seconds) funktioniert
        const executableCode = `(async () => { 
        try { 
            ${rawCode} 
        } catch (e) { 
            console.error("Skriptfehler im Spiel:", e); 
        } 
    })();`;

        try {
            eval(executableCode);
        } catch (e) {
            console.error("Kritischer Fehler beim Starten:", e);
        }
    },

    stop() {
        this.isRunning = false;

        const statusTag = document.getElementById('statusTag');
        if (statusTag) {
            statusTag.innerText = "System Bereit";
            statusTag.style.background = "";
            statusTag.style.color = "";
        }

        // Pointer Lock lösen, falls aktiv
        document.exitPointerLock?.();

        // UI Elemente entfernen
        Object.values(this.uiElements).forEach(el => el.remove());
        this.uiElements = {};
        const hud = document.getElementById('gameHUD');
        if (hud) {
            hud.style.display = 'none';
            hud.innerHTML = "";
        }

        // Kamera reset
        if (this.camera) {
            this.scene.attach(this.camera);
            this.camera.position.set(8, 8, 8);
            this.camera.rotation.set(0, 0, 0);
            this.camera.lookAt(0, 0, 0);
        }

        // 3D Objekte entfernen
        Object.keys(this.objects).forEach(name => {
            const obj = this.objects[name];
            this.scene.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
                else obj.material.dispose();
            }
        });

        this.objects = {};
        this.solids = [];
        this.tickListeners = [];
        this.keyListeners = {};
        this.variables = {};

        this.updateExplorer();

        if (this.controls) {
            this.controls.enabled = true;
        }
        console.log("Engine gestoppt.");
    },
    toggleFullscreen(isMaximized) {
        const sidePanel = document.getElementById('sidePanel');
        const goBtn = document.getElementById('goFullscreen');
        const exitBtn = document.getElementById('exitFullscreen');

        if (!sidePanel) return;

        if (isMaximized) {
            // Maximieren
            sidePanel.classList.add('is-maximized');
            if (goBtn) goBtn.style.display = 'none';
            if (exitBtn) exitBtn.style.display = 'block';
        } else {
            // Minimieren
            sidePanel.classList.remove('is-maximized');
            if (goBtn) goBtn.style.display = 'block';
            if (exitBtn) exitBtn.style.display = 'none';
        }

        // WICHTIG: Renderer an neue Größe anpassen
        // Ein kurzes Timeout hilft, damit das CSS erst wirken kann
        setTimeout(() => {
            this.onResize();
        }, 50);
    }
};

window.UI = {
    async loadFromCloud(projectName) {
        const urlParams = new URLSearchParams(window.location.search);
        const targetUID = urlParams.get('owner') || (window.AuthHandler && AuthHandler.user ? AuthHandler.user.uid : null);
        if (!targetUID) return;
        try {
            const doc = await firebase.firestore().collection('users').doc(targetUID).collection('projects').doc(projectName).get();
            if (doc.exists) {
                const data = doc.data();
                if (typeof data.scripts === 'string') {
                    window.Editor.scripts = JSON.parse(decodeURIComponent(escape(atob(data.scripts))));
                } else {
                    window.Editor.scripts = data.scripts || { "main": {} };
                }
                window.App.textures = data.textures || {};
                this.refreshWorkspace();
                window.Editor.renderList();
            }
        } catch (e) { console.error("Load Fehler:", e); }
    },
    refreshWorkspace() {
        if (window.workspace && window.Editor.scripts[window.Editor.currentScript]) {
            window.workspace.clear();
            Blockly.serialization.workspaces.load(window.Editor.scripts[window.Editor.currentScript], window.workspace);
        }
    }
};

window.addEventListener('load', () => App.init());
window.switchTab = function (tab) {
    const logicTab = document.getElementById('blocklyArea');
    const textureTab = document.getElementById('textureEditor');
    const btnLogic = document.getElementById('btn-logic');
    const btnTexture = document.getElementById('btn-texture');

    if (tab === 'logic') {
        logicTab.style.display = 'block';
        textureTab.style.display = 'none';
        btnLogic.classList.add('active');
        btnTexture.classList.remove('active');
        // Blockly muss wissen, dass sich die Größe geändert haben könnte
        if (window.workspace) Blockly.svgResize(window.workspace);
    } else {
        logicTab.style.display = 'none';
        textureTab.style.display = 'block';
        btnLogic.classList.remove('active');
        btnTexture.classList.add('active');
    }
};