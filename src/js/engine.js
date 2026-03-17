const javascriptGenerator = Blockly.JavaScript;

Blockly.Blocks['event_flag'] = { init: function() { this.appendDummyInput().appendField("Wenn 🚩 angeklickt"); this.setNextStatement(true); this.setColour(60); } };
Blockly.Blocks['event_key'] = { init: function() { this.appendDummyInput().appendField("Wenn Taste").appendField(new Blockly.FieldDropdown([["w","w"],["a","a"],["s","s"],["d","d"],["Leertaste"," "],["Pfeil Oben","ArrowUp"],["Pfeil Unten","ArrowDown"]]), "KEY").appendField("gedrückt wird"); this.setNextStatement(true); this.setColour(60); } };
Blockly.Blocks['create_group'] = { init: function() { this.appendDummyInput().appendField("Gruppe:").appendField(new Blockly.FieldTextInput("ordner1"), "NAME"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(260); } };
Blockly.Blocks['create_shape'] = { init: function() { this.appendDummyInput().appendField("Erstelle").appendField(new Blockly.FieldDropdown([["Würfel","box"],["Kugel","sphere"],["Torus","torus"],["Zylinder","cylinder"]]), "TYPE").appendField("Name:").appendField(new Blockly.FieldTextInput("obj1"), "NAME").appendField("in:").appendField(new Blockly.FieldTextInput("Szene"), "PARENT"); this.appendValueInput("COL").setCheck("Colour").appendField("Farbe:"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(210); } };
Blockly.Blocks['set_position'] = { init: function() { this.appendDummyInput().appendField("Setze").appendField(new Blockly.FieldTextInput("obj1"), "NAME").appendField(new Blockly.FieldDropdown([["X","x"],["Y","y"],["Z","z"]]), "AXIS").appendField("auf"); this.appendValueInput("VAL").setCheck("Number"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(160); } };
Blockly.Blocks['move_object'] = { init: function() { this.appendDummyInput().appendField("Bewege").appendField(new Blockly.FieldTextInput("obj1"), "NAME").appendField(new Blockly.FieldDropdown([["X","x"],["Y","y"],["Z","z"]]), "AXIS").appendField("um"); this.appendValueInput("VAL").setCheck("Number"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(160); } };
Blockly.Blocks['set_scale'] = { init: function() { this.appendDummyInput().appendField("Größe von").appendField(new Blockly.FieldTextInput("obj1"), "NAME").appendField("auf:"); this.appendValueInput("VAL").setCheck("Number"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(160); } };
Blockly.Blocks['rotate_forever'] = { init: function() { this.appendDummyInput().appendField("Drehe").appendField(new Blockly.FieldTextInput("obj1"), "NAME").appendField("fortlaufend Achse:").appendField(new Blockly.FieldDropdown([["X","x"],["Y","y"],["Z","z"]]), "AXIS"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(160); } };
Blockly.Blocks['colour_picker_custom'] = { init: function() { this.appendDummyInput().appendField(new Blockly.FieldDropdown([["Rot","#ff0000"],["Grün","#00ff00"],["Blau","#0000ff"],["Gelb","#ffff00"],["Weiß","#ffffff"]]), "COL"); this.setOutput(true, "Colour"); this.setColour(20); } };

const isConnected = (b) => { let r = b.getRootBlock(); return r.type === 'event_flag' || r.type === 'event_key'; };
const wrap = (fn) => function(b, g) { if (!isConnected(b)) return ""; return fn(b, g); };

javascriptGenerator.forBlock['event_flag'] = (b, g) => { let n = b.getNextBlock(); return n ? g.blockToCode(n) : ""; };
javascriptGenerator.forBlock['event_key'] = (b, g) => { let k = b.getFieldValue('KEY'), n = b.getNextBlock(); return `App.registerKeyEvent('${k}', () => {\n${n ? g.blockToCode(n) : ""}});\n`; };
javascriptGenerator.forBlock['create_group'] = wrap(b => `App.spawn('group', '#ffffff', '${b.getFieldValue('NAME')}');\n`);
javascriptGenerator.forBlock['create_shape'] = wrap((b, g) => `App.spawn('${b.getFieldValue('TYPE')}', ${g.valueToCode(b, 'COL', 0) || "'#ffffff'"}, '${b.getFieldValue('NAME')}', '${b.getFieldValue('PARENT')}');\n`);
javascriptGenerator.forBlock['set_position'] = wrap((b, g) => `App.transform('${b.getFieldValue('NAME')}', '${b.getFieldValue('AXIS')}', ${g.valueToCode(b, 'VAL', 0) || 0});\n`);
javascriptGenerator.forBlock['move_object'] = wrap((b, g) => `App.move('${b.getFieldValue('NAME')}', '${b.getFieldValue('AXIS')}', ${g.valueToCode(b, 'VAL', 0) || 0});\n`);
javascriptGenerator.forBlock['set_scale'] = wrap((b, g) => `App.setScale('${b.getFieldValue('NAME')}', ${g.valueToCode(b, 'VAL', 0) || 1});\n`);
javascriptGenerator.forBlock['rotate_forever'] = wrap(b => `App.addRotation('${b.getFieldValue('NAME')}', '${b.getFieldValue('AXIS')}', 0.02);\n`);
javascriptGenerator.forBlock['colour_picker_custom'] = (b, g) => [g.quote_(b.getFieldValue('COL')), 0];

window.Editor = {
    scripts: { "Main": null },
    currentScript: "Main",
    init() {
        window.workspace = Blockly.inject('blocklyArea', { toolbox: document.getElementById('toolbox'), grid: {spacing: 25, length: 3, colour: '#222', snap: true} });
        this.renderList();
        this.initResizer();
    },
    showModal() { document.getElementById('nameModal').style.display = 'flex'; document.getElementById('scriptNameInput').focus(); },
    hideModal() { document.getElementById('nameModal').style.display = 'none'; document.getElementById('scriptNameInput').value = ''; },
    createScript() {
        let n = document.getElementById('scriptNameInput').value.trim();
        if (n && !this.scripts[n]) { this.scripts[n] = null; this.hideModal(); this.switchScript(n); }
    },
    switchScript(n) {
        this.scripts[this.currentScript] = Blockly.serialization.workspaces.save(window.workspace);
        this.currentScript = n;
        window.workspace.clear();
        if (this.scripts[n]) Blockly.serialization.workspaces.load(this.scripts[n], window.workspace);
        this.renderList();
    },
    renderList() {
        let c = document.getElementById('scriptList');
        c.innerHTML = '';
        Object.keys(this.scripts).forEach(s => {
            let d = document.createElement('div');
            d.className = `script-item ${s === this.currentScript ? 'active' : ''}`;
            d.innerHTML = `📄 ${s}`;
            d.onclick = () => this.switchScript(s);
            c.appendChild(d);
        });
    },
    initResizer() {
        let r = document.getElementById('resizer'), s = document.getElementById('sidePanel'), active = false;
        r.onmousedown = () => active = true;
        window.onmousemove = (e) => { if (active) { let w = window.innerWidth - e.clientX; if (w > 200 && w < 800) { s.style.width = w + 'px'; Blockly.svgResize(window.workspace); App.onResize(); } } };
        window.onmouseup = () => active = false;
    },
    getAllCode() {
        this.scripts[this.currentScript] = Blockly.serialization.workspaces.save(window.workspace);
        let code = "", t = new Blockly.Workspace();
        Object.values(this.scripts).forEach(d => { if(d) { Blockly.serialization.workspaces.load(d, t); code += javascriptGenerator.workspaceToCode(t) + "\n"; t.clear(); } });
        t.dispose();
        return code;
    }
};
window.onload = () => Editor.init();
