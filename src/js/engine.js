window.App = {
    scene: null, camera: null, renderer: null, controls: null,
    objects: {}, keyListeners: {}, isRunning: false,
    init() {
        let c = document.getElementById('canvas3d');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, c.clientWidth / c.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(c.clientWidth, c.clientHeight);
        c.appendChild(this.renderer.domElement);
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.8));
        let l = new THREE.DirectionalLight(0xffffff, 0.5); l.position.set(5, 10, 7);
        this.scene.add(l);
        this.scene.background = new THREE.Color(0x0b0b0e);
        this.scene.add(new THREE.GridHelper(30, 30, 0x222222, 0x333333));
        this.camera.position.set(8, 8, 8);
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        window.addEventListener('keydown', (e) => {
            if (!this.isRunning) return;
            let k = e.key === " " ? " " : e.key;
            let f = this.keyListeners[k.toLowerCase()] || this.keyListeners[k];
            if(f) f();
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
            switch(t) {
                case 'sphere': g = new THREE.SphereGeometry(1, 32, 16); break;
                case 'torus': g = new THREE.TorusGeometry(1, 0.3, 12, 48); break;
                case 'cylinder': g = new THREE.CylinderGeometry(1, 1, 2, 32); break;
                default: g = new THREE.BoxGeometry(1.5, 1.5, 1.5);
            }
            obj = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: c }));
        }
        obj.name = n; obj.userData = { animations: [] };
        if (p !== "Szene" && this.objects[p]) this.objects[p].add(obj); else this.scene.add(obj);
        this.objects[n] = obj;
        this.updateExplorer();
    },
    registerKeyEvent(k, f) { this.keyListeners[k.toLowerCase()] = f; },
    move(n, a, v) { if (this.objects[n]) this.objects[n].position[a] += parseFloat(v); },
    transform(n, a, v) { if (this.objects[n]) this.objects[n].position[a] = parseFloat(v); },
    setScale(n, v) { if (this.objects[n]) this.objects[n].scale.set(v, v, v); },
    addRotation(n, a, s) { if (this.objects[n]) this.objects[n].userData.animations.push(() => this.objects[n].rotation[a] += s); },
    updateExplorer() {
        let l = document.getElementById('sceneList'); l.innerHTML = '';
        const build = (parent, container, depth) => {
            parent.children.forEach(c => {
                if(this.objects[c.name]) {
                    let i = document.createElement('div'); i.className = 'explorer-item';
                    i.style.paddingLeft = (depth * 20) + "px";
                    i.innerHTML = `${c instanceof THREE.Group ? '📁' : '📦'} ${c.name}`;
                    container.appendChild(i);
                    build(c, container, depth + 1);
                }
            });
        };
        build(this.scene, l, 0);
    },
    animate() {
        requestAnimationFrame(() => this.animate());
        Object.values(this.objects).forEach(o => o.userData.animations.forEach(f => f()));
        if(this.controls) this.controls.update();
        this.renderer.render(this.scene, this.camera);
    },
    run() {
        this.stop(); this.isRunning = true;
        document.body.classList.add('running');
        try { eval(Editor.getAllCode()); } catch(e) { console.error(e); }
    },
    stop() {
        this.isRunning = false;
        document.body.classList.remove('running');
        Object.values(this.objects).forEach(o => this.scene.remove(o));
        this.objects = {}; this.keyListeners = {}; this.updateExplorer();
    }
};
window.addEventListener('load', () => App.init());