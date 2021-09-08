/*:ja
 * @plugindesc メニューに、1要素1窓のウィンドウを大量に追加する。
 *
 * @target MZ
 *
 * @param Display Gold Window
 * @desc デフォルトのゴールドウィンドウを表示するか？
 * @type boolean
 * @default true
 * 
 * @param Display Text
 * @desc ,区切りの表示するテキスト。フォーマットは　背景画像,窓x,窓y,ステータス,x,y,横幅,テキストサイズ,テキスト色ID,アウトライン色ID,フォント名　となる。フォント／テキスト関係は値がなければデフォルト。
 * @type struct<WindowText>[]
 * @default []
 * 
 * @param Display Gauge
 * @desc ,区切りの表示するゲージ。フォーマットは　背景画像,変動値,最大値,x,y,ゲージ幅,実体色ID,背景色ID　となる
 * @type struct<WindowGauge>[]
 * @default []
 * 
 * @help
 * 要素は前（プレイヤーより）から、文字＞ゲージの順
 * 色指定は#ffffff等16進文字列
 */
 /*~struct~WindowText:
 * @param background
 * @desc 背景画像名（Systemフォルダ内)
 * @type string
 * 
 * @param wx
 * @desc 窓X座標
 * @type number
 * @default 0
 * 
 * @param wy
 * @desc 窓Y座標
 * @type number
 * @default 0
 * 
 * @param value
 * @desc 文字(そのまま表示する際は''で囲う事)
 * @type string
 * 
 * @param x
 * @desc 文字座標X
 * @type number
 * @default 0
 * 
 * @param y
 * @desc 文字座標Y
 * @type number
 * @default 0
 * 
 * @param width
 * @desc 窓横幅
 * @type number
 * @default 200
 * 
 * @param height
 * @desc 窓高さ
 * @type number
 * @default 100
 * 
 * @param fontSize
 * @desc フォントサイズ(0はデフォルトサイズを使用)
 * @type number
 * @default 0
 * 
 * @param textColor
 * @desc テキスト色（16進型。#ffffff等）
 * @type string
 * 
 * @param outlineColor
 * @desc アウトライン色（16進型。#ffffff等）
 * @type string
 * 
 * @param fontFace
 * @desc フォント名
 * @type string
*/
/*~struct~WindowGauge:
 * 
 * @param minValue
 * @desc ゲージ現在値
 * @type string
 * @default 30
 * 
 * @param maxValue
 * @desc ゲージ最大値
 * @type string
 * @default 100
 * 
 * @param x
 * @desc ゲージ座標X
 * @type number
 * @default 0
 * 
 * @param y
 * @desc ゲージ座標Y
 * @type number
 * @default 0
 * 
 * @param width
 * @desc 窓横幅
 * @type number
 * @default 0
 * 
 * @param height
 * @desc 窓高さ
 * @type number
 * @default 0
 * 
 * @param color1
 * @desc ゲージ色（16進型。#ffffff等）
 * @type string
 * @default #ff69b4
 * 
 * @param color2
 * @desc ゲージ色2。1と併せてグラデーションを形成（16進型。#ffffff等）
 * @type string
 * @default #ffc0cb
 * 
*/

(function () {
    const script = "kzmz_MenuExWindow";
    var parameters = PluginManager.parameters(script);

    var _displayGoldWindow = Number(parameters['Display Gold Window'] || false);

    var _dTextArray = JSON.parse(parameters['Display Text']) || [];
    var _dGaugeArray = JSON.parse(parameters['Display Gauge']) || [];



    function Sprite_ExWindow() {
        this.initialize.apply(this, arguments);
    }

    Sprite_ExWindow.prototype = Object.create(Sprite.prototype);
    Sprite_ExWindow.prototype.constructor = Sprite_ExWindow;

    Sprite_ExWindow.prototype.initialize = function (x, y, width, height, bFileName) {
        Sprite.prototype.initialize.call(this);
        var realFileName = eval(bFileName);
        this._background = new Sprite(ImageManager.loadSystem(realFileName));
        this._contentBody = new Sprite(new Bitmap(width, height));
        this.addChild(this._background);
        this.addChild(this._contentBody);
        this.x = x;
        this.y = y;
    };

    Sprite_ExWindow.prototype.drawText = function (text, x, y, maxWidth, align) {
        this._contentBody.bitmap.drawText(text, x, y, maxWidth, 36, align);
    };

    Sprite_ExWindow.prototype.drawGauge = function (x, y, width, rate, color1, color2,bcolor) {
        var fillW = Math.floor(width * rate);
        var gaugeY = y + 28;
        this._contentBody.bitmap.fillRect(x, gaugeY, width, 6, bcolor);
        this._contentBody.bitmap.gradientFillRect(x, gaugeY, fillW, 6, color1, color2);
    };

    Sprite_ExWindow.prototype.changeFontSettings = function (fontSize, fontFace, textColor, outlineColor) {
        this.backupFontSettings = {};
        this.backupFontSettings.fontFace = this._contentBody.bitmap.fontFace;
        this.backupFontSettings.fontSize = this._contentBody.bitmap.fontSize;
        this.backupFontSettings.textColor = this._contentBody.bitmap.textColor;
        this.backupFontSettings.outlineColor = this._contentBody.bitmap.outlineColor;

        if (fontFace) { this._contentBody.bitmap.fontFace = fontFace; } else {this._contentBody.bitmap.fontFace = $gameSystem.mainFontFace()}
        if (textColor) { this._contentBody.bitmap.textColor = textColor; }
        if (outlineColor) { this._contentBody.bitmap.outlineColor = outlineColor; }
        if (fontSize > 0) { this._contentBody.bitmap.fontSize = fontSize; }
    };

    Sprite_ExWindow.prototype.resetFontSettings = function () {
        if (this.backupFontSettings)
        {
            this._contentBody.bitmap.fontFace = this.backupFontSettings.fontFace;
            this._contentBody.bitmap.fontSize = this.backupFontSettings.fontSize;
            this._contentBody.bitmap.textColor = this.backupFontSettings.textColor;
            this._contentBody.bitmap.outlineColor = this.backupFontSettings.outlineColor;
            this.backupFontSettings = null;
        }
    };

    var kz_Scene_Menu_prototype_create = Scene_Menu.prototype.create;
    Scene_Menu.prototype.create = function () {
        kz_Scene_Menu_prototype_create.call(this);
        this.createExwindow();
    };

    var kz_Scene_Shop_prototype_createGoldWindow = Scene_Menu.prototype.createGoldWindow;
    Scene_Menu.prototype.createGoldWindow = function () {
        kz_Scene_Shop_prototype_createGoldWindow.call(this);
        if (!_displayGoldWindow) { this._goldWindow.hide(); }
    };

    Scene_Menu.prototype.createExwindow = function () {
        var p = $gameParty;

        _dTextArray.forEach(function (lineBase) {
            if (!lineBase) return;
            var line = JSON.parse(lineBase);
            line.wx = Number(line.wx);
            line.wy = Number(line.wy);
            line.x = Number(line.x);
            line.y = Number(line.y);
            line.width = Number(line.width);
            line.height = Number(line.height);
            line.fontSize = Number(line.fontSize);

            var newSpriteExWindow = new Sprite_ExWindow(line.wx, line.wy, line.width, line.height, line.background);
            this.addChild(newSpriteExWindow);

            newSpriteExWindow.changeFontSettings(line.fontSize,line.fontFace,line.textColor,line.outlineColor)
            newSpriteExWindow.drawText(eval(line.value), line.x, line.y, line.width - line.x);
            newSpriteExWindow.resetFontSettings();
        }, this);

        _dGaugeArray.forEach(function (lineBase) {
            if (!lineBase) return;
            var line = JSON.parse(lineBase);

            line.x = Number(line.x);
            line.y = Number(line.y);
            line.width = Number(line.width);
            line.height = Number(line.height);

            var newSpriteExWindow = new Sprite_ExWindowGauge();
            newSpriteExWindow.setup(line.width, line.height, line.minValue, line.maxValue, line.color1, line.color2);
            newSpriteExWindow.move(line.x, line.y);
            this.addChild(newSpriteExWindow);
        }, this);
    };

    function Sprite_ExWindowGauge() {
        this.initialize(...arguments);
    }

    Sprite_ExWindowGauge.prototype = Object.create(Sprite_Gauge.prototype);
    Sprite_ExWindowGauge.prototype.constructor = Sprite_ExWindowGauge;

    Sprite_ExWindowGauge.prototype.setup = function(width, height, currentValue, maxValue, color1, color2) {
        this._internalWidth = width;
        this._internalHeight = height;
        this._currentValueEquation = currentValue;
        this._maxValueEquation = maxValue;
        this._valueColor = color1;
        this._maxColor = color2;

        const bw = this.bitmapWidth();
        const bh = this.bitmapHeight();
        this.bitmap = new Bitmap(bw, bh);
        this.redraw();

        this.updateBitmap();
    };

    Sprite_ExWindowGauge.prototype.createBitmap = function() {
    };

    Sprite_ExWindowGauge.prototype.bitmapWidth = function() {
        return this._internalWidth;
    };

    Sprite_ExWindowGauge.prototype.bitmapHeight = function() {
        return this._internalHeight;
    };

    Sprite_ExWindowGauge.prototype.gaugeX = function () {
        return 0;
    };

    Sprite_ExWindowGauge.prototype.smoothness = function() {
        return 5;
    };

    Sprite_ExWindowGauge.prototype.isValid = function() {
        return true;
    };

    Sprite_ExWindowGauge.prototype.updateFlashing = function() {
    };

    Sprite_ExWindowGauge.prototype.currentValue = function() {
        return this._currentValueEquation ? eval(this._currentValueEquation) : NaN;
    };

    Sprite_ExWindowGauge.prototype.currentMaxValue = function() {
        return this._maxValueEquation ? eval(this._maxValueEquation) : NaN;
    };

    Sprite_ExWindowGauge.prototype.gaugeBackColor = function() {
        return this._maxColor;
    };

    Sprite_ExWindowGauge.prototype.gaugeColor1 = function() {
        return this._valueColor;
    };
    
    Sprite_ExWindowGauge.prototype.gaugeColor2 = function() {
        return this._valueColor;
    };

    Sprite_ExWindowGauge.prototype.redraw = function() {
        this.bitmap.clear();
        const currentValue = this.currentValue();
        if (!isNaN(currentValue)) {
            this.drawGauge();
        }
    };
})();