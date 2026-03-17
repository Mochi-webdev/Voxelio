const javascriptGenerator = Blockly.JavaScript;

// --- DEFINITIONEN ---
Blockly.Blocks['event_flag'] = {
    init: function() {
        this.appendDummyInput().appendField("Wenn 🚩 angeklickt");
        this.setNextStatement(true);
        this.setColour(60);
    }
};

Blockly.Blocks['create_group'] = {
    init: function() {
        this.appendDummyInput().appendField("Erstelle Gruppe Name:").appendField(new Blockly.FieldTextInput("ordner1"), "NAME");
        this.setPreviousStatement(true); this.setNextStatement(true);
        this.setColour(260);
    }
};

Blockly.Blocks['create_shape'] = {
    init: function() {
        this.appendDummyInput().appendField("Erstelle")
            .appendField(new Blockly.FieldDropdown([
                ["Würfel", "box"], ["Kugel", "sphere"], ["Torus", "torus"],
                ["Zylinder", "cylinder"], ["Kegel", "cone"], ["Ring", "ring"]
            ]), "TYPE")
            .appendField("Name:").appendField(new Blockly.FieldTextInput("obj1"), "NAME")
            .appendField("in:").appendField(new Blockly.FieldTextInput("Szene"), "PARENT");
        this.appendValueInput("COL").setCheck("Colour").appendField("Farbe:");
        this.setPreviousStatement(true); this.setNextStatement(true);
        this.setColour(210);
    }
};

Blockly.Blocks['set_position'] = {
    init: function() {
        this.appendDummyInput().appendField("Setze").appendField(new Blockly.FieldTextInput("obj1"), "NAME")
            .appendField(new Blockly.FieldDropdown([["X","x"], ["Y","y"], ["Z","z"]]), "AXIS").appendField("auf");
        this.appendValueInput("VAL").setCheck("Number");
        this.setPreviousStatement(true); this.setNextStatement(true);
        this.setColour(160);
    }
};

Blockly.Blocks['set_scale'] = {
    init: function() {
        this.appendDummyInput().appendField("Größe von").appendField(new Blockly.FieldTextInput("obj1"), "NAME").appendField("auf:");
        this.appendValueInput("VAL").setCheck("Number");
        this.setPreviousStatement(true); this.setNextStatement(true);
        this.setColour(160);
    }
};

Blockly.Blocks['rotate_forever'] = {
    init: function() {
        this.appendDummyInput().appendField("Drehe").appendField(new Blockly.FieldTextInput("obj1"), "NAME")
            .appendField("fortlaufend Achse:").appendField(new Blockly.FieldDropdown([["X","x"], ["Y","y"], ["Z","z"]]), "AXIS");
        this.setPreviousStatement(true); this.setNextStatement(true);
        this.setColour(160);
    }
};

Blockly.Blocks['colour_picker_custom'] = {
    init: function() {
        this.appendDummyInput().appendField(new Blockly.FieldDropdown([
            ["Rot", "#ff0000"], ["Grün", "#00ff00"], ["Blau", "#0000ff"], ["Gelb", "#ffff00"], ["Weiß", "#ffffff"]
        ]), "COL");
        this.setOutput(true, "Colour"); this.setColour(20);
    }
};

// --- GENERATOREN ---
javascriptGenerator.forBlock['event_flag'] = () => "";
javascriptGenerator.forBlock['create_group'] = block => `window.App.spawn('group', '#ffffff', '${block.getFieldValue('NAME')}');\n`;
javascriptGenerator.forBlock['create_shape'] = function(block, gen) {
    const col = gen.valueToCode(block, 'COL', javascriptGenerator.ORDER_ATOMIC) || "'#ffffff'";
    return `window.App.spawn('${block.getFieldValue('TYPE')}', ${col}, '${block.getFieldValue('NAME')}', '${block.getFieldValue('PARENT')}');\n`;
};
javascriptGenerator.forBlock['set_position'] = function(block, gen) {
    const val = gen.valueToCode(block, 'VAL', javascriptGenerator.ORDER_ATOMIC) || "0";
    return `window.App.transform('${block.getFieldValue('NAME')}', '${block.getFieldValue('AXIS')}', ${val});\n`;
};
javascriptGenerator.forBlock['set_scale'] = function(block, gen) {
    const val = gen.valueToCode(block, 'VAL', javascriptGenerator.ORDER_ATOMIC) || "1";
    return `window.App.setScale('${block.getFieldValue('NAME')}', ${val});\n`;
};
javascriptGenerator.forBlock['rotate_forever'] = block => `window.App.addRotation('${block.getFieldValue('NAME')}', '${block.getFieldValue('AXIS')}', 0.02);\n`;
javascriptGenerator.forBlock['colour_picker_custom'] = (block, gen) => [gen.quote_(block.getFieldValue('COL')), javascriptGenerator.ORDER_ATOMIC];

window.addEventListener('load', () => {
    window.workspace = Blockly.inject('blocklyArea', {
        toolbox: document.getElementById('toolbox'),
        grid: {spacing: 20, length: 3, colour: '#333', snap: true}
    });
});
