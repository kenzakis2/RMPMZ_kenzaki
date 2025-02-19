/*:ja
 * @plugindesc アイテムメニューの自由設置-v1.0.1
 * @author 剣崎宗二
 *
 * @target MZ
 * 
 * @param Item Row Height
 * @desc １アイテムの縦の高さ。
 * @type number
 * @min 1
 * @default 4
 *
 * @param Item Columns
 * @desc 横のアイテム数
 * @type number
 * @min 1
 * @default 1
 * 
 * @param WindowBack
 * @desc ウィンドウ背景名。空白の場合デフォルト。
 * @type string
 * @default 
 * 
 * @param ItemPicFolder
 * @desc アイテム画像のフォルダ名。
 * @type string
 * @default pictures
 * 
 * @param Text Items
 * @desc 各枠のテキストの詳細
 * @type struct<TextItem>[]
 * @default []
 * 
 * @param Picture Items
 * @desc 各枠のテキストの詳細
 * @type struct<PicItem>[]
 * @default []
 * 
 * @help:
 * 更新履歴：
 * v1.0.1-特定の状況で背景設定でエラーが発生する状況の修正
 */
/*~struct~TextItem:
 * @param expression
 * @desc 表示する文字。実文字の場合''で囲む事。そうでない場合は評価式（$gameVariables.～等）制御文字可
 * @type string
 * 
 * @param x
 * @desc 枠内でのX座標
 * @type number
 * default 0
 * 
 * @param y
 * @desc 枠内でのY座標
 * @type number
 * default 0
 * 
 * @param fontColor
 * @desc フォント色ID
 * @type number
 * default 0
 * 
 * @param fontSize
 * @desc フォントサイズ
 * @type number
 * default 0
 * 
 * @param fontName
 * @desc フォント名(空白でデフォルト)
 * @type string
 * 
 * 
 * 
*/
/*~struct~PicItem:
 * @param expression
 * @desc 表示する画像ファイル名。実文字の場合''で囲む事。そうでない場合は評価式（$gameVariables.～等）制御文字可
 * @type string
 * 
 * @param x
 * @desc 枠内でのX座標
 * @type number
 * default 0
 * 
 * @param y
 * @desc 枠内でのY座標
 * @type number
 * default 0
 *  
 * 
 * 
*/



(() => {

    const script = "kzmz_ItemListCustomize";
    const parameters = PluginManager.parameters(script);

    const _itemRowHeight = Number(parameters['Item Row Height'] || 0);
    const _itemColumns = Number(parameters['Item Columns'] || 0);
    const _OWBack = String(parameters['WindowBack']) || ""; 
    const _picListFolder = String(parameters['ItemPicFolder']) || ""; 

    const _textList = JSON.parse(parameters['Text Items']).map(
        function (e) {
            let newObj = JSON.parse(e);
            return newObj;
        }
    ) || [];

    const _picList = JSON.parse(parameters['Picture Items']).map(
        function (e) {
            let newObj = JSON.parse(e);
            return newObj;
        }
    ) || [];

    ImageManager.loadItemPics = function(filename) {
        return this.loadBitmap(`img/${_picListFolder}/`, filename);
    };

    Scene_Item.prototype.createItemWindow = function () {
        const rect = this.itemWindowRect();
        if (!this._categoryWindow.needsSelection()) {
            rect.y -= this._categoryWindow.height;
            rect.height += this._categoryWindow.height;
        }
        this._itemWindow = new Window_CustomItemList(rect);
        this._itemWindow.setHelpWindow(this._helpWindow);
        this._itemWindow.setHandler("ok", this.onItemOk.bind(this));
        this._itemWindow.setHandler("cancel", this.onItemCancel.bind(this));
        this.addWindow(this._itemWindow);
        this._categoryWindow.setItemWindow(this._itemWindow);
        if (!this._categoryWindow.needsSelection()) {
            this._itemWindow.createContents();
            this._categoryWindow.update();
            this._categoryWindow.hide();
            this._categoryWindow.deactivate();
            this.onCategoryOk();
        }
    };

    function Window_CustomItemList() {
        this.initialize.apply(this, arguments);
    }
    Window_CustomItemList.prototype = Object.create(Window_ItemList.prototype);
    Window_CustomItemList.prototype.constructor = Window_CustomItemList;

    const kz_Window_CustomItemList_prototype_initialize = Window_CustomItemList.prototype.initialize;
    Window_CustomItemList.prototype.initialize = function (rect) {
        kz_Window_CustomItemList_prototype_initialize.call(this, rect);
        this._loadingPicList = [];
        if (_OWBack != '') {
            this.setBackgroundType(2);
            this.createBackSprite();
        }
    };

    Window_CustomItemList.prototype.createBackSprite = function () {
        this._backSprite = new Sprite();
        this._backSprite.bitmap = ImageManager.loadSystem(_OWBack);
        this._backSprite.x = 0;
        this._backSprite.y = 0;
        this.addChildToBack(this._backSprite);
    };

    Window_CustomItemList.prototype.maxCols = function () {
        return _itemColumns;
    };

    Window_CustomItemList.prototype.itemHeight = function () {
        return _itemRowHeight;
    }

    Window_CustomItemList.prototype.drawItem = function (index) {
        const item = this.itemAt(index);
        const rect = this.itemRect(index);
        if (item) {
            _textList.forEach(element => {
                const value = eval(element.expression);
                
                const x = Number(element.x) + rect.x;
                const y = Number(element.y) + rect.y;
                const width = rect.width - element.x;

                const fontSize = Number(element.fontSize);
                const textColor = Number(element.fontColor);
                const fontFace = element.fontName;

                if (fontFace) { this.contents.fontFace = fontFace; }
                if (textColor >= 0) { this.changeTextColor(ColorManager.textColor(textColor)); }
                if (fontSize >= 0) { this.contents.fontSize = fontSize; }

                this.drawText(value, x, y, width);

                this.resetFontSettings();
            });

            _picList.forEach(function (line) {
                var loadPicEntry = {};
                loadPicEntry.bitmap = ImageManager.loadItemPics(eval(line.expression));
                loadPicEntry.x = Number(line.x) + rect.x;
                loadPicEntry.y = Number(line.y) + rect.y;

                this._loadingPicList.push(loadPicEntry);
            }, this);
        }
    };

    const Window_CustomItemList_prototype_update = Window_CustomItemList.prototype.update;
    Window_CustomItemList.prototype.update = function () {
        Window_CustomItemList_prototype_update.call(this);
        this.redrawFromLoading();
    };

    Window_CustomItemList.prototype.redrawFromLoading = function () {
        var change = false;
        this._loadingPicList
            .filter(e => e.bitmap && e.bitmap.isReady())
            .forEach(e => {
                change = true;
                this.contentsBack.blt(e.bitmap, 0, 0, e.bitmap.width, e.bitmap.height, e.x, e.y);
            }, this);

        if (change) {
            this._loadingPicList = this._loadingPicList.filter(e => e.bitmap && !e.bitmap.isReady());
        }
    };

    Window_CustomItemList.prototype.drawItemBackground = function(index) {
        
    };

})();