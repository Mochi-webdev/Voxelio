window.App = window.App || {};
window.App.textures = window.App.textures || {};
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


        const state = Blockly.serialization.workspaces.save(window.workspace);
        this.scripts[this.currentScript] = state;

        this.currentScript = name;
        const data = this.scripts[name] || {};

        window.workspace.clear();
        Blockly.serialization.workspaces.load(data, window.workspace);

        this.renderList();
        console.log(`Tab gewechselt zu: ${name}`);
    },

    createScript() {
        const input = document.getElementById('scriptNameInput');
        const name = input.value.trim().replace(/[^a-zA-Z0-9]/g, '_');
        if (name && !this.scripts[name]) {
            this.scripts[name] = {};
            this.hideModal();
            this.switchScript(name);

            const pName = new URLSearchParams(window.location.search).get('project');
            if (pName) AuthHandler.saveToCloud(pName, true);
        }
        input.value = "";
    },

    showModal() { document.getElementById('nameModal').style.display = 'flex'; },
    hideModal() { document.getElementById('nameModal').style.display = 'none'; }
};
window.App = {
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    objects: {},
    keyListeners: {},
    tickListeners: [],
    isRunning: false,
    fpcPlayer: null,
    solids: [],
    mouseDelta: { x: 0, y: 0 },
    textures: {},
    init() {
        let c = document.getElementById('canvas3d');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, c.clientWidth / c.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(c.clientWidth, c.clientHeight);
        c.appendChild(this.renderer.domElement);
        // In deiner engine.js (innerhalb der init-Funktion)
        const geometry = new THREE.PlaneGeometry(100, 100);
        const material = new THREE.MeshStandardMaterial({ color: 0x808080 });
        const floor = new THREE.Mesh(geometry, material);

        floor.rotation.x = -Math.PI / 2; // Flach hinlegen
        floor.receiveShadow = true;
        floor.name = "mainFloor"; // WICHTIG: Damit wir ihn finden
        this.scene.add(floor);
        this.floor = floor; // Referenz im App-Objekt speichern

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
            if (App.isRunning) {
                App.mouseDelta.x = e.movementX || 0;
                App.mouseDelta.y = e.movementY || 0;
            }
        });

        this.animate();
    },
    cloneObject: function(originalName, newId) {
        const original = this.objects[originalName];
        if (!original) {
            console.warn("Clone-Fehler: Objekt '" + originalName + "' nicht gefunden.");
            return;
        }

        // 1. Objekt klonen
        const clone = original.clone();
        
        // 2. Neue ID zuweisen und im System registrieren
        clone.name = newId;
        this.objects[newId] = clone;
        
        // 3. Zur Szene hinzufügen
        this.scene.add(clone);
        
        // 4. Explorer aktualisieren, damit der Klon in der Liste erscheint
        this.updateExplorer();
        
        console.log(`Objekt '${originalName}' wurde als '${newId}' geklont.`);
    },

    onResize() {
        let c = document.getElementById('canvas3d');
        this.camera.aspect = c.clientWidth / c.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(c.clientWidth, c.clientHeight);
    },
    setRotation(name, axis, degree) {
        const obj = this.objects[name];
        if (obj) {

            const radians = THREE.MathUtils.degToRad(parseFloat(degree));
            obj.rotation[axis] = radians;
        }
    },
    spawn(t, c, n, p = "Szene") {
        if (this.objects[n]) this.scene.remove(this.objects[n]);
        let obj;
        if (t === 'group') obj = new THREE.Group();
        else {
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

    registerKeyEvent(k, f) { this.keyListeners[k.toLowerCase()] = f; },

    onTick(callback) { this.tickListeners.push(callback); },

    move(n, a, v) { if (this.objects[n]) this.objects[n].position[a] += parseFloat(v); },

    transform(n, a, v) { if (this.objects[n]) this.objects[n].position[a] = parseFloat(v); },

    setScale(n, v) { if (this.objects[n]) this.objects[n].scale.set(v, v, v); },

    addRotation(n, a, s) {
        if (this.objects[n]) this.objects[n].userData.animations.push(() => this.objects[n].rotation[a] += s);
    },

    setLightIntensity(val) {
        this.scene.traverse((child) => {
            if (child instanceof THREE.DirectionalLight) child.intensity = parseFloat(val);
        });
    },

    animate() {
       requestAnimationFrame(() => this.animate());

    
        if (this.isRunning) {

            this.tickListeners.forEach(f => f());
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


    run() {
        this.stop();
        this.isRunning = true;
        document.body.classList.add('running');
        try {
            eval(Editor.getAllCode());
        } catch (e) {
            console.error("Fehler im Code:", e);
            this.stop();
        }
    },
    removeUI(id) {
        if (this.uiElements[id]) {
            this.uiElements[id].remove();
            delete this.uiElements[id];

            delete this.variables[`btn_${id}_clicked`];
        }
    },
    stop() {
        this.isRunning = false;
        this.solids = [];
        document.body.classList.remove('running');

        this.scene.attach(this.camera);

        if (this.fpcPlayer) this.fpcPlayer.visible = true;

        this.camera.position.set(8, 8, 8);
        this.camera.lookAt(0, 0, 0);

        Object.values(this.objects).forEach(o => this.scene.remove(o));
        this.objects = {};
        this.keyListeners = {};
        this.tickListeners = [];
        this.fpcPlayer = null;
        this.controls.enabled = true;

        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
        this.updateExplorer();
    },
    updateExplorer() {
        const list = document.getElementById('sceneList');
        if (!list) return;
        list.innerHTML = "";


        const section3D = document.createElement('div');
        section3D.innerHTML = "<small style='color: #888;'>3D OBJEKTE</small>";
        list.appendChild(section3D);

        Object.keys(this.objects).forEach(name => {
            const item = document.createElement('div');
            item.className = "scene-item";
            item.innerHTML = `<span>📦 ${name}</span>`;

            item.onclick = () => console.log("3D Objekt gewählt:", name);
            list.appendChild(item);
        });


        const hr = document.createElement('hr');
        hr.style.border = "0; border-top: 1px solid #333; margin: 10px 0;";
        list.appendChild(hr);


        const sectionUI = document.createElement('div');
        sectionUI.innerHTML = "<small style='color: #888;'>UI ELEMENTE</small>";
        list.appendChild(sectionUI);

        Object.keys(this.uiElements).forEach(id => {
            const item = document.createElement('div');
            item.className = "scene-item ui-item";

            const type = this.uiElements[id].tagName.toLowerCase() === 'button' ? 'Button' : 'Frame';
            item.innerHTML = `<span>🖼️ ${id} <small>(${type})</small></span>`;


            item.onclick = () => {
                const el = this.uiElements[id];
                el.style.outline = "2px solid #4CFF00";
                setTimeout(() => el.style.outline = "none", 500);
            };
            list.appendChild(item);
        });
    },
    setViewMode(mode) {
        this.viewMode = mode;
        if (!this.fpcPlayer || !this.camera) return;


        if (this.camera.parent !== this.fpcPlayer) {
            this.fpcPlayer.add(this.camera);
        }

        if (mode === 'fp') {

            this.camera.position.set(0, 1.6, 0);
            this.camera.rotation.set(0, 0, 0);
            this.fpcPlayer.visible = false;
        } else {

            this.camera.position.set(0, 4, 8);


            this.camera.lookAt(new THREE.Vector3(0, 1.6, 0));

            this.fpcPlayer.visible = true;
        }
    },
    setUIText(id, text) {
        const el = this.uiElements[id];
        if (el) {

            el.innerText = text;
        } else {
            console.warn(`UI-Text Fehler: Element mit ID '${id}' nicht gefunden.`);
        }
    },
    setDimension(name, axis, value) {
        const obj = this.objects[name];
        if (obj) {
            const val = parseFloat(value);

            obj.scale[axis] = val;

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

        if (intersections.length > 0) {

            if (intersections[0].distance < distance + 0.5) {
                return true;
            }
        }
        return false;
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


        const isWallInWay = this.checkCollision(
            this.fpcPlayer.position,
            moveVec,
            s
        );

        if (!isWallInWay) {
            this.fpcPlayer.position.add(moveVec);
        }
    },
    toggleFullscreen: function (enable) {
    const panel = document.getElementById('sidePanel');
    const resizer = document.getElementById('resizer');
    
    // Die beiden Buttons holen
    const btnMax = document.getElementById('goFullscreen');
    const btnMin = document.getElementById('exitFullscreen');

    if (enable) {
        panel.classList.add('fullscreen');
        if (resizer) resizer.style.display = 'none';
        
        // Buttons umschalten
        if (btnMax) btnMax.style.display = 'none';
        if (btnMin) btnMin.style.display = 'block';
    } else {
        panel.classList.remove('fullscreen');
        if (resizer) resizer.style.display = 'block';
        
        // Buttons umschalten
        if (btnMax) btnMax.style.display = 'block';
        if (btnMin) btnMin.style.display = 'none';
    }

    // Three.js Resize auslösen
    setTimeout(() => {
        this.onWindowResize();
    }, 100);
},

    // Hilfsfunktion für das Resize (sollte in deiner engine.js sein)
    onWindowResize: function () {
        if (!this.camera || !this.renderer) return;

        const container = document.getElementById('canvas3d');
        const width = container.clientWidth;
        const height = container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    },

    variableDisplays: {},

    displayVariable(name, label) {
        let hud = document.getElementById('gameHUD');
        if (!this.variableDisplays[name]) {
            let el = document.createElement('div');
            el.id = "hud-" + name;
            hud.appendChild(el);
            this.variableDisplays[name] = el;
        }

        this.variableDisplays[name].innerText = `${label}: ${this.getVariable(name)}`;
    },

    stop() {
        this.isRunning = false;
        document.body.classList.remove('running');


        Object.keys(this.uiElements).forEach(id => {
            if (this.uiElements[id]) this.uiElements[id].remove();
        });
        this.uiElements = {};

        const hud = document.getElementById('gameHUD');
        if (hud) hud.innerHTML = "";
        this.variableDisplays = {};


        if (this.camera) {
            this.scene.attach(this.camera);
            this.camera.position.set(8, 8, 8);
            this.camera.lookAt(0, 0, 0);
        }

        if (this.fpcPlayer) this.fpcPlayer.visible = true;


        Object.values(this.objects).forEach(o => this.scene.remove(o));


        this.objects = {};
        this.solids = [];
        this.keyListeners = {};
        this.tickListeners = [];
        this.variables = {};
        this.fpcPlayer = null;

        if (this.controls) this.controls.enabled = true;
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }

        this.updateExplorer();
        console.log("> System gestoppt und bereinigt.");
    },

    applyTexture(objName, texName) {
        const obj = this.objects[objName];
        const texData = this.textures[texName];
        if (obj && texData) {
            const loader = new THREE.TextureLoader();
            loader.load(texData, (texture) => {

                texture.magFilter = THREE.NearestFilter;
                texture.minFilter = THREE.NearestFilter;
                obj.material.map = texture;
                obj.material.needsUpdate = true;
            });
        }
    },
    setSkybox: function (textureName) {
        if (!this.textures || !this.textures[textureName]) {
            console.warn("Skybox-Fehler: Textur '" + textureName + "' nicht gefunden.");
            return;
        }

        const loader = new THREE.TextureLoader();
        // Hole die Base64-Daten der Textur aus deinem Speicher
        const textureData = this.textures[textureName];

        loader.load(textureData, (texture) => {
            // Three.js Skybox Logik
            texture.mapping = THREE.EquirectangularReflectionMapping;
            this.scene.background = texture;
            console.log("Skybox aktualisiert: " + textureName);
        });
    },
    setFloor: function (textureName) {
        // 1. Sicherheitcheck: Existiert die Textur?
        if (!this.textures || !this.textures[textureName]) {
            console.error("Boden-Fehler: Textur '" + textureName + "' nicht gefunden.");
            return;
        }

        // 2. Suche das Boden-Objekt in deiner Szene
        // Falls du keine 'this.floor' Variable hast, suchen wir nach dem Namen
        const ground = this.floor || this.scene.getObjectByName("ground");

        if (!ground) {
            console.warn("Kein Boden-Objekt in der Szene gefunden!");
            return;
        }

        // 3. Textur laden und zuweisen
        const loader = new THREE.TextureLoader();
        loader.load(this.textures[textureName], (texture) => {
            // Einstellungen für Kachelung (Wiederholung der Textur)
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(10, 10); // Wie oft die Textur wiederholt wird

            // Dem Material zuweisen
            if (ground.material) {
                ground.material.map = texture;
                ground.material.needsUpdate = true;
            }
            console.log("Boden-Textur geändert zu:", textureName);
        });
    },




    variables: {},

    getVariable(name) { return this.variables[name] || 0; },
    setVariable(name, val) { this.variables[name] = val; },

    checkCollisionBetween(name1, name2) {
        const obj1 = this.objects[name1];
        const obj2 = this.objects[name2];
        if (!obj1 || !obj2) return false;


        const box1 = new THREE.Box3().setFromObject(obj1);
        const box2 = new THREE.Box3().setFromObject(obj2);
        return box1.intersectsBox(box2);
    },

    getObjectColor(name) {
        const obj = this.objects[name];
        if (obj && obj.material) {
            return "#" + obj.material.color.getHexString();
        }
        return "#ffffff";
    },


    uiElements: {},

    createUI(type, id, x, y, w, h, text = "", texture = "", parentId = null) {

        if (this.uiElements[id]) {
            this.uiElements[id].remove();
        }

        const el = document.createElement(type === 'button' ? 'button' : 'div');
        el.id = "ui-" + id;

        el.style.position = "absolute";
        el.style.left = x + "px";
        el.style.top = y + "px";
        el.style.width = w + "px";
        el.style.height = h + "px";
        el.style.zIndex = "100";
        el.style.border = "none";
        el.style.boxSizing = "border-box";
        el.style.display = "flex";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";
        el.style.fontFamily = "sans-serif";

        if (type === 'button') {
            el.innerText = text;
            el.style.cursor = "pointer";

            el.onclick = () => {
                this.setVariable(`btn_${id}_clicked`, true);
            };
        }

        if (type === 'scrolling_frame') {
            el.style.overflowY = "auto";
            el.style.overflowX = "hidden";
            el.style.display = "block";
        }


        if (texture && texture !== "none" && this.textures[texture]) {
            el.style.backgroundImage = `url(${this.textures[texture]})`;
            el.style.backgroundSize = "100% 100%";
            el.style.backgroundRepeat = "no-repeat";
            el.style.backgroundColor = "transparent";
        } else {

            if (type === 'button') {
                el.style.backgroundColor = "#444";
                el.style.color = "white";
            } else {
                el.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
                el.style.border = "1px solid #555";
            }
        }


        let targetContainer = document.getElementById('canvas3d');

        if (parentId && this.uiElements[parentId]) {
            targetContainer = this.uiElements[parentId];

        }


        if (targetContainer) {
            targetContainer.appendChild(el);
            this.uiElements[id] = el;
        } else {
            console.error(`UI Fehler: Container für ID ${id} nicht gefunden!`);
        }

        this.updateExplorer();
    },

    isButtonClicked(id) {
        const varName = `btn_${id}_clicked`;
        const clicked = this.getVariable(varName);

        if (clicked === true) {
            this.setVariable(varName, false);
            return true;
        }
        return false;
    },
    animateUI(id, type) {
        const el = this.uiElements[id];
        if (!el) return;

        el.style.transition = "all 0.3s ease-out";

        switch (type) {
            case 'pop':
                el.style.transform = "scale(1.2)";
                setTimeout(() => el.style.transform = "scale(1)", 200);
                break;
            case 'fade_in':
                el.style.opacity = "0";
                el.style.display = "block";
                setTimeout(() => el.style.opacity = "1", 10);
                break;
            case 'fade_out':
                el.style.opacity = "0";
                setTimeout(() => el.style.display = "none", 300);
                break;
            case 'slide_up':
                const originalY = el.offsetTop;
                el.style.top = (originalY + 20) + "px";
                el.style.opacity = "0";
                setTimeout(() => {
                    el.style.top = originalY + "px";
                    el.style.opacity = "1";
                }, 10);
                break;
        }
    },


    setHoverEffect(id, scale, brightness) {
        const el = this.uiElements[id];
        if (!el) return;
        el.style.transition = "transform 0.2s, filter 0.2s";
        el.onmouseenter = () => {
            el.style.transform = `scale(${scale})`;
            el.style.filter = `brightness(${brightness}%)`;
        };
        el.onmouseleave = () => {
            el.style.transform = "scale(1)";
            el.style.filter = "brightness(100%)";
        };
    },
    
    styleUI(id, props) {
        const el = this.uiElements[id];
        if (!el) return;

        if (props.radius !== undefined) el.style.borderRadius = props.radius + "px";
        if (props.bgColor !== undefined) {

            el.style.backgroundColor = props.bgColor;
        }
        if (props.opacity !== undefined) {
            el.style.opacity = props.opacity;
        }
        if (props.strokeWidth !== undefined) {
            el.style.border = `${props.strokeWidth}px solid ${props.strokeColor || '#ffffff'}`;
        }
        if (props.padding !== undefined) {
            el.style.padding = props.padding + "px";
        }
    },
    velocityy: 0,      // Vertikale Geschwindigkeit
    isGrounded: true,  // Prüft, ob der Spieler den Boden berührt
    gravity: -0.015,   // Wie stark die Schwerkraft zieht

    jump: function(force) {
        if (this.isGrounded) {
            this.velocityy = parseFloat(force);
            this.isGrounded = false;
            console.log("Sprung!");
        }
    },

  updatePhysics: function() {
    // Nur ausführen, wenn das Spiel läuft und ein Player da ist
    if (!this.isRunning || !this.fpcPlayer) return;

    // 1. Schwerkraft auf Geschwindigkeit anwenden
    this.velocityy = (this.velocityy || 0) + (this.gravity || -0.015);
    
    // 2. Geschwindigkeit auf Position anwenden
    this.fpcPlayer.position.y += this.velocityy;

    // 3. Boden-Check (einfach: y = 0)
    if (this.fpcPlayer.position.y <= 0) {
        this.fpcPlayer.position.y = 0;
        this.velocityy = 0;
        this.isGrounded = true;
    } else {
        this.isGrounded = false;
    }
},
};

window.addEventListener('load', () => App.init());
window.switchTab = function (tab) {
    const logic = document.getElementById('blocklyArea');
    const texture = document.getElementById('textureEditor');
    const btnLogic = document.getElementById('btn-logic');
    const btnTexture = document.getElementById('btn-texture');

    if (tab === 'logic') {
        logic.style.display = 'block';
        texture.style.display = 'none';
        btnLogic.classList.add('active');
        btnTexture.classList.remove('active');

        Blockly.svgResize(window.workspace);
    } else {
        logic.style.display = 'none';
        texture.style.display = 'flex';
        btnLogic.classList.remove('active');
        btnTexture.classList.add('active');

        if (!TextureEditor.initialized) TextureEditor.init();
    }
};

window.UI = {
    loadFromCloud: async function (projectName) {
        if (!window.AuthHandler || !AuthHandler.user) {
            console.error("Laden abgebrochen: Benutzer nicht angemeldet.");
            return;
        }

        try {
            console.log(`Lade Projekt: ${projectName}...`);
            const doc = await firebase.firestore()
                .collection('users')
                .doc(AuthHandler.user.uid)
                .collection('projects')
                .doc(projectName)
                .get();

            if (doc.exists) {
                const data = doc.data();


                if (data.textures) {
                    window.App.textures = data.textures;
                    console.log("Texturen geladen:", Object.keys(data.textures));
                } else {
                    window.App.textures = {};
                }



                if (data.scripts) {
                    try {
                        // Check if data is encoded (String) or old format (Object)
                        if (typeof data.scripts === 'string') {
                            const decoded = decodeURIComponent(escape(atob(data.scripts)));
                            window.Editor.scripts = JSON.parse(decoded);
                        } else {
                            window.Editor.scripts = data.scripts;
                        }
                    } catch (e) {
                        console.error("Decoding error:", e);
                        window.Editor.scripts = { "Main": {} };
                    }
                }


                const scriptNames = Object.keys(window.Editor.scripts);
                const scriptToDisplay = scriptNames.includes("Main") ? "Main" : scriptNames[0];

                window.Editor.currentScript = scriptToDisplay;


                if (window.Editor.renderList) {
                    window.Editor.renderList();
                }


                if (window.workspace) {
                    window.workspace.clear();
                    const savedBlocks = window.Editor.scripts[scriptToDisplay];

                    if (savedBlocks && Object.keys(savedBlocks).length > 0) {
                        try {
                            Blockly.serialization.workspaces.load(savedBlocks, window.workspace);
                            console.log("Blöcke erfolgreich in Workspace geladen.");
                        } catch (err) {
                            console.error("Fehler beim Parsen der Blöcke:", err);

                            try {
                                const xml = Blockly.utils.xml.textToDom(savedBlocks);
                                Blockly.Xml.domToWorkspace(xml, window.workspace);
                            } catch (e2) { console.error("XML Fallback fehlgeschlagen."); }
                        }
                    }
                }

                console.log("✅ Projekt vollständig geladen.");
            } else {
                console.warn("Projekt wurde in der Datenbank nicht gefunden.");
            }
        } catch (error) {
            console.error("Kritischer Fehler beim Laden aus der Cloud:", error);
        }
    }
};
// In deiner Engine-Datei (z.B. engine.js) hinzufügen:

App.setUIVisibility = function(id, visible) {
    const element = document.getElementById(id); // Oder dein UI-System-Lookup
    if (element) {
        element.style.display = visible ? "block" : "none";
    }
};

App.getObjectPosition = function(name) {
    const obj = this.scene.getObjectByName(name);
    return obj ? obj.position : null;
};

App.getPlayerPosition = function() {
    // Falls du den First Person Controller nutzt:
    return this.player ? this.player.position : {x:0, y:0, z:0};
};