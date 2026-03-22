window.App = {
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    objects: {},
    keyListeners: {},
    tickListeners: [], // Initialisiere hier
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

        this.scene.add(new THREE.AmbientLight(0xffffff, 0.8));
        let l = new THREE.DirectionalLight(0xffffff, 0.5);
        l.position.set(5, 10, 7);
        this.scene.add(l);

        this.scene.background = new THREE.Color(0x0b0b0e);
        this.scene.add(new THREE.GridHelper(30, 30, 0x222222, 0x333333));

        this.camera.position.set(8, 8, 8);
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

        // Key Listeners fix
        window.addEventListener('keydown', (e) => {
            if (!this.isRunning) return;
            let k = e.key === " " ? " " : e.key;
            let f = this.keyListeners[k.toLowerCase()] || this.keyListeners[k];
            if (f) f();
        });

        // Mouse Move fix: Nutze App statt this für den EventListener
        window.addEventListener('mousemove', (e) => {
            if (App.isRunning) {
                App.mouseDelta.x = e.movementX || 0;
                App.mouseDelta.y = e.movementY || 0;
            }
        });

        this.animate();
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
            // Three.js uses Radians, so we convert the input degrees
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

    // NUR EINE ANIMATE FUNKTION
    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.isRunning) {
            // Tick Events ausführen
            this.tickListeners.forEach(f => f());

            // Standard Animationen ausführen
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
            this.camera.rotation.set(0, 0, 0); // Kamera-Rotation nullen
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

        // Wichtig: Nach dem Frame MouseDelta zurücksetzen!
        this.mouseDelta = { x: 0, y: 0 };
    },


    run() {
        this.stop(); // Erst alles sauber löschen
        this.isRunning = true;
        document.body.classList.add('running');
        try {
            eval(Editor.getAllCode());
        } catch (e) {
            console.error("Fehler im Code:", e);
            this.stop(); // Bei Fehler sofort stoppen
        }
    },
    removeUI(id) {
        if (this.uiElements[id]) {
            this.uiElements[id].remove();
            delete this.uiElements[id];
            // Auch die Klick-Variable löschen, damit sie beim nächsten Mal sauber ist
            delete this.variables[`btn_${id}_clicked`];
        }
    },
    stop() {
        this.isRunning = false;
        this.solids = [];
        document.body.classList.remove('running');

        // Kamera vom Spieler lösen und zurück in die Welt-Szene
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
        let l = document.getElementById('sceneList');
        l.innerHTML = '';
        Object.keys(this.objects).forEach(name => {
            let i = document.createElement('div');
            i.className = 'explorer-item';
            i.innerHTML = `${this.objects[name] instanceof THREE.Group ? '📁' : '📦'} ${name}`;
            l.appendChild(i);
        });
    },
    setViewMode(mode) {
        this.viewMode = mode;
        if (!this.fpcPlayer || !this.camera) return;

        // Wir stellen sicher, dass die Kamera ein Kind des Spielers ist
        if (this.camera.parent !== this.fpcPlayer) {
            this.fpcPlayer.add(this.camera);
        }

        if (mode === 'fp') {
            // First Person: Exakt im Kopf des Spielers
            this.camera.position.set(0, 1.6, 0);
            this.camera.rotation.set(0, 0, 0);
            this.fpcPlayer.visible = false;
        } else {
            // Third Person: Hinter und über dem Spieler
            // Wir setzen die Position RELATIV zum Spieler-Zentrum
            this.camera.position.set(0, 4, 8);

            // WICHTIG: Die Kamera soll auf die Augenhöhe des Spielers schauen (relativ 0, 1.6, 0)
            this.camera.lookAt(new THREE.Vector3(0, 1.6, 0));

            this.fpcPlayer.visible = true;
        }
    },
    setDimension(name, axis, value) {
        const obj = this.objects[name];
        if (obj) {
            const val = parseFloat(value);
            // We update the scale on the specific axis
            obj.scale[axis] = val;

            // Optional: If you use physics or bounding boxes, 
            // you might need to update them here.
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

        // Create a Raycaster starting at the player's position
        // pointing in the direction they want to move
        const raycaster = new THREE.Raycaster(currentPos, direction.clone().normalize());

        // Check if the ray hits any of our solid objects
        const intersections = raycaster.intersectObjects(this.solids);

        if (intersections.length > 0) {
            // If the closest hit is nearer than our movement distance, we hit a wall!
            if (intersections[0].distance < distance + 0.5) { // 0.5 is a small "buffer"
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

        // Turn the local movement into World Space based on player rotation
        moveVec.applyQuaternion(this.fpcPlayer.quaternion);

        // COLLISION CHECK
        const isWallInWay = this.checkCollision(
            this.fpcPlayer.position,
            moveVec,
            s
        );

        if (!isWallInWay) {
            this.fpcPlayer.position.add(moveVec);
        }
    },
    // In window.App einfügen:
    variableDisplays: {}, // Speichert, welche Variablen gerade angezeigt werden

    displayVariable(name, label) {
        let hud = document.getElementById('gameHUD');
        if (!this.variableDisplays[name]) {
            let el = document.createElement('div');
            el.id = "hud-" + name;
            hud.appendChild(el);
            this.variableDisplays[name] = el;
        }
        // Update den Text: "Punkte: 10"
        this.variableDisplays[name].innerText = `${label}: ${this.getVariable(name)}`;
    },

    stop() {
        this.isRunning = false;
        document.body.classList.remove('running');

        // 1. UI komplett abräumen
        Object.keys(this.uiElements).forEach(id => {
            if (this.uiElements[id]) this.uiElements[id].remove();
        });
        this.uiElements = {};

        // 2. HUD (Variablen-Anzeige) leeren
        const hud = document.getElementById('gameHUD');
        if (hud) hud.innerHTML = "";
        this.variableDisplays = {};

        // 3. Kamera zurücksetzen und vom Spieler lösen
        if (this.camera) {
            this.scene.attach(this.camera);
            this.camera.position.set(8, 8, 8);
            this.camera.lookAt(0, 0, 0);
        }

        if (this.fpcPlayer) this.fpcPlayer.visible = true;

        // 4. Alle 3D-Objekte aus der Szene löschen
        Object.values(this.objects).forEach(o => this.scene.remove(o));

        // 5. Alle Listen und States resetten
        this.objects = {};
        this.solids = [];
        this.keyListeners = {};
        this.tickListeners = [];
        this.variables = {}; // Wichtig: Alle Punkte/Logik auf 0
        this.fpcPlayer = null;

        // 6. Steuerung und Maus-Lock freigeben
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
                // Voxel-Look: Kein Verschwimmen beim Skalieren
                texture.magFilter = THREE.NearestFilter;
                texture.minFilter = THREE.NearestFilter;
                obj.material.map = texture;
                obj.material.needsUpdate = true;
            });
        }
    },



    // In window.App einfügen:
    variables: {},

    getVariable(name) { return this.variables[name] || 0; },
    setVariable(name, val) { this.variables[name] = val; },

    checkCollisionBetween(name1, name2) {
        const obj1 = this.objects[name1];
        const obj2 = this.objects[name2];
        if (!obj1 || !obj2) return false;

        // Einfache Box-Kollision (AABB)
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

    // In window.App einfügen:
    uiElements: {},

    createUI(type, id, x, y, w, h, text = "", texture = "", parentId = null) {
        // 1. Altes Element mit derselben ID entfernen, um Duplikate zu vermeiden
        if (this.uiElements[id]) {
            this.uiElements[id].remove();
        }

        // 2. Element-Typ erstellen
        const el = document.createElement(type === 'button' ? 'button' : 'div');
        el.id = "ui-" + id;

        // 3. Grundstyling
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

        // 4. Spezifische Logik für Typen
        if (type === 'button') {
            el.innerText = text;
            el.style.cursor = "pointer";
            // Klick-Event speichert den Status in unseren Engine-Variablen
            el.onclick = () => {
                this.setVariable(`btn_${id}_clicked`, true);
            };
        }

        if (type === 'scrolling_frame') {
            el.style.overflowY = "auto";
            el.style.overflowX = "hidden";
            el.style.display = "block"; // Block für Scrolling wichtig
        }

        // 5. Textur oder Hintergrundfarbe anwenden
        if (texture && texture !== "none" && this.textures[texture]) {
            el.style.backgroundImage = `url(${this.textures[texture]})`;
            el.style.backgroundSize = "100% 100%";
            el.style.backgroundRepeat = "no-repeat";
            el.style.backgroundColor = "transparent";
        } else {
            // Standard-Farben, wenn keine Textur vorhanden ist
            if (type === 'button') {
                el.style.backgroundColor = "#444";
                el.style.color = "white";
            } else {
                el.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
                el.style.border = "1px solid #555";
            }
        }

        // 6. Parenting (Verschachtelung)
        // Standardmäßig ist das Ziel unser 3D-Canvas Container
        let targetContainer = document.getElementById('canvas3d');

        // Falls eine parentId angegeben wurde und dieses Element existiert:
        if (parentId && this.uiElements[parentId]) {
            targetContainer = this.uiElements[parentId];
            // Wenn es in einem Frame ist, positionieren wir es oft relativ (optional)
            // el.style.position = "relative"; 
        }

        // 7. Ans UI-System anhängen
        if (targetContainer) {
            targetContainer.appendChild(el);
            this.uiElements[id] = el;
        } else {
            console.error(`UI Fehler: Container für ID ${id} nicht gefunden!`);
        }
    },

    isButtonClicked(id) {
        const varName = `btn_${id}_clicked`;
        const clicked = this.getVariable(varName);

        if (clicked === true) {
            this.setVariable(varName, false); // Sofort zurücksetzen (Toggle-Schutz)
            return true;
        }
        return false;
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
        // Blockly sagen, dass es sich neu berechnen muss
        Blockly.svgResize(window.workspace);
    } else {
        logic.style.display = 'none';
        texture.style.display = 'flex';
        btnLogic.classList.remove('active');
        btnTexture.classList.add('active');
        // Initialisiere den Painter, falls noch nicht geschehen
        if (!TextureEditor.initialized) TextureEditor.init();
    }
};