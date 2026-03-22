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
    mouseDelta: { x: 0, y: 0 },

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

    moveFPC(dir, speed) {
        if (!this.fpcPlayer) return;
        const vector = new THREE.Vector3();
        const s = parseFloat(speed);
        if (dir === 'forward') vector.z -= s;
        if (dir === 'backward') vector.z += s;
        if (dir === 'left') vector.x -= s;
        if (dir === 'right') vector.x += s;

        vector.applyQuaternion(this.fpcPlayer.quaternion);
        this.fpcPlayer.position.add(vector);
    },

    run() {
        this.stop();
        this.isRunning = true;
        document.body.classList.add('running');
        try { eval(Editor.getAllCode()); } catch (e) { console.error(e); }
    },

    stop() {
        this.isRunning = false;
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
    }
};

window.addEventListener('load', () => App.init());