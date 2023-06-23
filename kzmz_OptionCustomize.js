/*:ja
 * @plugindesc オプション改変
 * @author Souji Kenzaki / Documented by Sairi
 *
 * @param Options
 * @desc オプションに出す項目の一覧
 * @type struct<OptionDetail>[]
 * @default []
 * 
 * @param Categories
 * @desc オプションに出す項目の一覧
 * @type struct<CategoryData>[]
 * @default []
 * 
 * @param barBitmap
 * @desc バーのゲージ画像名
 * @type string
 * @default OPbar
 * 
 * @param dialBitmap
 * @desc バーのツマミ部分画像名
 * @type string
 * @default OPdial
 * 
 * @param buttonBitmapOn
 * @desc スイッチ項目が「ON」時の画像名
 * @type string
 * @default OPon
 * 
 * @param buttonBitmapOff
 * @desc スイッチ項目が「OFF」時の画像名
 * @type string
 * @default OPoff
 * 
 * @param textOverhead
 * @desc 項目全体の開始位置
 * @type number
 * @default 10
 * 
 * @param barOverhead
 * @desc バーの開始位置
 * @type number
 * @default 10
 * 
 * @param statusTextWidth
 * @desc バー項目の右手に出る現在の値表示の幅、ゲージとの間隔を調整します。
 * @type number
 * @default 50
 * 
 * @param titleTextWidth
 * @desc 項目テキストの幅
 * @type number
 * @default 50
 * 
 * @param CWindowX
 * @desc カテゴリウインドウのx位置
 * @type number
 * @min -9999
 * @default 0
 * 
 * @param CWindowY
 * @desc カテゴリウインドウのy位置
 * @type number
 * @min -9999
 * @default 0
 * 
 * @param CWindowWidth
 * @desc カテゴリウインドウの横幅。
 * @type number
 * @default 0
 * 
 * @param CWindowHeight
 * @desc カテゴリウインドウの縦幅。
 * @type number
 * @default 0
 * 
 * @param CWindowCols
 * @desc カテゴリウインドウの横並びの数
 * @type number
 * @default 1
 * 
 * @param WindowX
 * @desc ウインドウのx位置
 * @type number
 * @min -9999
 * @default 0
 * 
 * @param WindowY
 * @desc ウインドウのy位置
 * @type number
 * @min -9999
 * @default 0
 * 
 * @param WindowWidth
 * @desc ウインドウの横幅。0ならデフォルト通り
 * @type number
 * @default 0
 * 
 * @param WindowHeight
 * @desc ウインドウの縦幅。0ならデフォルト通り
 * @type number
 * @default 0
 * 
 * @param WindowXoverhead
 * @desc ウインドウに対する画像or文字の相対座標X
 * @type number
 * @min -9999
 * @default 0
 * 
 * @param WindowYoverhead
 * @desc ウインドウに対する画像or文字の相対座標Y
 * @type number
 * @min -9999
 * @default 0
 * 
 * @param rectXoverhead
 * @desc 選択マス内での位置調整X
 * @type number
 * @min -9999
 * @default 0
 * 
 * @param rectYoverhead
 * @desc 選択マス内での位置調整Y
 * @type number
 * @min -9999
 * @default 0
 * 
 * @param WindowBack
 * @desc 背景名。空白の場合デフォルト。
 * @type string
 * @default 
 * 
 * @help このプラグインには、プラグインコマンドはありません。
 *
 *  ■デフォルト項目一覧
 *　is Number Type（false）のスイッチ項目
 *
 *　　name　　　　　-　data
 *　*----------------------------------------------
 *  　常時ダッシュ　-　ConfigManager.alwaysDash
 *　　コマンド記憶　-　ConfigManager.commandRemember
 *
 *　is Number Type（true）
 *　type min = 0　max = 100　keystep = 20　のバー項目
 *
 *　　name　　　　　-　data
 *　*----------------------------------------------
 *  　ＢＧＭ音量　　-　ConfigManager.bgmVolume
 *　　ＢＧＳ音量　　-　ConfigManager.bgsVolume
 *　　ＭＥ音量　　　-　ConfigManager.meVolume
 *　　ＳＥ音量　　　-　ConfigManager.seVolume
 *
 *
 * 画像ファイルは img/system に置いてください。
 *
 * タイトル画面で此方の内容を変更した場合でも、独自変数、
 * 及びスイッチの項目はゲームがスタートした時点で初期化されます。
 *
 * 
 */
/*~struct~OptionDetail:
 * @param name
 * @desc オプション名（オプション画面に表示されるもの）
 * @type string
 * 
 * @param optionCategory
 * @desc カテゴリーID。下記カテゴリーデータとマッチさせるもの。
 * @type string
 * 
 * @param data
 * @desc このオプションによって変更される値(ConfigManager.bgmVolume等)。同じものが2つ以上あるとエラーになりますのでご注意ください。
 * @type string
 * 
 * @param isNumberType
 * @desc ボタン（true/false値）かバー(数値)か
 * @on 数値
 * @off ボタン
 * @type boolean
 * 
 * @param typeMin
 * @desc 数値バー時のみ有効。最小値
 * @type number
 * @default 0
 * 
 * @param typeMax
 * @desc 数値バー時のみ有効。最大値
 * @type number
 * @default 100
 * 
 * @param keyStep
 * @desc 数値バー時のみ有効。1押しごとの変動値
 * @type number
 * @default 1
 * 
 * @param condition
 * @desc 評価値がtrueの場合のみこの項目を表示。メニュー表示の瞬間のみ有効で、他の項目に依存して動的に表示変更は出来ないので注意！
 * @type string
 * @default true
 * 
*/
/*~struct~CategoryData:
 * 
 * @param categoryId
 * @desc カテゴリーのID。<optionCategory>と一致させる事
 * @type string
 * 
 * @param categoryName
 * @desc カテゴリー表示名
 * @type string
 * 
 * 
*/
(function () {
    let parameters = PluginManager.parameters('kzmz_OptionCustomize');
    let barBitmap = parameters['barBitmap'] || "OPbar";//バー本体の名前。
    let dialBitmap = parameters['dialBitmap'] || "OPdial"; //ツマミの名前。
    let buttonBitmapOn = parameters['buttonBitmapOnL'] || "OPon"; //ボタンONの名前。
    let buttonBitmapOff = parameters['buttonBitmapOffL'] || "OPoff"; //ボタンOFFの名前

    let textOverhead = Number(parameters['textOverhead']) || 10; 
    let barOverhead = Number(parameters['barOverhead']) || 10; 
    let statusTextWidth = Number(parameters['statusTextWidth']) || 50; 
    let titleTextWidth = Number(parameters['titleTextWidth']) || 50; 

    let _wX = Number(parameters['WindowX']) || 0; 
    let _wY = Number(parameters['WindowY']) || 0; 
    let _wW = Number(parameters['WindowWidth']) || 0; 
    let _wH = Number(parameters['WindowHeight']) || 0; 
    let _wOX = Number(parameters['WindowXoverhead']) || 0; 
    let _wOY = Number(parameters['WindowYoverhead']) || 0; 
    let _rOX = Number(parameters['rectXoverhead']) || 0; 
    let _rOY = Number(parameters['rectYoverhead']) || 0; 
    let _OWBack = String(parameters['WindowBack']) || ""; 

    let _CwX = Number(parameters['CWindowX']) || 0; 
    let _CwY = Number(parameters['CWindowY']) || 0; 
    let _CwW = Number(parameters['CWindowWidth']) || 0; 
    let _CwH = Number(parameters['CWindowHeight']) || 0; 
    let _CwCol = Number(parameters['CWindowCols']) || 1; 

    let optionList = JSON.parse(parameters['Options']).map(
        function (e) {
            let newObj = JSON.parse(e);
            newObj.isNumberType = eval(newObj.isNumberType);
            newObj.typeMin = eval(newObj.typeMin);
            newObj.typeMax = eval(newObj.typeMax);
            newObj.keyStep = eval(newObj.keyStep);
            return newObj;
        }
    ) || [];
    let _categoryData = JSON.parse(parameters['Categories']).map(
        function (e) {
            let newObj = JSON.parse(e);
            return newObj;
        }
    ) || [];

    const kz_Scene_Boot_loadSystemImages = Scene_Boot.prototype.loadSystemImages;
    Scene_Boot.prototype.loadSystemImages = function () {
        kz_Scene_Boot_loadSystemImages.call(this);
        console.log(barBitmap);
        ConfigManager.barBitmap = ImageManager.loadSystem(barBitmap);
        ConfigManager.dialBitmap = ImageManager.loadSystem(dialBitmap);
        ConfigManager.buttonBitmapOnL = ImageManager.loadSystem(buttonBitmapOn);
        ConfigManager.buttonBitmapOffL = ImageManager.loadSystem(buttonBitmapOff);
    };

    const kz_Scene_Options_prototype_create = Scene_Options.prototype.create;
    Scene_Options.prototype.create = function() {
        kz_Scene_Options_prototype_create.call(this);
        this.createCategoryWindow();
        this._optionCategoryWindow.activate();
        this._optionsWindow.deactivate();
    };

    const Scene_Options_prototype_createOptionsWindow = Scene_Options.prototype.createOptionsWindow;
    Scene_Options.prototype.createOptionsWindow = function() {
        const rect = new Rectangle(_wX, _wY, _wW, _wH);
        this._optionsWindow = new Window_Options(rect);
        this._optionsWindow.setHandler("cancel", this.popScene.bind(this));
        this.addWindow(this._optionsWindow);
    };

    Scene_Options.prototype.createCategoryWindow = function() {
        const rect = new Rectangle(_CwX, _CwY, _CwW, _CwH);
        this._optionCategoryWindow = new Window_OptionCategory(rect);
        this._optionCategoryWindow.setHandler("ok", this.categoryOk.bind(this));
        this._optionCategoryWindow.setHandler("cancel", this.popScene.bind(this));
        this._optionCategoryWindow.setItemWindow(this._optionsWindow);
        this.addWindow(this._optionCategoryWindow);
    };

    Scene_Options.prototype.categoryOk = function() {
        this._optionsWindow.activate();
    };

    const kz_Window_Options_prototype_initialize = Window_Options.prototype.initialize;
    Window_Options.prototype.initialize = function (rect) {
        this._category = null;
        this._baseSprites = [];
        this._cursorSprites = [];
        this._textSprites = [];
        kz_Window_Options_prototype_initialize.call(this, rect);
        if (_OWBack != '') {
            this.setBackgroundType(2);
            this.createBackSprite();
        }
    };

    Window_Options.prototype.createBackSprite = function () {
        this._backSprite = new Sprite();
        this._backSprite.bitmap = ImageManager.loadSystem(_OWBack);
        this._backSprite.x = _wOX;
        this._backSprite.y = _wOY;
        this.addChildToBack(this._backSprite);
    };

    Window_Options.prototype.setCategory = function (category) {
        if (category == this._category) return;
        this._category = category;
        this.refresh();
    }

    Window_Options.prototype.makeCommandList = function() {
        optionList.forEach(e => {
            if (!e || e.optionCategory != this._category || !eval(e.condition)) return;
            this.addCommand(e.name, e.data);
        });
    };

    Window_Options.prototype.findSymbolFromList = function (symbol) {
        return optionList.find(function (element) {
            return element.data == symbol;
        }, this);
    };

    Window_Options.prototype.drawItem = function(index) {
        const title = this.commandName(index);
        const rect = this.itemLineRect(index);
        const statusWidth = statusTextWidth;
        const titleWidth = titleTextWidth;
        this.resetTextColor();
        this.drawText(title, rect.x, rect.y, titleWidth, "left");
    };

    Window_Options.prototype.getConfigValue = function (symbol) {
        let tResult = eval(symbol);
        if (!tResult) {
            if (this.isVolumeSymbol(symbol)) {
                let t = this.findSymbolFromList(symbol);
                return t.typeMin;
            }
            else {
                return false;
            }
        }
        return tResult;
    };

    Window_Options.prototype.setConfigValue = function (symbol, volume) {
        console.log(volume);
        eval(symbol + '=' + volume);
    };

    Window_Options.prototype.volumeOffset = function () {
        let symbol = this.currentSymbol();
        let t = this.findSymbolFromList(symbol);
        if (!t) return 1;
        return t.keyStep;
    };

    Window_Options.prototype.removeAllSprites = function () {
        this._baseSprites.forEach(e => this.removeChild(e), this);
        this._cursorSprites.forEach(e => this.removeChild(e), this);
        this._textSprites.forEach(e => this.removeChild(e), this);

        this._baseSprites = [];
        this._cursorSprites = [];
        this._textSprites = [];
    };

    const kz_Window_Options_prototype_refresh = Window_Options.prototype.refresh;
    Window_Options.prototype.refresh = function () {
        this.removeAllSprites();
        kz_Window_Options_prototype_refresh.call(this);
    };

    Window_Options.prototype.drawDragBar = function (index, graphicRect) {
        let symbol = this.commandSymbol(index);
        let t = this.findSymbolFromList(symbol);
        let value = (this.getConfigValue(symbol) - t.typeMin) / t.typeMax;
        let barBitmapObject = ConfigManager.barBitmap;
        let dialBitmapObject = ConfigManager.dialBitmap;

        let baseX = graphicRect.x + _rOX;
        let baseY = graphicRect.y + _rOY

        if (this._baseSprites.some(e => e._symbol == symbol))
        {
            //change Value only
            let existingDial = this._cursorSprites.find(e => e._symbol == symbol);
            existingDial.x = baseX + this._baseSprites[0].width * value - dialBitmapObject.width / 2;
            existingDial.y = baseY + (barBitmapObject.height - dialBitmapObject.height) / 2;

            let existingText = this._textSprites.find(e => e._symbol == symbol);
            existingText.bitmap.clear();
            existingText.bitmap.drawText(this.getConfigValue(symbol), 0, 0, 50, 80, 'left');

        }
        else
        {
            let spriteBar = new Sprite_Options(barBitmapObject, symbol);
            spriteBar.x = baseX;
            spriteBar.y = baseY;
            this._baseSprites.push(spriteBar);
            this.addChild(spriteBar);

            let spriteDial = new Sprite_Options(dialBitmapObject, symbol);
            spriteDial.x = baseX + spriteBar.width * value - dialBitmapObject.width / 2;
            spriteDial.y = baseY + (barBitmapObject.height - dialBitmapObject.height) / 2;
            this._cursorSprites.push(spriteDial);
            this.addChild(spriteDial);

            let spriteText = new Sprite_Options(new Bitmap(50,50), symbol);
            spriteText.x = graphicRect.x + graphicRect.width - 50;
            spriteText.y = graphicRect.y;
            spriteText.bitmap.drawText(this.getConfigValue(symbol), 0, 0, 50, 80, 'left');
            this._textSprites.push(spriteText);
            this.addChild(spriteText);
        }
    }

    Window_Options.prototype.drawItem = function (index) {
        let rect = this.itemRect(index);
        let titleWidth = titleTextWidth;
        this.resetTextColor();
        this.changePaintOpacity(this.isCommandEnabled(index));
        this.drawText(this.commandName(index), rect.x, rect.y, titleWidth, 'left');
        

        let symbol = this.commandSymbol(index);
        let newRect = JsonEx.makeDeepCopy(rect);
        newRect.x = rect.x + titleWidth + textOverhead;
        newRect.width = rect.width - titleWidth - textOverhead;
        if (this.isBarSymbol(symbol)) {
            newRect.x += barOverhead;
            newRect.width -= barOverhead;
            this.drawDragBar(index, newRect);
        }
        else {
            //this.drawOnOffButton(index, newRect);
        }
    };

    Window_Options.prototype.isBarSymbol = function (symbol) {
        let targetOption = this.findSymbolFromList(symbol);
        return targetOption.isNumberType;
    };

    Window_Options.prototype.isVolumeSymbol = function (symbol) {
        return this.isBarSymbol(symbol);
    };

    Window_Options.prototype.processTouch = function (triggered) {
        if (!this.isOpenAndActive()) return;

        let lastIndex = this.index();
        const touchPos = new Point(TouchInput.x, TouchInput.y);
        const localPos = this.worldTransform.applyInverse(touchPos);
        let hitIndex = this.hitIndex();
        if (hitIndex >= 0) {
            let symbol = this.commandSymbol(hitIndex);
            if (this.isVolumeSymbol(symbol)) {
                let v = this.xToValue(symbol,localPos.x);
                this.changeValue(symbol,v);
            }
            else if (hitIndex === this.index()) {
                if (triggered && this.isTouchOkEnabled()) {
                    this.processOk();
                }
            }
            else if (this.isCursorMovable()) {
                this.select(hitIndex);
            }
        } else if (this._stayCount >= 10) {
            if (y < this.padding) {
                this.cursorUp();
            } else if (y >= this.height - this.padding) {
                this.cursorDown();
            }
        }
        if (this.index() !== lastIndex) {
            SoundManager.playCursor();
        }
    };

    Window_Options.prototype.xToValue = function (symbol, x) {
        let sprite = this._baseSprites.find(e => e._symbol == symbol)
        let t = this.findSymbolFromList(symbol);

        let value = (t.typeMax - t.typeMin) * (x - sprite.x) / sprite.width + t.typeMin;
        value = Math.round(value);
        value = value.clamp(t.typeMin, t.typeMax);
        return value;
    };

    

    function Window_OptionCategory() {
        this.initialize(...arguments);
    }
    
    Window_OptionCategory.prototype = Object.create(Window_Command.prototype);
    Window_OptionCategory.prototype.constructor = Window_OptionCategory;
    
    Window_OptionCategory.prototype.initialize = function(rect) {
        Window_Command.prototype.initialize.call(this, rect);
        this._itemWindow = null;
        if (_OWBack != '') {
            this.setBackgroundType(2);
        }
    };
    
    Window_OptionCategory.prototype.maxCols = function() {
        return _CwCol;
    };

    Window_OptionCategory.prototype.setItemWindow = function(itemWindow) {
        this._itemWindow = itemWindow;
    };
    
    Window_OptionCategory.prototype.itemTextAlign = function() {
        return "center";
    };

    Window_OptionCategory.prototype.makeCommandList = function() {
        _categoryData.forEach(e => {
            this.addCommand(e.categoryName, e.categoryId);
        });
    };

    Window_OptionCategory.prototype.update = function() {
        Window_Command.prototype.update.call(this);
        if (this._itemWindow) {
            this._itemWindow.setCategory(this.currentSymbol());
        }
    };


    function Sprite_Options() {
        this.initialize(...arguments);
    }
    
    Sprite_Options.prototype = Object.create(Sprite.prototype);
    Sprite_Options.prototype.constructor = Sprite_Options;

    Sprite_Options.prototype.initialize = function(bitmap, symbol) {
        Sprite.prototype.initialize.call(this, bitmap);
        this._symbol = symbol;
    };

})();