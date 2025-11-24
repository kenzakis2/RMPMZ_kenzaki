/*:ja
 * @plugindesc 装備スロット内容自由設置 - v1.00
 * @author 剣崎宗二
 *
 * @target MZ
 * 
 * @param Status Rows
 * @desc キャラを縦に並べる数。
 * @type number
 * @min 1
 * @default 4
 *
 * @param Status Cols
 * @desc キャラを横に並べる数。
 * @type number
 * @min 1
 * @default 1
 * 
 * @param Status Window X
 * @desc メニューステータスのX（-1の場合はデフォルト動作)。
 * @type number
 * @min -1
 * @default -1
 *
 * @param Status Window Y
 * @desc メニューステータスのY（-1の場合はデフォルト動作)。
 * @type number
 * @min -1
 * @default -1
 * 
 * @param Status Window Width
 * @desc メニューステータスの横幅（-1の場合はデフォルト動作)。
 * @type number
 * @min -1
 * @default 300
 *
 * @param Status Window Height
 * @desc メニューステータスの縦幅（-1の場合はデフォルト動作)。
 * @type number
 * @min -1
 * @default 600
 * 
 * @param Background PNG
 * @desc メニューウィンドウの背景ファイル。Systemフォルダ内。この欄が空白でデフォルト状態。
 * @type string
 * @default 
 * 
 * @param ItemPicFolder
 * @desc アイテム画像のフォルダ名。
 * @type string
 * @default pictures
 * 
 * @param Display Text
 * @desc 表示するテキスト。,区切りで 内容,x,y,横幅,文字サイズ,文字色ID,アウトライン色ID,フォント名。値がなければデフォルト。
 * @type string[]
 * @default ["a.name(),10,10,30","a.mhp,40,10,30,38,10,,10"]
 * 
 * @param Display Picture
 * @desc 表示するピクチャ、複数指定可でpicturesフォルダ内。,区切りで ピクチャ名,x,y 。
 * @type string[]
 * @default ["a.actor().meta.stand_picture,10,10"]
 * 
 *
 * @help アイテム名表示　item ? item.name : "",
 *       スロット名表示　slotName,
 */

(() => {
    const script = "kzmz_Equipslot";
    const parameters = PluginManager.parameters(script);

    const _rows = Number(parameters['Status Rows'] || 4);
    const _cols = Number(parameters['Status Cols'] || 1);
    const _wX = Number(parameters['Status Window X'] || -1);
    const _wY = Number(parameters['Status Window Y'] || -1);
    const _wWidth = Number(parameters['Status Window Width'] || -1);
    const _wHeight = Number(parameters['Status Window Height'] || -1);
    const _wBackground = String(parameters['Background PNG'] || '');
    const _picListFolder = String(parameters['ItemPicFolder']) || ""; 

    const _dTextArray = eval(parameters['Display Text']) || [];
    const _dPicArray = eval(parameters['Display Picture']) || [];

    ImageManager.loadEquipPics = function(filename) {
        return this.loadBitmap(`img/${_picListFolder}/`, filename);
    };

    const kz_Window_EquipSlot_prototype_initialize = Window_EquipSlot.prototype.initialize;
    Window_EquipSlot.prototype.initialize = function (rect) {
        rect.x = _wX >= 0 ? _wX : rect.x;
        rect.y = _wY >= 0 ? _wY : rect.y;
        rect.width = _wWidth >= 0 ? _wWidth : rect.width;
        rect.height = _wHeight >= 0 ? _wHeight : rect.height;
        kz_Window_EquipSlot_prototype_initialize.call(this, rect);
        if (_wBackground != '') {
            this.setBackgroundType(2);
            this.createBackSprite();
        }
        this._loadingPicList = [];
    };

    Window_EquipSlot.prototype.createBackSprite = function () {
        this._backSprite = new Sprite();
        this.addChildToBack(this._backSprite);
    };

    Window_EquipSlot.prototype.windowWidth = function () {
        return _wWidth >= 0 ? _wWidth : Graphics.boxWidth - 240;
    };

    Window_EquipSlot.prototype.windowHeight = function () {
        return _wHeight >= 0 ? _wHeight : Graphics.boxHeight;
    };

    Window_EquipSlot.prototype.maxPageRows = function () {
        return _rows;
    };

    Window_EquipSlot.prototype.maxCols = function () {
        return _cols;
    };

    Window_EquipSlot.prototype.itemHeight = function () {
        return this.innerHeight / this.maxPageRows();
    };

    Window_EquipSlot.prototype.drawItem = function (index) {
        if (this._actor) {
            this.drawStatusPicture(index);
            this.drawStatusText(index);

            const a = this._actor;
            this._backSprite.bitmap = ImageManager.loadSystem(eval(_wBackground));
        }
    };

    Window_EquipSlot.prototype.drawBackgroundRect = function (rect) {
    };

    Window_EquipSlot.prototype.drawStatusText = function (index) {
        const a = this._actor;
        const slotName = this.actorSlotName(this._actor, index);
        const item = this.itemAt(index);
        const rect = this.itemRect(index);
        _dTextArray.forEach(function (line) {
            const dataArray = line.split(',');
            const value = eval(dataArray[0]);
            const x = Number(dataArray[1]) + rect.x;
            const y = Number(dataArray[2]) + rect.y;
            const width = Math.min(rect.width - Number(dataArray[1]), Number(dataArray[3]));
            const fontSize = Number(dataArray[4]);
            const textColor = Number(dataArray[5]);
            const outlineColor = Number(dataArray[6]);
            const fontFace = dataArray[7];

            const currentOutlineColor = this.contents.outlineColor;
            if (fontFace) { this.contents.fontFace = fontFace; }
            if (textColor >= 0) { this.changeTextColor(ColorManager.textColor(textColor)); }
            if (outlineColor >= 0) { this.contents.outlineColor = ColorManager.textColor(outlineColor); }
            if (fontSize >= 0) { this.contents.fontSize = fontSize; }

            this.drawText(value, x, y, width);

            this.resetFontSettings();
            this.contents.outlineColor = currentOutlineColor;
        }, this);
    };

    Window_EquipSlot.prototype.drawStatusPicture = function (index) {
        const a = this._actor;
        const slotName = this.actorSlotName(this._actor, index);
        const item = this.itemAt(index);
        const rect = this.itemRect(index);

        _dPicArray.forEach(function (line) {
            const dataArray = line.split(',');
            const value = eval(dataArray[0]);
            const x = Number(dataArray[1]) + rect.x;
            const y = Number(dataArray[2]) + rect.y;
            var loadPicEntry = {};
            loadPicEntry.bitmap = ImageManager.loadEquipPics(value);
            loadPicEntry.x = x;
            loadPicEntry.y = y;

            this._loadingPicList.push(loadPicEntry);
        }, this);
    };


    const Window_EquipSlot_prototype_update = Window_EquipSlot.prototype.update;
    Window_EquipSlot.prototype.update = function () {
        Window_EquipSlot_prototype_update.call(this);
        this.redrawFromLoading();
    };

    Window_EquipSlot.prototype.redrawFromLoading = function () {
        var change = false;
        this._loadingPicList
            .filter(e => e.bitmap && e.bitmap.isReady())
            .forEach(e => {
                change = true;
                this.contents.blt(e.bitmap, 0, 0, e.bitmap.width, e.bitmap.height, e.x, e.y);
            }, this);

        if (change) {
            this._loadingPicList = this._loadingPicList.filter(e => e.bitmap && !e.bitmap.isReady());
        }
    };


})();