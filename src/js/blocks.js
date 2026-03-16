const javascriptGenerator = Blockly.JavaScript;

// --- BLOCK DEFINITIONEN ---

Blockly.Blocks['event_flag'] = {
    init: function() {
        this.appendDummyInput().appendField("Wenn 🚩 angeklickt");
        this.setNextStatement(true);
        this.setColour(60);
    }
};

Blockly.Blocks['create_shape'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Erstelle")
            .appendField(new Blockly.FieldDropdown([["Würfel","box"], ["Kugel","sphere"]]), "TYPE")
            .appendField("Name:")
            .appendField(new Blockly.FieldTextInput("obj1"), "NAME");
        this.appendValueInput("COL").setCheck("Colour").appendField("Farbe:");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(210);
    }
};

Blockly.Blocks['set_position'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Setze")
            .appendField(new Blockly.FieldTextInput("obj1"), "NAME")
            .appendField(new Blockly.FieldDropdown([["X","x"], ["Y","y"], ["Z","z"]]), "AXIS")
            .appendField("auf");
        this.appendValueInput("VAL").setCheck("Number");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(160);
    }
};

Blockly.Blocks['rotate_forever'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Drehe")
            .appendField(new Blockly.FieldTextInput("obj1"), "NAME")
            .appendField("fortlaufend um")
            .appendField(new Blockly.FieldDropdown([["X","x"], ["Y","y"], ["Z","z"]]), "AXIS");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(160);
    }
};

Blockly.Blocks['colour_picker_custom'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([
                ["Rot", "#ff0000"], ["Grün", "#00ff00"], ["Blau", "#0000ff"], 
                ["Gelb", "#ffff00"], ["Weiß", "#ffffff"]
            ]), "COL");
        this.setOutput(true, "Colour");
        this.setColour(20);
    }
};

// --- GENERATOREN ---

javascriptGenerator.forBlock['event_flag'] = () => "";

javascriptGenerator.forBlock['create_shape'] = function(block, generator) {
    const type = block.getFieldValue('TYPE');
    const name = block.getFieldValue('NAME');
    const color = generator.valueToCode(block, 'COL', javascriptGenerator.ORDER_ATOMIC) || "'#ffffff'";
    return `window.App.spawn('${type}', ${color}, '${name}');\n`;
};

javascriptGenerator.forBlock['set_position'] = function(block, generator) {
    const name = block.getFieldValue('NAME');
    const axis = block.getFieldValue('AXIS');
    const val = generator.valueToCode(block, 'VAL', javascriptGenerator.ORDER_ATOMIC) || "0";
    return `window.App.transform('${name}', '${axis}', ${val});\n`;
};

javascriptGenerator.forBlock['rotate_forever'] = function(block, generator) {
    const name = block.getFieldValue('NAME');
    const axis = block.getFieldValue('AXIS');
    return `window.App.addRotation('${name}', '${axis}', 0.02);\n`;
};

javascriptGenerator.forBlock['colour_picker_custom'] = function(block, generator) {
    return [generator.quote_(block.getFieldValue('COL')), javascriptGenerator.ORDER_ATOMIC];
};

// INITIALISIERUNG
window.addEventListener('load', () => {
    window.workspace = Blockly.inject('blocklyArea', {
        toolbox: document.getElementById('toolbox'),
        grid: {spacing: 20, length: 3, colour: '#333', snap: true}
    });
});
