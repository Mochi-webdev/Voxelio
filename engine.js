window.App = {
    scene: null, camera: null, renderer: null, controls: null,
    objects: {},
    animations: [],

    init: function() {
        const container = document.getElementById('canvas3d');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(this.renderer.domElement);

        this.scene.add(new THREE.AmbientLight(0xffffff, 0.8));
        const light = new THREE.PointLight(0xffffff, 1);
        light.position.set(10, 10, 10);
        this.scene.add(light);
        this.scene.add(new THREE.GridHelper(20, 20, 0x444444, 0x888888));

        this.camera.position.set(8, 8, 8);
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.animate();
    },

    spawn: function(type, color, name) {
        if (this.objects[name]) this.scene.remove(this.objects[name]);
        
        let geo;
        if(type === 'sphere') geo = new THREE.SphereGeometry(1, 32, 32);
        else geo = new THREE.BoxGeometry(2, 2, 2);

        const mat = new THREE.MeshStandardMaterial({ color: color });
        const mesh = new THREE.Mesh(geo, mat);
        
        this.scene.add(mesh);
        this.objects[name] = mesh;
        this.objects[name].userData.animations = []; // Speicher für Ticks
    },

    transform: function(name, axis, value) {
        if (this.objects[name]) {
            this.objects[name].position[axis] = value;
        }
    },

    addRotation: function(name, axis, speed) {
        if (this.objects[name]) {
            this.objects[name].userData.animations.push(() => {
                this.objects[name].rotation[axis] += speed;
            });
        }
    },

    animate: function() {
        requestAnimationFrame(() => this.animate());
        
        // Führe alle registrierten Animationen aus
        for (let key in this.objects) {
            const obj = this.objects[key];
            if (obj.userData.animations) {
                obj.userData.animations.forEach(fn => fn());
            }
        }

        if(this.controls) this.controls.update();
        this.renderer.render(this.scene, this.camera);
    },

    run: function() {
        this.stop();
        const code = Blockly.JavaScript.workspaceToCode(window.workspace);
        try {
            eval(code);
            document.getElementById('log').innerText = "> Programm läuft...";
        } catch(e) {
            document.getElementById('log').innerText = "> Fehler: " + e.message;
        }
    },

    stop: function() {
        for (let id in this.objects) this.scene.remove(this.objects[id]);
        this.objects = {};
        document.getElementById('log').innerText = "> Gestoppt.";
    }
};

window.addEventListener('load', () => App.init());