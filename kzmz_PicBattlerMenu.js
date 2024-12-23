/*:ja
 * @plugindesc バトルコマンドの画像化（動き有） - v1.03
 * @author 剣崎宗二
 * 
 * @target MZ
 *
 * @param icon width
 * @desc 画像アイコンの横幅
 * @type number
 * @min 0
 * @default 100
 *
 * @param icon height
 * @desc 画像アイコンの一つ辺りの縦幅
 * @type number
 * @min 0
 * @default 100
 *
 * @param icon itemrect
 * @desc アイコンの間隔
 * @type number
 * @min 0
 * @default 10
 *
 * @param icon cols
 * @desc アイコンを横に並べる数
 * @type number
 * @min 1
 * @default 4 
 *
 * @param icon maxexpansion
 * @desc アイコンの拡縮率
 * @type number
 * @min 0
 * @decimals 2
 * @default 0.1
 * 
 * @param selected icon slide frame
 * @desc 選択されたアイコンが右にスライドするまでに掛かるフレーム数
 * @type number
 * @min 0
 * @default 0
 * 
 * @param selected icon slide pixels
 * @desc 1フレーム辺り選択されたアイコンが右にスライドする量
 * @type number
 * @min -99999
 * @default 0
 *
 * @param x overhead
 * @desc アイコンを並べる開始位置x
 * @type number
 * @min 0
 * @default 0
 *
 * @param y overhead
 * @desc アイコンを並べる開始位置y
 * @type number
 * @min 0
 * @default 0
 *
 * @param commandwindow x
 * @desc コマンドウインドウの位置ｘ
 * @type number
 * @min -99999
 * @default 0
 *
 * @param commandwindow y
 * @desc コマンドウインドウの位置y
 * @type number
 * @min -99999
 * @default 0
 *
 * @param commandwindow width
 * @desc コマンドウインドウの幅
 * @type number
 * @min 0
 * @default 240
 *
 * @param commandwindow height
 * @desc コマンドウインドウの高さ
 * @type number
 * @min 0
 * @default 500
 * 
 * @param display disabled item
 * @desc 封印されたコマンドを表示するか？
 * @type boolean
 * @on YES
 * @off NO
 * @default false
 *
 * @param display cursor
 * @desc カーソルを表示/消去
 * @type boolean
 * @on YES
 * @off NO
 * @default true
 * 
 * @param window background file
 * @desc メニューウィンドウの背景ファイル。空白でデフォルト仕様になります。
 * @type string
 * @default 
 * 
 * @param Symbol Chart
 * @desc シンボルと画像の対照表
 * @type struct<SymbolChart>[]
 * @default []
 * 
 * @param Item Data
 * @desc 各項目のアニメーションデータ（並び順はメニューと同じ）
 * @type struct<MenuItemData>[]
 * @default []
 *
 * @help kzmz_PicBattleMenu.js
 * 
 * 使用する画像は全て img/system　フォルダ内に入れてください。
 *
 * □アイコン用画像…  symbol毎に用意下さい。サイズ、名前は任意です。
 *　　　　　　　　　　但しサイズがicon width/ icon heightで設定された
 *　　　　　　　　　　数値以上、以下の場合パラメータの数値サイズに
 *　　　　　　　　　　自動で縮小/拡大されます。
 *
 * □ウインドウ背景用画像…名称任意、パラメータ【window background file】
 *　 画像を使用しないがウインドウを透過したい場合は1 × 1 pixelの
 *　 透過画像を用意してその名前をパラメータに入れて下さい。
 *
 * □本体ver1.5.2以上の環境を想定しております、それ以下の環境下で
 *　 ご使用の場合何らかの不具合が出る可能性があります。　
 *
 * □フォントについて、デフォルトの数字フォントはrmmz-numberfont、通常フォントはrmmz-mainfontを指定してください。
 * 　他のフォントを使用する場合はkzmz_FontRegistrationを導入する必要があります。
 *
 * ■デフォルトsymbol名一覧
 * 　アイテム　…　item
 * 　スキル　　…　skill
 * 　攻撃　　　…　attack
 * 　防御　　　…　guard
 *
 * 別のプラグインで新しいコマンドを追加した場合
 * それらのsymbolを入力する事で同様に対応可能です。
 *
 * Special Thanks: サイリ(Twitter:sairi55)-アイデア発案、及びサンプル素材制作
 * 
 * 
 * 更新履歴
 * v1.03 - 選択肢したコマンドが横スライドする機能を追加（パラメーター「selected icon slide frame」「selected icon slide pixels」）
 * v1.02 - Window_ActorCommandのコマンドのenableがfalseの場合、コマンド自体を消去するのではなく半透明にする（パラメーターdisplay disabled itemで切り替え可）
 * v1.01 - Spriteの構成タイミング変更し、コマンドの内容が違うキャラに対応
 * v1.00 - kzmz_PicMenuをベースに製造
 *
*/
/*~struct~SymbolChart:
 * @param symbol
 * @desc シンボル（item, skills等）
 * @type string
 * 
 * @param pic
 * @desc ピクチャ名
 * @type string
 * 
 * @param ext
 * @desc スキル等同じシンボルで複数ある物の指定(skillの場合、typeId)
 * @type string
 * 
*/
/*~struct~MenuItemData:
 * 
 * @param startFrame
 * @desc 動き始めるフレーム数
 * @type number
 * @default 0
 * 
 * @param endFrame
 * @desc 動き終えるフレーム数
 * @type number
 * @default 0
 * 
 * @param x
 * @desc 始動時x座標(終着点を0とした場合の相対)
 * @type number
 * @min -99999
 * @default 0
 * 
 * @param y
 * @desc 始動時y座標(終着点を0とした場合の相対)
 * @type number
 * @min -99999
 * @default 0
 * 
 * @param endx
 * @desc 終了時x座標(デフォルト位置を0とした場合)
 * @type number
 * @min -99999
 * @default 0
 * 
 * @param endy
 * @desc 終了時y座標(デフォルト位置を0とした場合)
 * @type number
 * @min -99999
 * @default 0
 * 
 * @param alpha
 * @desc 始動時透明度(終着点は255)
 * @type number
 * @default 255
*/


(() => {

    const script = "kzmz_PicBattlerMenu";
    const parameters = PluginManager.parameters(script);

    const _cmdList = JSON.parse(parameters['Item Data']).map(
        function (e) {
            let newObj = JSON.parse(e);
            return newObj;
        }
    ) || [];

    const _symbolList = JSON.parse(parameters['Symbol Chart']).map(
        function (e) {
            let newObj = JSON.parse(e);
            return newObj;
        }
    ) || [];

    const defaultCmd = { startFrame: 0, endFrame: 0, x: 0, y: 0, alpha: 255, endx: 0, endy: 0 }

    function findwithSameSymbol(array, element) {
        if (!array || !element) return undefined;

        for (let i = 0; i < array.length; i++) { 
            if (array[i].symbol == element.symbol){
                if (!element.ext || element.ext == array[i].ext) 
                {
                    return array[i];
                }
            }
        }

        return undefined;
    }

    const _MenuIconWidth = Number(parameters['icon width'] || 100);
    const _MenuIconHeight = Number(parameters['icon height'] || 100);
    const _IconitemRect = Number(parameters['icon itemrect'] || 10);
    const _iconcols = Number(parameters['icon cols'] || 4);
    const _MaxExpansion = Number(parameters['icon maxexpansion'] || 0.1);
    const _xOverhead = Number(parameters['x overhead'] || 0);
    const _yOverhead = Number(parameters['y overhead'] || 0);

    const _selectedSlideFrame = eval(parameters['selected icon slide frame']);
    const _selectedSlideX = eval(parameters['selected icon slide pixels']);

    const _CwindowX = Number(parameters['commandwindow x'] || 0);
    const _CwindowY = Number(parameters['commandwindow y'] || 0);
    const _CwindowWidth = Number(parameters['commandwindow width'] || 240);
    const _CwindowHeight = Number(parameters['commandwindow height'] || 500);

    const _cursorDisplay = eval(parameters['display cursor']);
    const _sealedDisplay = eval(parameters['display disabled item']);

    const _windowBack = parameters['window background file'] || '';


    const kz_Window_ActorCommand_prototype_initialize = Window_ActorCommand.prototype.initialize;
    Window_ActorCommand.prototype.initialize = function (rect) {
        this._commandSprites = [];
        const properRect = new Rectangle(_CwindowX, _CwindowY, _CwindowWidth, _CwindowHeight)
        kz_Window_ActorCommand_prototype_initialize.call(this, properRect);
        if (_windowBack != '') {
            this.setBackgroundType(2);
            this.createBackSprite();
        }
        this.makeCommandSprites();
        this.select(0);
    };

    Window_ActorCommand.prototype.createBackSprite = function () {
        this._backSprite = new Sprite();
        this._backSprite.bitmap = ImageManager.loadSystem(_windowBack);
        this.addChildToBack(this._backSprite);
    };

    Window_ActorCommand.prototype.drawItem = function (index) {
    };

    Window_ActorCommand.prototype.drawBackgroundRect = function (rect) {
    };

    const kz_Window_ActorCommand_prototype_refresh = Window_ActorCommand.prototype.refresh
    Window_ActorCommand.prototype.refresh = function() {
        kz_Window_ActorCommand_prototype_refresh.call(this);
        if (this._commandSprites && this._commandSprites.length > 0)
        {
            this._commandSprites.forEach(e => this.removeChild(e), this);
        }
        this.makeCommandSprites();
    };
    

    const kz_Window_ActorCommand_prototype__updateCursor = Window_ActorCommand.prototype._updateCursor;
    Window_ActorCommand.prototype._updateCursor = function () {
        kz_Window_ActorCommand_prototype__updateCursor.call(this);
        this._cursorSprite.visible = false;
    };

    Window_ActorCommand.prototype.makeCommandSprites = function () {
        this._commandSprites = [];
        this._list.forEach(function (element, i) {
            if (!element.enabled && !_sealedDisplay) return;
            
            const symbolData = findwithSameSymbol(_symbolList, element);

            if (!symbolData) {
                console.log(element);
                console.log(_symbolList);
            }

            const itemData = _cmdList[i] ? _cmdList[i] : defaultCmd;
            const editedRect = this.itemRect(i);
            editedRect.x = editedRect.x + Number(itemData.endx);
            editedRect.y = editedRect.y + Number(itemData.endy);

            let sprite = new Sprite_BattleActorCommand(itemData, editedRect, element.symbol, this, i, element.enabled);
            sprite.bitmap = ImageManager.loadSystem(symbolData ? symbolData.pic : "");
            this._commandSprites.push(sprite);
            this.addChild(sprite);
        }, this);
    };

    const kz_Window_ActorCommand_prototype_setHandler = Window_ActorCommand.prototype.setHandler;
    Window_ActorCommand.prototype.setHandler = function (symbol, method) {
        kz_Window_ActorCommand_prototype_setHandler.call(this, symbol, method);
        this._commandSprites.forEach(function (element) {
            if (element.getSymbol() == symbol) {
                element.setButtonHandler(method);
            }
        }, this);
    };

    Window_ActorCommand.prototype.itemWidth = function () {
        return _MenuIconWidth;
    };

    Window_ActorCommand.prototype.itemHeight = function () {
        return _MenuIconHeight;
    };


    const kz_Window_ActorCommand_prototype_itemRect = Window_ActorCommand.prototype.itemRect;
    Window_ActorCommand.prototype.itemRect = function (index) {
        const rect = kz_Window_ActorCommand_prototype_itemRect.call(this, index);
        const maxCols = this.maxCols();
        rect.x += _xOverhead + (index % maxCols) * _IconitemRect;
        rect.y = Math.floor(index / maxCols) * (rect.height + _IconitemRect) - this._scrollY + _yOverhead;
        return rect;
    };

    Window_ActorCommand.prototype.maxCols = function () {
        return _iconcols;  //横列数
    };

    const kz_Window_ActorCommand_prototype_select = Window_ActorCommand.prototype.select;
    Window_ActorCommand.prototype.select = function (index) {
        kz_Window_ActorCommand_prototype_select.call(this, index);
        this._commandSprites.forEach(function (element) {
            element.isSelected = false;
        }, this)

        if (index >= 0 && index < this._commandSprites.length) {
            this._commandSprites[index].isSelected = true;
        }
    };

    const kz_Window_ActorCommand_prototype_ensureCursorVisible = Window_ActorCommand.prototype.ensureCursorVisible
    Window_ActorCommand.prototype.ensureCursorVisible = function (smooth) {
        if (!_cursorDisplay) {
            return false;
        }
        return kz_Window_ActorCommand_prototype_ensureCursorVisible.call(this, smooth);
    };

    const kz_Window_ActorCommand_prototype_processCursorMove = Window_ActorCommand.prototype.processCursorMove;
    Window_ActorCommand.prototype.processCursorMove = function () {
        if (!this.isControlAllowed()) return;
        kz_Window_ActorCommand_prototype_processCursorMove.call(this);
    };

    const kz_Window_ActorCommand_prototype_processHandling = Window_ActorCommand.prototype.processHandling;
    Window_ActorCommand.prototype.processHandling = function () {
        if (!this.isControlAllowed()) return;
        kz_Window_ActorCommand_prototype_processHandling.call(this);
    };

    Window_ActorCommand.prototype.isControlAllowed = function () {
        return !this._commandSprites.some(function (e) {
            return e.animeFrameCount >= 0;
        }, this)
    };



    function Sprite_BattleActorCommand() {
        this.initialize.apply(this, arguments);
    }

    Sprite_BattleActorCommand.prototype = Object.create(Sprite_Clickable.prototype);
    Sprite_BattleActorCommand.prototype.constructor = Sprite_BattleActorCommand;

    Sprite_BattleActorCommand.prototype.initialize = function (cmdData, baseRect, symbol, parent, index, enabled) {
        Sprite_Clickable.prototype.initialize.call(this);
        this._symbol = symbol;
        this._index = index;
        this._parentWindow = parent;
        this.baseRect = baseRect;
        this.cmdData = cmdData;
        this.animeFrameCount = 0;
        this.expansionCount = 0;
        this.slideCount = 0;

        this.maxOpacity = enabled ? 255 : 100;
        this.x = Number(this.cmdData.x) + this.baseRect.x + Number(this.baseRect.height / 2);
        this.y = Number(this.cmdData.y) + this.baseRect.y + Number(this.baseRect.height / 2);
        this.opacity = Number(this.cmdData.alpha);
        this.anchor.x = 0.5;
        this.anchor.y = 0.5;
    };

    Sprite_BattleActorCommand.prototype.getSymbol = function () {
        return this._symbol;
    };

    Sprite_BattleActorCommand.prototype.setButtonHandler = function (method) {
        this._buttonHandler = method;
    };

    Sprite_BattleActorCommand.prototype.update = function () {
        Sprite_Clickable.prototype.update.call(this);
        this.updateRectFit();
        this.updateSelected();
        this.updateAnimeMove();
    };

    Sprite_BattleActorCommand.prototype.updateRectFit = function () {
        if (!this.bitmap || !this.bitmap.isReady()) return;
        this.scale.x = _MenuIconWidth / this.bitmap.width;
        this.scale.y = _MenuIconHeight / this.bitmap.height;
    }

    Sprite_BattleActorCommand.prototype.updateSelected = function () {
        if (!this.parent.isControlAllowed()) return;  //移動中は拡縮なし

        if (!this.isSelected) {
            this.expansionCount = 0;
            this.slideCount = 0;
            this.x = this.origX;
        }

        else {
            //選択されてる項目
            this.expansionCount++;
            if (this.slideCount < _selectedSlideFrame) this.slideCount++;
            this.x = this.origX + _selectedSlideX * this.slideCount;
        }

        const expScale = 1 + Math.sin((this.expansionCount % 60) / 60 * Math.PI) * _MaxExpansion;
        this.scale.x *= expScale;
        this.scale.y *= expScale;
    }

    Sprite_BattleActorCommand.prototype.updateAnimeMove = function () {
        if (!this.baseRect) {
            this.visible = false;
            return;
        }

        const keyX = this.baseRect.x + this.baseRect.width / 2;
        const keyY = this.baseRect.y + this.baseRect.height / 2;
        this.origX = keyX;
        this.origY = keyY;

        if (this.animeFrameCount < 0) return;
        this.visible = true;

        if (this.animeFrameCount >= Number(this.cmdData.endFrame)) {
            this.x = keyX;
            this.y = keyY;
            this.opacity = this.maxOpacity;
            this.animeFrameCount = -1;
            return;
        }

        if (this.animeFrameCount >= Number(this.cmdData.startFrame)) {
            const frameLeft = Number(this.cmdData.endFrame) - this.animeFrameCount;
            this.x += Math.round((keyX - this.x) / frameLeft);
            this.y += Math.round((keyY - this.y) / frameLeft);
            this.opacity += Math.round((this.maxOpacity - this.opacity) / frameLeft);
        }

        this.animeFrameCount++;
    }

    Sprite_BattleActorCommand.prototype.onClick = function () {
        if (!this._buttonHandler) {
            SoundManager.playBuzzer();
            return;
        }

        SoundManager.playOk();
        this._parentWindow.select(this._index);
        this._buttonHandler();
    };

})();