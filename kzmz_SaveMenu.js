/*:ja
 * @plugindesc メニューステータスの自由設置 - v1.01
 * @author 剣崎宗二
 *
 * @target MZ
 * 
 * @param Save Window
 * @desc セーブ画面やロード画面のリスト窓の位置やサイズ
 * @type struct<WindowDimension>
 * 
 * @param Detail Window
 * @desc 詳細窓の位置やサイズ
 * @type struct<WindowDimension>
 * 
 * @param SaveFile Rows
 * @desc セーブリストで縦に並べる項目数
 * @type number
 * @min 1
 * @default 4
 *
 * @param SaveFile Cols
 * @desc セーブリストで横に並べる項目数
 * @type number
 * @min 1
 * @default 1
 * 
 * @param Save Info
 * @desc セーブやロード画面に含めるべきデータの一覧
 * @type struct<SaveInfo>[]
 * @default []
 *
 * @param Window Text Elements
 * @desc 各セーブデータの文字データ（配置などを含む）
 * @type struct<WindowInfoText>[]
 * @default []
 * 
 * @param Window Picture Elements
 * @desc 各セーブデータの画像データ（配置などを含む）
 * @type struct<WindowInfoPictures>[]
 * @default []
 * 
 * @param Detail Text Elements
 * @desc 詳細窓における各セーブデータの文字データ（配置などを含む）
 * @type struct<WindowInfoText>[]
 * @default []
 * 
 * @param Detail Picture Elements
 * @desc 詳細窓における各セーブデータの画像データ（配置などを含む）
 * @type struct<WindowInfoPictures>[]
 * @default []
 * 
 * @param Display Character Walk Graphic
 * @desc 歩行グラフィックを出すかどうか
 * @type boolean
 * @default false
 * 
 * @param Display Character Walk Graphic X
 * @desc 歩行グラフィックX
 * @type number
 * @default 0
 * 
 * @param Display Character Walk Graphic Y
 * @desc 歩行グラフィックY
 * @type number
 * @default 0
 * 
 * @param Detail Character Walk Graphic
 * @desc 歩行グラフィックを出すかどうか（詳細窓）
 * @type boolean
 * @default false
 * 
 * @param Detail Character Walk Graphic X
 * @desc 歩行グラフィックX
 * @type number
 * @default 0
 * 
 * @param Detail Character Walk Graphic Y
 * @desc 歩行グラフィックY（詳細窓）
 * @type number
 * @default 0
 * 
 * @param Screenshot
 * @desc 詳細窓に於けるスクリーンショットの座標。スケール0で非表示。ある程度セーブデータサイズに影響あり
 * @type struct<ScreenshotData>
 * @default 
 * 
 * @param Scene Background
 * @desc 背景画像。空白の場合デフォルト
 * @type string
 * @default 
 * 
 * @param Display Window Frame
 * @desc ウィンドウデフォルトの枠や背景を表示するか
 * @type boolean
 * @default true
 * 
 * @param Cursor
 * @desc カーソル画像周辺
 * @type struct<CursorData>
 * @default 
 * 
 * 
 * 
 *  @help
 * 使用する画像は img/savescene　内。
 * デフォルトでは無いのでフォルダを作って下さい。
 * 
 * テキストの色指定はwindow.pngのカラーパレット
 * インデックスです。変更する場合は0から数えて記載して下さい。
 * 
 * カーソル用画像はアニメ分に横で切り分けて作ります。
 * 
 * 他詳細はサンプルゲームにて説明していますので
 * 実際触ってみて解析してみて下さい。
 * 
 */ 


/*~struct~CursorData:
 * 
 * @param x
 * @desc 調整加算用座標X
 * @type number
 * @min -99999
 * @default 0
 * 
 * @param y
 * @desc 調整加算用座標Y
 * @type number
 * @min -99999
 * @default 0
 * 
 * @param width
 * @desc カーソル１枚分の横幅
 * @type number
 * @default 32
 * 
 * @param height
 * @desc カーソル１枚分の縦幅
 * @type number
 * @default 32
 * 
 * @param anime_count
 * @desc 1ループ何枚か（常に加算で、0->最大->0）
 * @type number
 * @default 2
 * 
 * @param interval
 * @desc アニメーション間隔（数値小さいほど早い
 * @type number
 * @default 0
 * 
 * @param pic
 * @desc カーソル画像名。savesceneフォルダ内
 * @type string
 * @default cursor
 * 
 * 
*/
/*~struct~ScreenshotData:
 * 
 * @param x
 * @desc 座標X
 * @type number
 * @default 0
 * 
 * @param y
 * @desc 座標Y
 * @type number
 * @default 0
 * 
 * @param scale
 * @desc 横縦拡縮。1で原寸、0で機能自体を切る
 * @type number
 * @decimals 2
 * @default 1
 * 
 * 
*/
/*~struct~WindowDimension:
 * 
 * @param x
 * @desc 窓座標X
 * @type number
 * @default 0
 * 
 * @param y
 * @desc 窓座標Y
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
 * 
*/
/*~struct~SaveInfo:
 * 
 * @param name
 * @desc 識別名。info.識別名　みたいな形で運用されます。
 * @type string
 * 
 * @param data
 * @desc 実データ。evalによって評価されます。例:$gameParty.size()　←パーティ人数
 * @type string
 * 
 */ 
 /*~struct~WindowInfoText:
 * 
 * @param data
 * @desc データ内容。例: info.count等
 * @type string
 * 
 * @param x
 * @desc 窓に対しての座標X
 * @type number
 * @default 0
 * 
 * @param y
 * @desc 窓に対しての座標Y
 * @type number
 * @default 0
 * 
 * @param width
 * @desc 横幅限度
 * @type number
 * @default 0
 * 
 * @param outlineColor
 * @desc 文字アウトライン色。0でデフォルト
 * @type number
 * @default 0
 * 
 * @param fontColor
 * @desc 文字色。0でデフォルト
 * @type number
 * @default 0
 * 
 * @param fontSize
 * @desc 文字サイズ。0でデフォルト
 * @type number
 * @default 0
 * 
 * @param fontFace
 * @desc 文字フォント。空欄でデフォルト
 * @type string
*/
/*~struct~WindowInfoPictures:
 * 
 * @param fileName
 * @desc ファイル名の文字列。スクリプト使用可
 * @type string
 * 
 * @param folderName
 * @desc フォルダ名。/可。スクリプト不可
 * @type string
 * 
 * @param x
 * @desc 窓に対しての座標X
 * @type number
 * @default 0
 * 
 * @param y
 * @desc 窓に対しての座標Y
 * @type number
 * @default 0
 * 
 * @param scale
 * @desc 横幅限度
 * @type number
 * @default 1
*/
/*~struct~WindowInfoGauges:
 * 
 * @param currentValue
 * @desc 変動／現在値
 * @type string
 * 
 * @param maxValue
 * @desc 最大値
 * @type string
 * 
 * @param x
 * @desc 窓に対しての座標X
 * @type number
 * @default 0 
 * 
 * @param y
 * @desc 窓に対しての座標Y
 * @type number
 * @default 0
 * 
 * @param width
 * @desc 横幅限度
 * @type number
 * @default 100
 * 
 * @param backColor
 * @desc ゲージ背景色ID
 * @type number
 * @default 20
 * 
 * @param frontColor
 * @desc ゲージ色ID
 * @type number
 * @default 21
*/
 

(() => {
    const script = "kzmz_SaveMenu";
    const parameters = PluginManager.parameters(script);

    const _saveWindowRow = Number(parameters['SaveFile Rows']);
    const _saveWindowColumn = Number(parameters['SaveFile Cols']);

    const _saveInfo = JSON.parse(parameters['Save Info']).map(e => JSON.parse(e)) || [];
    const _saveWindowText = JSON.parse(parameters['Window Text Elements']).map(e => JSON.parse(e)) || [];
    const _saveWindowPicture = JSON.parse(parameters['Window Picture Elements']).map(e => JSON.parse(e)) || [];
    const _saveWindowDimension = JSON.parse(parameters['Save Window']) || {};

    const _detailWindowText = JSON.parse(parameters['Detail Text Elements']).map(e => JSON.parse(e)) || [];
    const _detailWindowPicture = JSON.parse(parameters['Detail Picture Elements']).map(e => JSON.parse(e)) || [];
    const _detailWindowDimension = JSON.parse(parameters['Detail Window']) || {};

    const _charWalkGraphic = (parameters['Display Character Walk Graphic'] == 'true');
    const _charWalkGraphicX = Number(parameters['Display Character Walk Graphic X']);
    const _charWalkGraphicY = Number(parameters['Display Character Walk Graphic Y']);

    const _d_charWalkGraphic = (parameters['Detail Character Walk Graphic'] == 'true');
    const _d_charWalkGraphicX = Number(parameters['Detail Character Walk Graphic X']);
    const _d_charWalkGraphicY = Number(parameters['Detail Character Walk Graphic Y']);

    const _ssInfo = JSON.parse(parameters['Screenshot']) || {};
    const _cursorData = JSON.parse(parameters['Cursor']) || {};

    const _sceneBackground = parameters['Scene Background'];
    const _displayWindowBack = (parameters['Display Window Frame'] == 'true')

    const kz_SceneManager_snapForBackground = SceneManager.snapForBackground;
    SceneManager.snapForBackground = function () {
        kz_SceneManager_snapForBackground.call(this);
        if (this._saveBackgroundBitmap) {
            this._saveBackgroundBitmap.destroy();
        }
        const properWidth = Math.round(this._backgroundBitmap.width * _ssInfo.scale);
        const properHeight = Math.round(this._backgroundBitmap.height * _ssInfo.scale);
        this._saveBackgroundBitmap = new Bitmap(properWidth, properHeight);
        this._saveBackgroundBitmap.blt(this._backgroundBitmap, 0, 0, this._backgroundBitmap.width, this._backgroundBitmap.height, 0, 0, properWidth, properHeight)
    };

    SceneManager.saveBackgroundBitmap = function () {
        return this._saveBackgroundBitmap;
    };

    DataManager.makeSavefileInfo = function () {
        const info = {};
        if (_charWalkGraphic || _d_charWalkGraphic) {
            info.characters = $gameParty.charactersForSavefile();
        }
        _saveInfo.forEach(e => {
            info[e.name] = eval(e.data);
        }, this);
        if (_ssInfo.scale > 0) {
            info.screenShotData = SceneManager.saveBackgroundBitmap()._canvas.toDataURL();
        }
        return info;
    };

    ImageManager.loadSaveScene = function (filename) {
        return this.loadBitmap("img/savescene/", filename);
    };

    ImageManager.loadAnyFolder = function (filename, folderName) {
        return this.loadBitmap(`img/${folderName}/`, filename);
    };

    const kz_Scene_File_prototype_createHelpWindow = Scene_File.prototype.createHelpWindow;
    Scene_File.prototype.createHelpWindow = function () {
        kz_Scene_File_prototype_createHelpWindow.call(this);
        const rect = new Rectangle(_detailWindowDimension.x, _detailWindowDimension.y, _detailWindowDimension.width, _detailWindowDimension.height);
        this._detailWindow = new Window_SaveDetail(rect);
        this.addWindow(this._detailWindow);
    };

    const kz_Scene_File_prototype_createListWindow = Scene_File.prototype.createListWindow;
    Scene_File.prototype.createListWindow = function () {
        kz_Scene_File_prototype_createListWindow.call(this);
        this._listWindow.setDetailWindow(this._detailWindow);
    };

    const kz_Scene_File_prototype_createBackground = Scene_File.prototype.createBackground;
    Scene_File.prototype.createBackground = function () {
        kz_Scene_File_prototype_createBackground.call(this);

        this._backgroundSpriteNew = new Sprite();
        this._backgroundSpriteNew.bitmap = ImageManager.loadSaveScene(_sceneBackground);
        this.addChild(this._backgroundSpriteNew);
    };


    const _kzmz_Window_SavefileList_prototype_initialize = Window_SavefileList.prototype.initialize;
    Window_SavefileList.prototype.initialize = function (rect) {
        const newRect = new Rectangle(_saveWindowDimension.x, _saveWindowDimension.y, _saveWindowDimension.width, _saveWindowDimension.height)
        _kzmz_Window_SavefileList_prototype_initialize.call(this, newRect);
        this._padding = 0;
        this._updateClientArea();
        this.extraPicSprite = [];
        this._detailWindow = null;
        if (!_displayWindowBack) {
            this.setBackgroundType(2);
        }
        this.extraCursorSprite = new Sprite_SaveCursor();
        this.addChild(this.extraCursorSprite);
    };

    Window_SavefileList.prototype.refreshCursor = function() {
        this.setCursorRect(0, 0, 0, 0);
        if (this.index() >= 0) {
            const rect = this.itemRect(this.index());
            this.extraCursorSprite.x = rect.x + Number(_cursorData.x);
            this.extraCursorSprite.y = rect.y + Number(_cursorData.y);
        }
    };


    Window_SavefileList.prototype.setDetailWindow = function (detailWindow) {
        this._detailWindow = detailWindow;
        this.callUpdateHelp();
    };

    const kz_Window_SavefileList_prototype_drawItemBackground = Window_SavefileList.prototype.drawItemBackground;
    Window_SavefileList.prototype.drawItemBackground = function (index) {
        if (_displayWindowBack) {
            kz_Window_SavefileList_prototype_drawItemBackground.call(this, index);
        }
    };

    const kz_Window_SavefileList_prototype_callUpdateHelp = Window_SavefileList.prototype.callUpdateHelp;
    Window_SavefileList.prototype.callUpdateHelp = function () {
        kz_Window_SavefileList_prototype_callUpdateHelp.call(this);
        if (this.active && this._detailWindow) {
            this.updateDetail();
        }
    };

    Window_SavefileList.prototype.updateDetail = function () {
        const savefileId = this.indexToSavefileId(this.index());
        const info = DataManager.savefileInfo(savefileId);
        this._detailWindow.setItem(info, savefileId);
    };

    Window_SavefileList.prototype.drawItem = function (index) {
        const savefileId = this.indexToSavefileId(index);
        const info = DataManager.savefileInfo(savefileId);
        const rect = this.itemRectWithPadding(index);

        if (!info) {
            this.resetTextColor();
            this.changePaintOpacity(this.isEnabled(savefileId));
            this.drawTitle(savefileId, rect.x, rect.y + 4);
        }
        if (info) {
            this.drawContents(info, rect, savefileId);
        }
    };

    Window_SavefileList.prototype.drawContents = function (info, rect, currentId) {
        _saveWindowPicture.forEach(function (obj) {
            var realName = eval(obj.fileName);
            var picSprite = new Sprite();
            picSprite.bitmap = ImageManager.loadAnyFolder(realName, obj.folderName);
            picSprite.x = Number(obj.x) + rect.x;
            picSprite.y = Number(obj.y) + rect.y;

            this.addChild(picSprite);
            this.extraPicSprite.push(picSprite)
        }, this);

        this.changePaintOpacity(this.isEnabled(currentId));
        _saveWindowText.forEach(function (obj) {
            const currentOutlineColor = this.contents.outlineColor;
            if (obj.fontFace) { this.contents.fontFace = obj.fontFace; }
            if (obj.fontColor > 0) { this.changeTextColor(ColorManager.textColor(Number(obj.fontColor))); }
            if (obj.outlineColor > 0) { this.contents.outlineColor = ColorManager.textColor(Number(obj.outlineColor)); }
            if (obj.fontSize > 0) { this.contents.fontSize = Number(obj.fontSize); }

            this.drawText(eval(obj.data), rect.x + Number(obj.x), rect.y + Number(obj.y), Number(obj.width));
            this.resetFontSettings();
            this.contents.outlineColor = currentOutlineColor;
        }, this);

        if (_charWalkGraphic) {
            this.drawPartyCharacters(info, rect.x + _charWalkGraphicX, rect.y + _charWalkGraphicY);
        }
    };

    Window_SavefileList.prototype.removeAllExtraPic = function () {
        if (!this.extraPicSprite) return;
        this.extraPicSprite.forEach(function (e) {
            this.removeChild(e);
        }, this)
        this.extraPicSprite = [];
    }

    const kz_Window_SavefileList_prototype_paint = Window_SavefileList.prototype.paint;
    Window_SavefileList.prototype.paint = function () {
        this.removeAllExtraPic();
        kz_Window_SavefileList_prototype_paint.call(this);
    };

    Window_SavefileList.prototype.numVisibleRows = function () {
        return _saveWindowRow;
    };

    Window_SavefileList.prototype.maxCols = function () {
        return _saveWindowColumn;
    };

    //Window_SaveDetail
    function Window_SaveDetail() {
        this.initialize(...arguments);
    }

    Window_SaveDetail.prototype = Object.create(Window_Base.prototype);
    Window_SaveDetail.prototype.constructor = Window_SaveDetail;

    Window_SaveDetail.prototype.initialize = function (rect) {
        Window_Base.prototype.initialize.call(this, rect);
        this._item = null;
        this._picSpriteList = [];
        this._listDetailIndex = "";
        this.createPicSprites();
        if (!_displayWindowBack) {
            this.setBackgroundType(2);
        }
    };

    Window_SaveDetail.prototype.clear = function () {
        this.setText(null);
    };

    Window_SaveDetail.prototype.setItem = function (infoItem, currentId) {
        if (this._item != infoItem) {
            this._item = infoItem;
            this._listDetailIndex = currentId;
            this.refresh();
        }
    };

    Window_SaveDetail.prototype.refresh = function () {
        const rect = this.baseTextRect();
        this.contents.clear();

        
        if (!this._item) 
        {
            _detailWindowPicture.forEach(function (obj, i) {
                this._picSpriteList[i].bitmap = null;
            }, this);
            this._ssSprite.bitmap = null;
            return;
        }
        const currentId = this._listDetailIndex ? this._listDetailIndex : "";
        const info = this._item;

        _detailWindowPicture.forEach(function (obj, i) {
            this._picSpriteList[i].bitmap = ImageManager.loadAnyFolder(eval(obj.fileName), obj.folderName);
            this._picSpriteList[i].x = obj.x;
            this._picSpriteList[i].y = obj.y;
            this._picSpriteList[i].scale.x = obj.scale;
            this._picSpriteList[i].scale.y = obj.scale;
        }, this);

        _detailWindowText.forEach(function (obj) {
            const currentOutlineColor = this.contents.outlineColor;
            if (obj.fontFace) { this.contents.fontFace = obj.fontFace; }
            if (obj.fontColor > 0) { this.changeTextColor(ColorManager.textColor(Number(obj.fontColor))); }
            if (obj.outlineColor > 0) { this.contents.outlineColor = ColorManager.textColor(Number(obj.outlineColor)); }
            if (obj.fontSize > 0) { this.contents.fontSize = Number(obj.fontSize); }

            this.drawText(eval(obj.data), rect.x + Number(obj.x), rect.y + Number(obj.y), Number(obj.width));
            this.resetFontSettings();
            this.contents.outlineColor = currentOutlineColor;
        }, this);

        if (_d_charWalkGraphic) {
            this.drawPartyCharacters(info, rect.x + _d_charWalkGraphicX, rect.y + _d_charWalkGraphicY);
        }

        if (this._ssSprite) {
            this._ssSprite.bitmap = Bitmap.load(info.screenShotData);
        }

    };

    Window_SaveDetail.prototype.createPicSprites = function () {
        _detailWindowPicture.forEach(function (obj) {
            const picSprite = new Sprite();
            this._picSpriteList.push(picSprite);
            this.addChild(picSprite);
        }, this);
        if (_ssInfo.scale > 0) {
            this._ssSprite = new Sprite();
            this._ssSprite.x = _ssInfo.x;
            this._ssSprite.y = _ssInfo.y;
            this.addChild(this._ssSprite);
        }
    }

    Window_SaveDetail.prototype.drawPartyCharacters = function (info, x, y) {
        if (info.characters) {
            let characterX = x;
            for (const data of info.characters) {
                this.drawCharacter(data[0], data[1], characterX, y);
                characterX += 48;
            }
        }
    };

    //---ex for debugging---

    Scene_Save.prototype.executeSave = function (savefileId) {
        $gameSystem.setSavefileId(savefileId);
        $gameSystem.onBeforeSave();
        DataManager.saveGame(savefileId)
            .then(() => this.onSaveSuccess())
            .catch((e) => this.onSaveFailure(e));
    };

    Scene_Save.prototype.onSaveFailure = function (e) {
        console.log(e);
        SoundManager.playBuzzer();
        this.activateListWindow();
    };

    function Sprite_SaveCursor() {
        this.initialize(...arguments);
    }
    
    Sprite_SaveCursor.prototype = Object.create(Sprite.prototype);
    Sprite_SaveCursor.prototype.constructor = Sprite_Clickable;
    
    Sprite_SaveCursor.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);
        this.bitmap = ImageManager.loadSaveScene(_cursorData.pic);
        this._anime_count = 0;
        this._intervalCount = 0;
        this.setFrame(0,0,Number(_cursorData.width),Number(_cursorData.height))
    };
    
    Sprite_SaveCursor.prototype.update = function() {
        Sprite.prototype.update.call(this);
        this.refreshFrame();
    };

    Sprite_SaveCursor.prototype.refreshFrame = function() {
        this._intervalCount++;
        if (this._intervalCount > Number(_cursorData.interval))
        {
            this._intervalCount = 0;
            this._anime_count++;
            if (this._anime_count > this.maxFrame())
            {
                this._anime_count = 0;
            }
            this.setFrame(this._anime_count * Number(_cursorData.width) ,0,Number(_cursorData.width),Number(_cursorData.height));
        }
    };

    Sprite_SaveCursor.prototype.maxFrame = function() {
        return Number(_cursorData.anime_count) - 1;
    };

})();