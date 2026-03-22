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
Blockly.Blocks['set_light_intensity'] = {init: function() {this.appendDummyInput().appendField("Setze Lichtintensität auf"); this.appendValueInput("VALUE").setCheck("Number"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(160); } };
Blockly.Blocks['setup_fpc'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Setup FPC: Spieler")
        .appendField(new Blockly.FieldTextInput("player"), "NAME");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(290);
  }
};
Blockly.Blocks['fpc_look'] = {
  init: function() {
    this.appendDummyInput().appendField("Kamera mit Maus drehen");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(290);
  }
};
Blockly.Blocks['fpc_move'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Bewege relativ zu Blickrichtung:")
        .appendField(new Blockly.FieldDropdown([["Vorwärts","forward"], ["Rückwärts","backward"], ["Links","left"], ["Rechts","right"]]), "DIR");
    this.appendValueInput("SPEED").setCheck("Number").appendField("Speed");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(290);
  }
};
Blockly.Blocks['event_tick'] = {
  init: function() {
    this.appendDummyInput().appendField("Per Tick");
    this.setNextStatement(true);
    this.setColour(60);
  }
};
Blockly.Blocks['set_view_mode'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Sichtmodus auf")
        .appendField(new Blockly.FieldDropdown([["First Person", "fp"], ["Third Person", "tp"]]), "MODE");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(290);
  }
};
Blockly.Blocks['set_solid'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Setze")
        .appendField(new Blockly.FieldTextInput("obj1"), "NAME")
        .appendField("als Festes Objekt:")
        .appendField(new Blockly.FieldCheckbox("TRUE"), "SOLID");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(290);
  }
};
Blockly.Blocks['set_dimensions'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Setze")
        .appendField(new Blockly.FieldTextInput("obj1"), "NAME")
        .appendField(new Blockly.FieldDropdown([
            ["Breite (X)", "x"], 
            ["Höhe (Y)", "y"], 
            ["Tiefe (Z)", "z"]
        ]), "AXIS")
        .appendField("auf");
    this.appendValueInput("VALUE")
        .setCheck("Number");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(160);
  }
};
Blockly.Blocks['set_rotation'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Setze Rotation von")
        .appendField(new Blockly.FieldTextInput("obj1"), "NAME")
        .appendField(new Blockly.FieldDropdown([["X", "x"], ["Y", "y"], ["Z", "z"]]), "AXIS")
        .appendField("auf");
    this.appendValueInput("DEGREE")
        .setCheck("Number");
    this.appendDummyInput()
        .appendField("Grad");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(160);
  }
};
Blockly.Blocks['set_texture'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Setze Textur von")
        .appendField(new Blockly.FieldTextInput("obj1"), "NAME")
        .appendField("auf")
        // Hier kommt das dynamische Dropdown
        .appendField(new Blockly.FieldDropdown(() => this.getOptions()), "TEX");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(160);
  },
  
  // Diese Funktion wird jedes Mal aufgerufen, wenn man das Dropdown öffnet
  getOptions: function() {
    let options = [];
    const savedTextures = Object.keys(App.textures);
    
    if (savedTextures.length > 0) {
        savedTextures.forEach(name => {
            options.push([name, name]);
        });
    } else {
        options.push(["(Keine Texturen)", "none"]);
    }
    return options;
  }
};

const isConnected = (b) => { 
    let r = b.getRootBlock(); 
    // Ein Block ist nur gültig, wenn sein oberster Block ein Event-Block ist
    return ["event_flag", "event_key", "event_object_click", "event_tick"].includes(r.type); 
};

// Wir überschreiben die Standard-Generierung für JEDEN Block
const wrap = (fn) => function(b, g) { 
    if (!isConnected(b)) return ""; 
    return fn(b, g); 
};

javascriptGenerator.forBlock['event_flag'] = (b, g) => { let n = b.getNextBlock(); return n ? g.blockToCode(n) : ""; };
javascriptGenerator.forBlock['event_key'] = (b, g) => { let k = b.getFieldValue('KEY'), n = b.getNextBlock(); return `App.registerKeyEvent('${k}', () => {\n${n ? g.blockToCode(n) : ""}});\n`; };
javascriptGenerator.forBlock['create_group'] = wrap(b => `App.spawn('group', '#ffffff', '${b.getFieldValue('NAME')}');\n`);
javascriptGenerator.forBlock['create_shape'] = wrap((b, g) => `App.spawn('${b.getFieldValue('TYPE')}', ${g.valueToCode(b, 'COL', 0) || "'#ffffff'"}, '${b.getFieldValue('NAME')}', '${b.getFieldValue('PARENT')}');\n`);
javascriptGenerator.forBlock['set_position'] = wrap((b, g) => `App.transform('${b.getFieldValue('NAME')}', '${b.getFieldValue('AXIS')}', ${g.valueToCode(b, 'VAL', 0) || 0});\n`);
javascriptGenerator.forBlock['move_object'] = wrap((b, g) => `App.move('${b.getFieldValue('NAME')}', '${b.getFieldValue('AXIS')}', ${g.valueToCode(b, 'VAL', 0) || 0});\n`);
javascriptGenerator.forBlock['set_scale'] = wrap((b, g) => `App.setScale('${b.getFieldValue('NAME')}', ${g.valueToCode(b, 'VAL', 0) || 1});\n`);
javascriptGenerator.forBlock['rotate_forever'] = wrap(b => `App.addRotation('${b.getFieldValue('NAME')}', '${b.getFieldValue('AXIS')}', 0.02);\n`);
javascriptGenerator.forBlock['colour_picker_custom'] = (b, g) => [g.quote_(b.getFieldValue('COL')), 0];
javascriptGenerator.forBlock['set_light_intensity'] = (block, generator) => {
  const value = generator.valueToCode(block, 'VALUE', 0) || "1.0";
  return `App.setLightIntensity(${value});\n`;
};
javascriptGenerator.forBlock['setup_fpc'] = (b) => `App.setupFPC('${b.getFieldValue('NAME')}');\n`;
javascriptGenerator.forBlock['fpc_look'] = () => `App.updateFPCLook();\n`;
javascriptGenerator.forBlock['fpc_move'] = (b, g) => {
  const dir = b.getFieldValue('DIR');
  const speed = g.valueToCode(b, 'SPEED', 0) || "0.1";
  return `App.moveFPC('${dir}', ${speed});\n`;
};
javascriptGenerator.forBlock['event_tick'] = (b, g) => {
   
    return `App.onTick(() => {\n${b.getNextBlock() ? g.blockToCode(b.getNextBlock()) : ""}});\n`;
};

javascriptGenerator.forBlock['set_view_mode'] = (b) => {
  return `App.setViewMode('${b.getFieldValue('MODE')}');\n`;
};
javascriptGenerator.forBlock['set_solid'] = (b) => {
  const name = b.getFieldValue('NAME');
  const isSolid = b.getFieldValue('SOLID') === 'TRUE';
  return `App.setSolid('${name}', ${isSolid});\n`;
};
javascriptGenerator.forBlock['set_dimensions'] = wrap((b, g) => {
  const name = b.getFieldValue('NAME');
  const axis = b.getFieldValue('AXIS');
  const val = g.valueToCode(b, 'VALUE', 0) || "1";
  return `App.setDimension('${name}', '${axis}', ${val});\n`;
});
javascriptGenerator.forBlock['set_rotation'] = wrap((b, g) => {
  const name = b.getFieldValue('NAME');
  const axis = b.getFieldValue('AXIS');
  const degree = g.valueToCode(b, 'DEGREE', 0) || "0";
  // Convert Degrees to Radians: (degree * Math.PI / 180)
  return `App.setRotation('${name}', '${axis}', ${degree});\n`;
});
javascriptGenerator.forBlock['set_texture'] = wrap((b) => {
  const tex = b.getFieldValue('TEX');
  if (tex === "none") return "";
  return `App.applyTexture('${b.getFieldValue('NAME')}', '${tex}');\n`;
});

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
    // 1. Aktuellen Workspace im Speicher sichern
    this.scripts[this.currentScript] = Blockly.serialization.workspaces.save(window.workspace);
    
    let fullCode = "";
    let tempWorkspace = new Blockly.Workspace();
    
    Object.values(this.scripts).forEach(saveData => {
        if (saveData) {
            tempWorkspace.clear();
            Blockly.serialization.workspaces.load(saveData, tempWorkspace);
            
            // Hole alle "Top-Blöcke" (Blöcke ohne Vorgänger)
            const topBlocks = tempWorkspace.getTopBlocks(false);
            
            topBlocks.forEach(block => {
                // NUR wenn der Top-Block ein Event-Typ ist, generieren wir Code dafür
                if (["event_flag", "event_key", "event_object_click", "event_tick"].includes(block.type)) {
                    fullCode += javascriptGenerator.blockToCode(block) + "\n";
                }
            });
        }
    });
    
    tempWorkspace.dispose();
    return fullCode;
}
};
window.onload = () => Editor.init();
