window.App = {
    scene: null, camera: null, renderer: null, controls: null,
    objects: {},

    init: function() {
        const container = document.getElementById('canvas3d');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(this.renderer.domElement);

        this.scene.add(new THREE.AmbientLight(0xffffff, 0.7));
        const sun = new THREE.DirectionalLight(0xffffff, 0.5);
        sun.position.set(5, 10, 7);
        this.scene.add(sun);
        this.scene.add(new THREE.GridHelper(20, 20, 0x444444, 0x888888));

        this.camera.position.set(8, 8, 8);
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.animate();
    },

    spawn: function(type, color, name, parentName = "Szene") {
        if (this.objects[name]) {
            const old = this.objects[name];
            if (old.parent) old.parent.remove(old);
        }

        let obj;
        if (type === 'group') {
            obj = new THREE.Group();
        } else {
            let geo;
            switch(type) {
                case 'sphere': geo = new THREE.SphereGeometry(1, 32, 32); break;
                case 'torus': geo = new THREE.TorusGeometry(1, 0.4, 16, 100); break;
                case 'cylinder': geo = new THREE.CylinderGeometry(1, 1, 2, 32); break;
                case 'cone': geo = new THREE.ConeGeometry(1, 2, 32); break;
                case 'ring': geo = new THREE.RingGeometry(0.5, 1, 32); break;
                default: geo = new THREE.BoxGeometry(2, 2, 2);
            }
            const mat = new THREE.MeshStandardMaterial({ color: color, side: THREE.DoubleSide });
            obj = new THREE.Mesh(geo, mat);
        }

        obj.name = name;
        obj.userData.type = type;
        obj.userData.animations = [];

        if (parentName !== "Szene" && this.objects[parentName]) {
            this.objects[parentName].add(obj);
        } else {
            this.scene.add(obj);
        }

        this.objects[name] = obj;
        this.updateExplorer();
    },

    transform: function(name, axis, value) {
        if (this.objects[name]) this.objects[name].position[axis] = value;
    },

    setScale: function(name, value) {
        if (this.objects[name]) this.objects[name].scale.set(value, value, value);
    },

    addRotation: function(name, axis, speed) {
        if (this.objects[name]) {
            this.objects[name].userData.animations.push(() => {
                this.objects[name].rotation[axis] += speed;
            });
        }
    },

    updateExplorer: function() {
        const list = document.getElementById('sceneList');
        if (!list) return;
        list.innerHTML = '';
        this.buildTree(this.scene, list, 0);
    },

    buildTree: function(parent, container, depth) {
        parent.children.forEach(child => {
            if (this.objects[child.name]) {
                const item = document.createElement('div');
                item.className = 'explorer-item';
                item.style.paddingLeft = (depth * 15) + "px";
                const icon = child.userData.type === 'group' ? '📁' : '📦';
                item.innerHTML = `${icon} ${child.name}`;
                container.appendChild(item);
                if (child.children.length > 0) this.buildTree(child, container, depth + 1);
            }
        });
    },

    animate: function() {
        requestAnimationFrame(() => this.animate());
        for (let key in this.objects) {
            const obj = this.objects[key];
            if (obj.userData.animations) obj.userData.animations.forEach(fn => fn());
        }
        if(this.controls) this.controls.update();
        this.renderer.render(this.scene, this.camera);
    },

    run: function() {
        this.stop();
        const code = Blockly.JavaScript.workspaceToCode(window.workspace);
        try { eval(code); } catch(e) { console.error(e); }
    },

    stop: function() {
        for (let id in this.objects) {
            const obj = this.objects[id];
            if(obj.parent) obj.parent.remove(obj);
        }
        this.objects = {};
        this.updateExplorer();
    }
};
window.addEventListener('load', () => App.init());
