const javascriptGenerator = Blockly.JavaScript;

// --- EVENT BLOCKS ---
Blockly.Blocks['event_flag'] = { init: function () { this.appendDummyInput().appendField("Wenn 🚩 angeklickt"); this.setNextStatement(true); this.setColour(60); } };
Blockly.Blocks['event_key'] = { init: function () { this.appendDummyInput().appendField("Wenn Taste").appendField(new Blockly.FieldDropdown([["w", "w"], ["a", "a"], ["s", "s"], ["d", "d"], ["Leertaste", " "], ["Pfeil Oben", "ArrowUp"], ["Pfeil Unten", "ArrowDown"]]), "KEY").appendField("gedrückt wird"); this.setNextStatement(true); this.setColour(60); } };
Blockly.Blocks['event_tick'] = { init: function () { this.appendDummyInput().appendField("Per Tick"); this.setNextStatement(true); this.setColour(60); } };

// --- 3D SHAPES & TRANSFORM ---
Blockly.Blocks['create_group'] = { init: function () { this.appendDummyInput().appendField("Gruppe:").appendField(new Blockly.FieldTextInput("ordner1"), "NAME"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(260); } };
Blockly.Blocks['create_shape'] = { init: function () { this.appendDummyInput().appendField("Erstelle").appendField(new Blockly.FieldDropdown([["Würfel", "box"], ["Kugel", "sphere"], ["Torus", "torus"], ["Zylinder", "cylinder"]]), "TYPE").appendField("Name:").appendField(new Blockly.FieldTextInput("obj1"), "NAME").appendField("in:").appendField(new Blockly.FieldTextInput("Szene"), "PARENT"); this.appendValueInput("COL").setCheck("Colour").appendField("Farbe:"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(210); } };
Blockly.Blocks['set_position'] = { init: function () { this.appendDummyInput().appendField("Setze").appendField(new Blockly.FieldTextInput("obj1"), "NAME").appendField(new Blockly.FieldDropdown([["X", "x"], ["Y", "y"], ["Z", "z"]]), "AXIS").appendField("auf"); this.appendValueInput("VAL").setCheck("Number"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(160); } };
Blockly.Blocks['move_object'] = { init: function () { this.appendDummyInput().appendField("Bewege").appendField(new Blockly.FieldTextInput("obj1"), "NAME").appendField(new Blockly.FieldDropdown([["X", "x"], ["Y", "y"], ["Z", "z"]]), "AXIS").appendField("um"); this.appendValueInput("VAL").setCheck("Number"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(160); } };
Blockly.Blocks['set_scale'] = { init: function () { this.appendDummyInput().appendField("Größe von").appendField(new Blockly.FieldTextInput("obj1"), "NAME").appendField("auf:"); this.appendValueInput("VAL").setCheck("Number"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(160); } };
Blockly.Blocks['rotate_forever'] = { init: function () { this.appendDummyInput().appendField("Drehe").appendField(new Blockly.FieldTextInput("obj1"), "NAME").appendField("fortlaufend Achse:").appendField(new Blockly.FieldDropdown([["X", "x"], ["Y", "y"], ["Z", "z"]]), "AXIS"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(160); } };
Blockly.Blocks['set_dimensions'] = { init: function () { this.appendDummyInput().appendField("Setze").appendField(new Blockly.FieldTextInput("obj1"), "NAME").appendField(new Blockly.FieldDropdown([["Breite (X)", "x"], ["Höhe (Y)", "y"], ["Tiefe (Z)", "z"]]), "AXIS").appendField("auf"); this.appendValueInput("VALUE").setCheck("Number"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(160); } };
Blockly.Blocks['set_rotation'] = { init: function () { this.appendDummyInput().appendField("Setze Rotation von").appendField(new Blockly.FieldTextInput("obj1"), "NAME").appendField(new Blockly.FieldDropdown([["X", "x"], ["Y", "y"], ["Z", "z"]]), "AXIS").appendField("auf"); this.appendValueInput("DEGREE").setCheck("Number"); this.appendDummyInput().appendField("Grad"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(160); } };
Blockly.Blocks['set_texture'] = {
    init: function () {

        const dropdown = new Blockly.FieldDropdown(() => this.getOptions());

        this.appendDummyInput()
            .appendField("Setze Textur von")
            .appendField(new Blockly.FieldTextInput("obj1"), "NAME")
            .appendField("auf")
            .appendField(dropdown, "TEX");

        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(160);
    },
    getOptions: function () {
        let options = [];

        const savedTextures = Object.keys((window.App && window.App.textures) ? window.App.textures : {});

        if (savedTextures.length > 0) {
            savedTextures.forEach(name => options.push([name, name]));
        } else {
            options.push(["(Keine Texturen)", "none"]);
        }
        return options;
    }
};

// --- CONTROLS & PHYSICS ---
Blockly.Blocks['setup_fpc'] = { init: function () { this.appendDummyInput().appendField("Setup FPC: Spieler").appendField(new Blockly.FieldTextInput("player"), "NAME"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(290); } };
Blockly.Blocks['fpc_look'] = { init: function () { this.appendDummyInput().appendField("Kamera mit Maus drehen"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(290); } };
Blockly.Blocks['fpc_move'] = { init: function () { this.appendDummyInput().appendField("Bewege relativ zu Blickrichtung:").appendField(new Blockly.FieldDropdown([["Vorwärts", "forward"], ["Rückwärts", "backward"], ["Links", "left"], ["Rechts", "right"]]), "DIR"); this.appendValueInput("SPEED").setCheck("Number").appendField("Speed"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(290); } };
Blockly.Blocks['set_view_mode'] = { init: function () { this.appendDummyInput().appendField("Sichtmodus auf").appendField(new Blockly.FieldDropdown([["First Person", "fp"], ["Third Person", "tp"]]), "MODE"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(290); } };
Blockly.Blocks['set_solid'] = { init: function () { this.appendDummyInput().appendField("Setze").appendField(new Blockly.FieldTextInput("obj1"), "NAME").appendField("als Festes Objekt:").appendField(new Blockly.FieldCheckbox("TRUE"), "SOLID"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(290); } };

// --- LOGIC & VARIABLES ---
Blockly.Blocks['logic_if'] = { init: function () { this.appendValueInput("CONDITION").setCheck("Boolean").appendField("wenn"); this.appendStatementInput("DO").appendField("mache"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(210); } };
Blockly.Blocks['logic_if_else'] = { init: function () { this.appendValueInput("CONDITION").setCheck("Boolean").appendField("wenn"); this.appendStatementInput("DO").appendField("mache"); this.appendStatementInput("ELSE").appendField("ansonsten"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(210); } };
Blockly.Blocks['logic_compare'] = { init: function () { this.appendValueInput("A"); this.appendDummyInput().appendField(new Blockly.FieldDropdown([["=", "EQ"], ["<", "LT"], [">", "GT"], ["≠", "NEQ"]]), "OP"); this.appendValueInput("B"); this.setInputsInline(true); this.setOutput(true, "Boolean"); this.setColour(210); } };
Blockly.Blocks['logic_boolean'] = { init: function () { this.appendDummyInput().appendField(new Blockly.FieldDropdown([["wahr", "TRUE"], ["falsch", "FALSE"]]), "BOOL"); this.setOutput(true, "Boolean"); this.setColour(210); } };
Blockly.Blocks['is_touching'] = { init: function () { this.appendDummyInput().appendField("Objekt").appendField(new Blockly.FieldTextInput("obj1"), "A").appendField("berührt").appendField(new Blockly.FieldTextInput("obj2"), "B"); this.setOutput(true, "Boolean"); this.setColour(210); } };
Blockly.Blocks['check_color'] = { init: function () { this.appendDummyInput().appendField("Farbe von").appendField(new Blockly.FieldTextInput("obj1"), "NAME"); this.setOutput(true, "Colour"); this.setColour(210); } };

Blockly.Blocks['init_var'] = { init: function () { this.appendValueInput("VALUE").appendField("Erstelle Variable").appendField(new Blockly.FieldTextInput("name"), "VAR").appendField("Startwert"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(330); } };
Blockly.Blocks['set_var'] = { init: function () { this.appendValueInput("VALUE").appendField("Setze Variable").appendField(new Blockly.FieldTextInput("meineZahl"), "VAR").appendField("auf"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(330); } };
Blockly.Blocks['get_var'] = { init: function () { this.appendDummyInput().appendField("Variable").appendField(new Blockly.FieldTextInput("meineZahl"), "VAR"); this.setOutput(true, null); this.setColour(330); } };
Blockly.Blocks['change_var'] = { init: function () { this.appendValueInput("VALUE").appendField("Ändere Variable").appendField(new Blockly.FieldTextInput("punkte"), "VAR").appendField("um"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(330); } };
Blockly.Blocks['display_var'] = { init: function () { this.appendDummyInput().appendField("Zeige Variable").appendField(new Blockly.FieldTextInput("punkte"), "VAR").appendField("mit Text").appendField(new Blockly.FieldTextInput("Score"), "LABEL"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(330); } };

// --- USER INTERFACE (UI) ---
Blockly.Blocks['create_ui'] = {
    init: function () {
        this.appendDummyInput().appendField("Erstelle UI").appendField(new Blockly.FieldDropdown([["Button", "button"], ["Frame", "frame"], ["Scrolling Frame", "scrolling_frame"]]), "TYPE").appendField("ID").appendField(new Blockly.FieldTextInput("meinUI"), "ID");
        this.appendDummyInput().appendField("Position X").appendField(new Blockly.FieldNumber(0), "X").appendField("Y").appendField(new Blockly.FieldNumber(0), "Y");
        this.appendDummyInput().appendField("Breite").appendField(new Blockly.FieldNumber(100), "W").appendField("Höhe").appendField(new Blockly.FieldNumber(50), "H");
        this.appendDummyInput().appendField("Text").appendField(new Blockly.FieldTextInput("Klick mich"), "TEXT").appendField("Textur").appendField(new Blockly.FieldDropdown(() => this.getTexOptions()), "TEX");
        this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(260);
    },
    getTexOptions: function () { let options = [["Keine", "none"]]; Object.keys(App.textures).forEach(n => options.push([n, n])); return options; }
};

Blockly.Blocks['ui_button_pressed'] = { init: function () { this.appendDummyInput().appendField("Button").appendField(new Blockly.FieldTextInput("meinUI"), "ID").appendField("gedrückt?"); this.setOutput(true, "Boolean"); this.setColour(210); } };
Blockly.Blocks['remove_ui'] = { init: function () { this.appendDummyInput().appendField("Lösche UI Element mit ID").appendField(new Blockly.FieldTextInput("meinUI"), "ID"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(260); } };
Blockly.Blocks['set_ui_parent'] = { init: function () { this.appendDummyInput().appendField("Setze UI").appendField(new Blockly.FieldTextInput("kindID"), "CHILD").appendField("in Frame").appendField(new Blockly.FieldTextInput("parentID"), "PARENT"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(260); } };
Blockly.Blocks['set_ui_text'] = { init: function () { this.appendValueInput("TEXT").setCheck(null).appendField("Setze Text von UI").appendField(new Blockly.FieldTextInput("meinUI"), "ID").appendField("auf"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(260); } };

Blockly.Blocks['style_ui'] = {
    init: function () {

        const createColorField = (defaultColor) => {
            if (Blockly.fieldColour && Blockly.fieldColour.FieldColour) {
                return new Blockly.fieldColour.FieldColour(defaultColor);
            } else if (Blockly.FieldColor) {
                return new Blockly.FieldColor(defaultColor);
            } else if (Blockly.FieldColour) {
                return new Blockly.FieldColour(defaultColor);
            } else {

                return new Blockly.FieldTextInput(defaultColor);
            }
        };

        this.appendDummyInput()
            .appendField("Style UI ID")
            .appendField(new Blockly.FieldTextInput("meinUI"), "ID");
        this.appendDummyInput()
            .appendField("  Eckenradius")
            .appendField(new Blockly.FieldNumber(10, 0), "RADIUS")
            .appendField("px");
        this.appendDummyInput()
            .appendField("  Hintergrund")
            .appendField(createColorField("#444444"), "BG_COLOR")
            .appendField("Sichtbarkeit")
            .appendField(new Blockly.FieldDropdown([["100%", "1"], ["75%", "0.75"], ["50%", "0.5"], ["25%", "0.25"], ["0%", "0"]]), "OPACITY");
        this.appendDummyInput()
            .appendField("  Rahmen")
            .appendField(new Blockly.FieldNumber(2, 0), "STROKE_W")
            .appendField("px Farbe")
            .appendField(createColorField("#ffffff"), "STROKE_C");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(260);
    }
};

// --- MISC & DESIGN ---
Blockly.Blocks['colour_picker_custom'] = { init: function () { this.appendDummyInput().appendField(new Blockly.FieldDropdown([["Rot", "#ff0000"], ["Grün", "#00ff00"], ["Blau", "#0000ff"], ["Gelb", "#ffff00"], ["Weiß", "#ffffff"]]), "COL"); this.setOutput(true, "Colour"); this.setColour(20); } };
Blockly.Blocks['set_light_intensity'] = { init: function () { this.appendDummyInput().appendField("Setze Lichtintensität auf"); this.appendValueInput("VALUE").setCheck("Number"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(160); } };
Blockly.Blocks['text_join_simple'] = { init: function () { this.appendValueInput("A").setCheck(null); this.appendValueInput("B").setCheck(null).appendField(" + "); this.setInputsInline(true); this.setOutput(true, "String"); this.setColour(160); } };
Blockly.Blocks['math_number'] = { init: function () { this.appendDummyInput().appendField(new Blockly.FieldNumber(0), "NUM"); this.setOutput(true, "Number"); this.setColour(230); } };
Blockly.Blocks['text'] = { init: function () { this.appendDummyInput().appendField(new Blockly.FieldTextInput(""), "TEXT"); this.setOutput(true, "String"); this.setColour(160); } };

Blockly.Blocks['ui_animate'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Animiere UI")
            .appendField(new Blockly.FieldTextInput("meinUI"), "ID")
            .appendField("mit Effekt")
            .appendField(new Blockly.FieldDropdown([
                ["Einfaden", "fade_in"],
                ["Ausfaden", "fade_out"],
                ["Pop (Klick)", "pop"],
                ["Slide Up", "slide_up"]
            ]), "EFFECT");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(260);
    }
};

Blockly.Blocks['ui_hover_style'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Hover-Effekt für")
            .appendField(new Blockly.FieldTextInput("meinUI"), "ID");
        this.appendDummyInput()
            .appendField("  Vergrößerung:")
            .appendField(new Blockly.FieldNumber(1.1, 0.5, 2), "SCALE")
            .appendField("Helligkeit:")
            .appendField(new Blockly.FieldNumber(120, 0, 300), "BRIGHT")
            .appendField("%");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(260);
    }
};
Blockly.Blocks['set_skybox_texture'] = {
  init: function() {
    this.appendValueInput("TEXTURE")
        .setCheck("String")
        .appendField("Setze Skybox Textur auf");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("Ändert den Hintergrund der Welt zu einer deiner Texturen.");
  }
};
Blockly.Blocks['set_floor_texture'] = {
  init: function() {
    this.appendValueInput("TEXTURE")
        .setCheck("String")
        .appendField("Setze Boden-Textur auf");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160); // Eine andere Farbe zur Unterscheidung
    this.setTooltip("Ändert das Aussehen des Bodens.");
  }
};
Blockly.Blocks['player_jump'] = {
  init: function() {
    this.appendValueInput("FORCE")
        .setCheck("Number")
        .appendField("Springe mit Kraft");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(259);
    this.setTooltip("Lässt den Spieler springen, wenn er auf dem Boden steht.");
  }
};
Blockly.Blocks['get_matrix_value'] = {
  init: function() {
    this.appendValueInput("MATRIX")
        .setCheck("Array")
        .appendField("Hole Wert aus Matrix");
    this.appendValueInput("ROW")
        .setCheck("Number")
        .appendField("Zeile");
    this.appendValueInput("COL")
        .setCheck("Number")
        .appendField("Spalte");
    this.setOutput(true, null);
    this.setColour(260);
    this.setTooltip("Gibt den Wert an einer bestimmten Position in der Matrix zurück.");
  }
};
Blockly.Blocks['get_random_number'] = {
  init: function() {
    this.appendValueInput("MIN")
        .setCheck("Number")
        .appendField("Zufallszahl von");
    this.appendValueInput("MAX")
        .setCheck("Number")
        .appendField("bis");
    this.setOutput(true, "Number");
    this.setColour(230);
    this.setTooltip("Generiert eine ganze Zahl zwischen Min und Max.");
    this.setHelpUrl("");
  }
};
Blockly.Blocks['clone_object'] = {
  init: function() {
    this.appendValueInput("ORIGINAL")
        .setCheck("String")
        .appendField("Klone Objekt");
    this.appendValueInput("NEWID")
        .setCheck("String")
        .appendField("mit neuer ID");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120); // Grün für "Erstellen"
    this.setTooltip("Erstellt eine exakte Kopie eines Objekts.");
  }
};
Blockly.Blocks['ui_proximity_trigger'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Zeige UI")
        .appendField(new Blockly.FieldTextInput("meinUI"), "UI_ID");
    this.appendDummyInput()
        .appendField("wenn nah an Objekt")
        .appendField(new Blockly.FieldTextInput("Schatztruhe"), "OBJ_NAME");
    this.appendValueInput("RANGE")
        .setCheck("Number")
        .appendField("Reichweite:");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(260);
    this.setTooltip("Blendet eine UI ein, wenn der Spieler nah genug am Objekt ist, sonst aus.");
  }
};
Blockly.Blocks['player_interact_with_object'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Wenn Taste")
        .appendField(new Blockly.FieldDropdown([["E", "e"], ["Q", "q"], ["F", "f"], ["Enter", "Enter"]]), "KEY")
        .appendField("gedrückt bei Objekt")
        .appendField(new Blockly.FieldTextInput("Schatztruhe"), "OBJ_NAME");
    this.appendValueInput("RANGE")
        .setCheck("Number")
        .appendField("Max. Distanz:");
    this.appendStatementInput("DO")
        .appendField("mache");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60); // Event-Farbe
  }
};
Blockly.Blocks['set_ui_visible_manual'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Setze UI")
        .appendField(new Blockly.FieldTextInput("meinUI"), "ID")
        .appendField("auf")
        .appendField(new Blockly.FieldDropdown([["sichtbar", "true"], ["unsichtbar", "false"]]), "STATE");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(260);
    this.setTooltip("Schaltet die Sichtbarkeit eines UI-Elements manuell um.");
  }
};
Blockly.Blocks['wait_seconds'] = {
  init: function() {
    // Nutze "this.appendValueInput" direkt
    this.appendValueInput("SECONDS")
        .setCheck("Number")
        .appendField("warte");
    
    // Richtig aufgerufen am Block-Objekt:
    this.appendDummyField()
        .appendField("Sekunden");

    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(260);
    this.setTooltip("Pausiert das Skript für X Sekunden.");
  }
};

// --- GENERATORS CONFIG ---
// Erkennt automatisch, ob die neue (javascriptGenerator) oder alte (Blockly.JavaScript) API genutzt wird.
const GC = window.javascriptGenerator || Blockly.JavaScript;

// Sicherheits-Check: Falls der Generator gar nicht geladen wurde, bricht das Skript hier sanft ab.
if (!GC) {
    console.error("Blockly Generator (JavaScript) wurde nicht gefunden!");
}

const isConnected = (b) => {
    let r = b.getRootBlock();
    return ["event_flag", "event_key", "event_object_click", "event_tick"].includes(r.type);
};

const wrap = (fn) => function (b, g) {
    if (!isConnected(b)) return "";
    return fn(b, g);
};

// Konstanten für die Rangfolge (Precedence) - Verhindert "undefined" Fehler
const ORDER_ATOMIC = GC.ORDER_ATOMIC || 0;
const ORDER_NONE = GC.ORDER_NONE || 0;
const ORDER_FUNCTION_CALL = GC.ORDER_FUNCTION_CALL || 0;

// --- EVENT GENERATORS ---
GC.forBlock['event_flag'] = (b, g) => { let n = b.getNextBlock(); return n ? g.blockToCode(n) : ""; };
GC.forBlock['event_key'] = (b, g) => { 
    let k = b.getFieldValue('KEY'), n = b.getNextBlock(); 
    return `App.registerKeyEvent('${k}', () => {\n${n ? g.blockToCode(n) : ""}});\n`; 
};
GC.forBlock['event_tick'] = (b, g) => { 
    return `App.onTick(() => {\n${b.getNextBlock() ? g.blockToCode(b.getNextBlock()) : ""}});\n`; 
};

// --- 3D & TRANSFORM GENERATORS ---
GC.forBlock['create_group'] = wrap(b => `App.spawn('group', '#ffffff', '${b.getFieldValue('NAME')}');\n`);
GC.forBlock['create_shape'] = wrap((b, g) => `App.spawn('${b.getFieldValue('TYPE')}', ${g.valueToCode(b, 'COL', ORDER_ATOMIC) || "'#ffffff'"}, '${b.getFieldValue('NAME')}', '${b.getFieldValue('PARENT')}');\n`);
GC.forBlock['set_position'] = wrap((b, g) => `App.transform('${b.getFieldValue('NAME')}', '${b.getFieldValue('AXIS')}', ${g.valueToCode(b, 'VAL', ORDER_ATOMIC) || 0});\n`);
GC.forBlock['move_object'] = wrap((b, g) => `App.move('${b.getFieldValue('NAME')}', '${b.getFieldValue('AXIS')}', ${g.valueToCode(b, 'VAL', ORDER_ATOMIC) || 0});\n`);
GC.forBlock['set_scale'] = wrap((b, g) => `App.setScale('${b.getFieldValue('NAME')}', ${g.valueToCode(b, 'VAL', ORDER_ATOMIC) || 1});\n`);
GC.forBlock['rotate_forever'] = wrap(b => `App.addRotation('${b.getFieldValue('NAME')}', '${b.getFieldValue('AXIS')}', 0.02);\n`);
GC.forBlock['set_dimensions'] = wrap((b, g) => `App.setDimension('${b.getFieldValue('NAME')}', '${b.getFieldValue('AXIS')}', ${g.valueToCode(b, 'VALUE', ORDER_ATOMIC) || 1});\n`);
GC.forBlock['set_rotation'] = wrap((b, g) => `App.setRotation('${b.getFieldValue('NAME')}', '${b.getFieldValue('AXIS')}', ${g.valueToCode(b, 'DEGREE', ORDER_ATOMIC) || 0});\n`);
GC.forBlock['set_texture'] = wrap((b) => { const tex = b.getFieldValue('TEX'); return tex === "none" ? "" : `App.applyTexture('${b.getFieldValue('NAME')}', '${tex}');\n`; });

// --- CONTROLS & PHYSICS GENERATORS ---
GC.forBlock['setup_fpc'] = (b) => `App.setupFPC('${b.getFieldValue('NAME')}');\n`;
GC.forBlock['fpc_look'] = () => `App.updateFPCLook();\n`;
GC.forBlock['fpc_move'] = (b, g) => `App.moveFPC('${b.getFieldValue('DIR')}', ${g.valueToCode(b, 'SPEED', ORDER_ATOMIC) || "0.1"});\n`;
GC.forBlock['player_jump'] = wrap((b, g) => `App.jump(${g.valueToCode(b, 'FORCE', ORDER_ATOMIC) || "0.3"});\n`);
GC.forBlock['set_view_mode'] = (b) => `App.setViewMode('${b.getFieldValue('MODE')}');\n`;
GC.forBlock['set_solid'] = (b) => `App.setSolid('${b.getFieldValue('NAME')}', ${b.getFieldValue('SOLID') === 'TRUE'});\n`;

// --- LOGIC & VARIABLES GENERATORS ---
GC.forBlock['logic_if'] = (b, g) => `if (${g.valueToCode(b, 'CONDITION', ORDER_ATOMIC) || 'false'}) {\n${g.statementToCode(b, 'DO')}}\n`;
GC.forBlock['logic_if_else'] = (b, g) => `if (${g.valueToCode(b, 'CONDITION', ORDER_ATOMIC) || 'false'}) {\n${g.statementToCode(b, 'DO')}} else {\n${g.statementToCode(b, 'ELSE')}}\n`;
GC.forBlock['logic_compare'] = (b, g) => { 
    const op = { 'EQ': '===', 'NEQ': '!==', 'LT': '<', 'GT': '>' }[b.getFieldValue('OP')]; 
    return [`(${g.valueToCode(b, 'A', ORDER_ATOMIC) || '0'} ${op} ${g.valueToCode(b, 'B', ORDER_ATOMIC) || '0'})`, ORDER_ATOMIC]; 
};
GC.forBlock['logic_boolean'] = (b) => [b.getFieldValue('BOOL') === 'TRUE' ? 'true' : 'false', ORDER_ATOMIC];
GC.forBlock['init_var'] = (b, g) => `App.setVariable('${b.getFieldValue('VAR')}', ${g.valueToCode(b, 'VALUE', ORDER_ATOMIC) || '0'});\n`;
GC.forBlock['set_var'] = (b, g) => `App.setVariable('${b.getFieldValue('VAR')}', ${g.valueToCode(b, 'VALUE', ORDER_ATOMIC) || '0'});\n`;
GC.forBlock['get_var'] = (b) => [`App.getVariable('${b.getFieldValue('VAR')}')`, ORDER_ATOMIC];
GC.forBlock['change_var'] = (b, g) => `App.setVariable('${b.getFieldValue('VAR')}', App.getVariable('${b.getFieldValue('VAR')}') + ${g.valueToCode(b, 'VALUE', ORDER_ATOMIC) || '0'});\n`;
GC.forBlock['display_var'] = (b) => `App.displayVariable('${b.getFieldValue('VAR')}', '${b.getFieldValue('LABEL')}');\n`;
GC.forBlock['is_touching'] = (b) => [`App.checkCollisionBetween('${b.getFieldValue('A')}', '${b.getFieldValue('B')}')`, ORDER_ATOMIC];

// --- CLONE & RANDOM GENERATORS ---
GC.forBlock['clone_object'] = wrap((b, g) => {
    var original = g.valueToCode(b, 'ORIGINAL', ORDER_ATOMIC) || "''";
    var newId = g.valueToCode(b, 'NEWID', ORDER_ATOMIC) || "''";
    return `App.cloneObject(${original}, ${newId});\n`;
});

GC.forBlock['get_random_number'] = function(block, generator) {
    var min = generator.valueToCode(block, 'MIN', ORDER_ATOMIC) || '0';
    var max = generator.valueToCode(block, 'MAX', ORDER_ATOMIC) || '100';
    var code = `Math.floor(Math.random() * (${max} - ${min} + 1) + parseInt(${min}))`;
    return [code, ORDER_NONE];
};

GC.forBlock['get_matrix_value'] = function(block, generator) {
    var matrix = generator.valueToCode(block, 'MATRIX', ORDER_ATOMIC) || '[]';
    var row = generator.valueToCode(block, 'ROW', ORDER_ATOMIC) || '0';
    var col = generator.valueToCode(block, 'COL', ORDER_ATOMIC) || '0';
    var code = `(function(m, r, c) { return (m && m[r] && m[r][c] !== undefined) ? m[r][c] : 0; })(${matrix}, ${row}, ${col})`;
    return [code, ORDER_FUNCTION_CALL];
};

// --- UI GENERATORS ---
GC.forBlock['create_ui'] = wrap(b => `App.createUI('${b.getFieldValue('TYPE')}', '${b.getFieldValue('ID')}', ${b.getFieldValue('X')}, ${b.getFieldValue('Y')}, ${b.getFieldValue('W')}, ${b.getFieldValue('H')}, '${b.getFieldValue('TEXT')}', '${b.getFieldValue('TEX') === 'none' ? '' : b.getFieldValue('TEX')}', null);\n`);
GC.forBlock['ui_button_pressed'] = (b) => [`App.isButtonClicked('${b.getFieldValue('ID')}')`, ORDER_ATOMIC];
GC.forBlock['remove_ui'] = wrap(b => `App.removeUI('${b.getFieldValue('ID')}');\n`);
GC.forBlock['set_ui_text'] = wrap((b, g) => `App.setUIText('${b.getFieldValue('ID')}', ${g.valueToCode(b, 'TEXT', ORDER_ATOMIC) || "''"});\n`);
GC.forBlock['style_ui'] = wrap(b => {
    return `App.styleUI('${b.getFieldValue('ID')}', { radius: ${b.getFieldValue('RADIUS')}, bgColor: '${b.getFieldValue('BG_COLOR')}', opacity: ${b.getFieldValue('OPACITY')}, strokeWidth: ${b.getFieldValue('STROKE_W')}, strokeColor: '${b.getFieldValue('STROKE_C')}' });\n`;
});
GC.forBlock['ui_animate'] = wrap(b => `App.animateUI('${b.getFieldValue('ID')}', '${b.getFieldValue('EFFECT')}');\n`);
GC.forBlock['ui_hover_style'] = wrap(b => `App.setHoverEffect('${b.getFieldValue('ID')}', ${b.getFieldValue('SCALE')}, ${b.getFieldValue('BRIGHT')});\n`);

// --- WORLD DESIGN GENERATORS ---
GC.forBlock['set_floor_texture'] = wrap((b, g) => `App.setFloor(${g.valueToCode(b, 'TEXTURE', ORDER_ATOMIC) || "''"});\n`);
GC.forBlock['set_skybox_texture'] = wrap((b, g) => `App.setSkybox(${g.valueToCode(b, 'TEXTURE', ORDER_ATOMIC) || "''"});\n`);
GC.forBlock['set_light_intensity'] = wrap((b, g) => `App.setLightIntensity(${g.valueToCode(b, 'VALUE', ORDER_ATOMIC) || "1.0"});\n`);

// --- MATH & TEXT GENERATORS ---
GC.forBlock['colour_picker_custom'] = (b, g) => [g.quote_(b.getFieldValue('COL')), ORDER_ATOMIC];
GC.forBlock['math_number'] = (b) => [b.getFieldValue('NUM'), ORDER_ATOMIC];
GC.forBlock['text'] = (b, g) => [g.quote_(b.getFieldValue('TEXT')), ORDER_ATOMIC];
GC.forBlock['text_join_simple'] = (b, g) => [`(${g.valueToCode(b, 'A', ORDER_ATOMIC) || "''"} + "" + ${g.valueToCode(b, 'B', ORDER_ATOMIC) || "''"})`, ORDER_ATOMIC];

GC.forBlock['ui_proximity_trigger'] = function(block, generator) {
    const uiId = block.getFieldValue('UI_ID');
    const objName = block.getFieldValue('OBJ_NAME');
    const range = generator.valueToCode(block, 'RANGE', Blockly.JavaScript.ORDER_ATOMIC) || "5";

    // Eindeutiger Key für diesen Trigger
    const stateKey = `proximity_${uiId}_${objName.replace(/[^a-zA-Z0-9]/g, '')}`;

    return `
window['${stateKey}'] = false; 

App.onTick(() => {
    const pPos = App.getPlayerPosition(); 
    const oPos = App.getObjectPosition('${objName}');
    
    if (pPos && oPos) {
        const dx = pPos.x - oPos.x;
        const dy = pPos.y - oPos.y;
        const dz = pPos.z - oPos.z;
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        const isClose = dist <= ${range};
        
        // Vergleich mit dem globalen Window-State
        if (isClose !== window['${stateKey}']) {
            window['${stateKey}'] = isClose;
            console.log("Trigger Update: ${uiId} ist nun " + (isClose ? "Sichtbar" : "Versteckt"));
            App.setUIVisibility('${uiId}', isClose);
        }
    }
});\n`;
};
GC.forBlock['player_interact_with_object'] = wrap((b, g) => {
    const key = b.getFieldValue('KEY');
    const objName = b.getFieldValue('OBJ_NAME');
    const range = g.valueToCode(b, 'RANGE', ORDER_ATOMIC) || "3";
    const statements = g.statementToCode(b, 'DO');

    return `
App.registerKeyEvent('${key}', () => {
    const pPos = App.getPlayerPosition();
    const oPos = App.getObjectPosition('${objName}');

    if (pPos && oPos) {
        const dist = Math.sqrt(
            Math.pow(pPos.x - oPos.x, 2) + 
            Math.pow(pPos.y - oPos.y, 2) + 
            Math.pow(pPos.z - oPos.z, 2)
        );

        if (dist <= ${range}) {
            console.log("Interaktion mit ${objName} erfolgreich!");
            ${statements}
        }
    }
});\n`;
});
GC.forBlock['set_ui_visible_manual'] = function(block) {
    // Hole den Wert aus dem Textfeld "ID" des Blocks
    const uiId = block.getFieldValue('ID'); 
    const state = block.getFieldValue('STATE'); // "true" oder "false"

    // Erzeuge den fertigen Code-String
    return `App.setUIVisibility('${uiId}', ${state});\n`;
};
GC.forBlock['wait_seconds'] = function(block, generator) {
  const seconds = generator.valueToCode(block, 'SECONDS', Blockly.JavaScript.ORDER_ATOMIC) || "1";
  // WICHTIG: Das await sorgt dafür, dass die Engine pausiert
  return `await new Promise(resolve => setTimeout(resolve, ${seconds} * 1000));\n`;
};




window.Editor = {
    scripts: { "Main": null },
    currentScript: "Main",
    init() {
        window.workspace = Blockly.inject('blocklyArea', { toolbox: document.getElementById('toolbox'), grid: { spacing: 25, length: 3, colour: '#222', snap: true } });
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
        if (n === this.currentScript) return;

        this.scripts[this.currentScript] = Blockly.serialization.workspaces.save(window.workspace);

        this.currentScript = n;

        window.workspace.clear();
        if (this.scripts[n]) {
            Blockly.serialization.workspaces.load(this.scripts[n], window.workspace);
        }

        this.renderList();

        window.workspace.render();
    },

    updateCurrentScriptBuffer() {
        if (window.workspace) {
            this.scripts[this.currentScript] = Blockly.serialization.workspaces.save(window.workspace);
        }
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
        let fullCode = "";
        let tempWorkspace = new Blockly.Workspace();
        Object.values(this.scripts).forEach(saveData => {
            if (saveData) {
                tempWorkspace.clear();
                Blockly.serialization.workspaces.load(saveData, tempWorkspace);
                const topBlocks = tempWorkspace.getTopBlocks(false);
                topBlocks.forEach(block => {
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