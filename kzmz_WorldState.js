/*:ja
 * @plugindesc フィールド魔法スキル作成
 * @author 剣崎宗二
 *
 * @target MZ
 *
 * @param baseY
 * @desc ステート名の窓上からの距離
 * @type number
 * @default 10
 * 
 * @param WindowWidth
 * @desc ステート表示窓横幅
 * @type number
 * @default 600
 * 
 * @param WindowHeight
 * @desc ステート表示窓縦幅
 * @type number
 * @default 500
 * 
 * @param NameOverheadX
 * @desc 名前の左からの距離
 * @type number
 * @default 40
 * 
 * @param DescOverheadX
 * @desc 解説の左からの距離
 * @type number
 * @default 120
 * 
 * @param TurnOverheadX
 * @desc ターン数の左からの距離
 * @type number
 * @default 120
 * 
 * @param LineDistance
 * @desc 行同士の距離
 * @type number
 * @default 40
 * 
 * @param NameFontSize
 * @desc 名前フォントサイズ
 * @type number
 * @default 20
 * 
 * @param DescFontSize
 * @desc 解説フォントサイズ
 * @type number
 * @default 20
 * 
 * @param WindowX
 * @desc ステート窓X
 * @type number
 * @default 100
 * 
 * @param WindowY
 * @desc ステート窓Y
 * @type number
 * @default 100
 *
 *@help
 *必須----スキルの「メモ」欄に
 *<addWorldStates:[ステートID],[持続ターン]>
 *戦闘中ずっとかかっていて欲しいスキルはターンを-1
 *
 *ワールドステート用のステートメモ欄に
 *
 *<allystate:[味方に付与するステートID]>
 *<enemystate:[敵に付与するステートID]>
 *
 *この2つを追記すると、敵味方にそれぞれ違う効果を付与できる
 *入れなかった場合はワールドに付与されたステートがそのまま敵味方に両方コピーされる
 *（どちらか一方にかけたい場合はダミーステート入れると吉。）
 *
 * 打ち消すスキル
 *<removeWorldStates:[消すヤツのID]>
 *
 *<removeWorldStates:3>
 *<removeWorldStates:4>
 *<removeWorldStates:5>
 *などの用に連装可。擬似的に「上書き」を行うことは出来る
 *例：add4 　remove 5,6,7（ワールドステート4を付与し5.6.7を解除）
 *
 *<worldStatePic:abc> abc.pngをpicture内wstフォルダよりロードし、ワールドステート維持中表示する
 */

(function () {

    const script = "kzmz_WorldState";
    const parameters = PluginManager.parameters(script);

    const baseY = Number(parameters['baseY']);

    const windowWidth = Number(parameters['WindowWidth']);
    const windowHeight = Number(parameters['WindowHeight']);

    const NameOverheadX = Number(parameters['NameOverheadX']);
    const DescOverheadX = Number(parameters['DescOverheadX']);
    const TurnOverheadX = Number(parameters['TurnOverheadX']);

    const vd = Number(parameters['LineDistance']);

    const fontSizeName = Number(parameters['NameFontSize']);
    const fontSizeDesc = Number(parameters['DescFontSize']);

    const windowX = Number(parameters['WindowX']);
    const windowY = Number(parameters['WindowY']);

    //---------------[初期化]------------------------

    const kz_BattleManager_initMembers = BattleManager.initMembers;
    BattleManager.initMembers = function () {
        this.worldState = [];
        this.worldStateTurns = [];
        this.worldStatePicSprites = [];
        kz_BattleManager_initMembers.call(this);
    }

    const kz_BattleManager_endBattle = BattleManager.endBattle;
    BattleManager.endBattle = function (result) {
        kz_BattleManager_endBattle.call(this, result);
        this.worldState = [];
        this.worldStateTurns = [];
        this.worldStatePicSprites = [];
    };

    ImageManager.loadWorldStatesPic = function (filename) {
        return this.loadBitmap("img/pictures/wst/", filename);
    };

    //-------------------------------[判定表示系]-------------------------------

    const kz_Game_BattlerBase_prototype_isStateAffected = Game_BattlerBase.prototype.isStateAffected;
    Game_BattlerBase.prototype.isStateAffected = function (stateId) {
        if (BattleManager.worldState && BattleManager.worldState.length > 0) {
            return this._states.concat(BattleManager.worldState).contains(stateId);
        }
        else {
            return kz_Game_BattlerBase_prototype_isStateAffected.call(this, stateId);
        }
    };

    const kz_Game_BattlerBase_prototype_states = Game_BattlerBase.prototype.states;
    Game_BattlerBase.prototype.states = function () {
        if (BattleManager.worldState && BattleManager.worldState.length > 0) {
            const worldStateMap = BattleManager.worldState.flatMap(function (id) {
                const target = $dataStates[id];
                let extraState = [];
                if (this.isActor() && target.metaArray.allystate) {
                    target.metaArray.allystate.forEach(function (element) {
                        extraState.push($dataStates[Number(element)]);
                    }, this)
                }
                if (this.isEnemy() && target.metaArray.enemystate) {
                    target.metaArray.enemystate.forEach(function (element) {
                        extraState.push($dataStates[Number(element)]);
                    }, this)
                }

                if (extraState.length > 0) {
                    return extraState;
                }

                return [$dataStates[id]];
            }, this);
            
            let result = kz_Game_BattlerBase_prototype_states.call(this).concat(worldStateMap);
            return result;
        }
        return kz_Game_BattlerBase_prototype_states.call(this);
    };


    Spriteset_Base.prototype.refreshWorldState = function (worldStateTurns) {
    }

    Spriteset_Battle.prototype.refreshWorldState = function (worldStateTurns) {
        const worldStateDisplay = BattleManager.worldState.map(function (id) {
            let result = {};
            result.iconIndex = $dataStates[id].iconIndex;
            result.name = $dataStates[id].name;
            result.description = $dataStates[id].message4;
            result.turns = worldStateTurns[id];
            return result;
        });
        //------各表示用パラメーター-------

        if (!this._worldStateWindow) {
            this._worldStateWindow = new Sprite();
            this._worldStateWindow.bitmap = new Bitmap(windowWidth, windowHeight);
            this._battleField.addChild(this._worldStateWindow);
            this._worldStateWindow.x = windowX;
            this._worldStateWindow.y = windowY;
        }
        else {
            this._worldStateWindow.bitmap.clear();
        }

        var originalFontSize = this._worldStateWindow.bitmap.fontSize;
        let y = baseY;

        worldStateDisplay.forEach(function (result) {    
            let iconIndex = result.iconIndex;

            this._worldStateWindow.bitmap.fontSize = fontSizeName;
            this._worldStateWindow.bitmap.drawText(result.name, NameOverheadX, y, DescOverheadX - NameOverheadX - 5, vd, 'left'); //ステート名

            this._worldStateWindow.bitmap.fontSize = fontSizeDesc;
            this._worldStateWindow.bitmap.drawText(result.description, TurnOverheadX - DescOverheadX - 5, y, 200, vd, 'left'); //ステート説明
            this._worldStateWindow.bitmap.drawText(result.turns + "T", TurnOverheadX, y, 50, vd, 'left'); //ターン数

            const bitmapSource = ImageManager.loadSystem('IconSet');

            var pw = 32;
            var ph = 32;
            var sx = iconIndex % 16 * pw;
            var sy = Math.floor(iconIndex / 16) * ph;

            this._worldStateWindow.bitmap.blt(bitmapSource, sx, sy, pw, ph, 0, y, pw, ph)
            y += vd;
        }, this);
        this._worldStateWindow.bitmap.fontSize = originalFontSize;
    }
    //-------------------------------付加排除系----------------------------------
    BattleManager.addWorldStates = function (stateId, turns) {
        if (this.worldState.indexOf(stateId) < 0) {
            this.worldState.push(stateId);
        }
        this.worldStateTurns[stateId] = turns;

        const stateData = $dataStates[stateId];
        if (stateData.meta.worldStatePic) {
            this.worldStatePicSprites[stateId] = new Sprite();
            this.worldStatePicSprites[stateId].bitmap = ImageManager.loadWorldStatesPic(stateData.meta.worldStatePic);
            this.worldStatePicSprites[stateId].x = Number(stateData.meta.worldStatePicX) || 0;
            this.worldStatePicSprites[stateId].y = Number(stateData.meta.worldStatePicY) || 0;
            this.worldStatePicSprites[stateId].blendMode = Number(stateData.meta.worldStatePicBlend) || 1;
            SceneManager._scene._spriteset._back2Sprite.addChild(this.worldStatePicSprites[stateId]);
        }

        SceneManager._scene._spriteset.refreshWorldState(this.worldStateTurns);
    }

    BattleManager.eraseWorldStates = function (stateId) {
        var index = this.worldState.indexOf(stateId);
        if (index >= 0) {
            this.worldState.splice(index, 1);
        }
        delete this.worldStateTurns[stateId];

        if (this.worldStatePicSprites[stateId]) {
            SceneManager._scene._spriteset._back2Sprite.removeChild(this.worldStatePicSprites[stateId]);
            this.worldStatePicSprites[stateId] = null;
        }

        SceneManager._scene._spriteset.refreshWorldState(this.worldStateTurns);
    }

    var kz_Game_Action_prototype_apply = Game_Action.prototype.apply;
    Game_Action.prototype.apply = function (target) {
        kz_Game_Action_prototype_apply.call(this, target);
        var actionMeta = this.item().metaArray;
        if (actionMeta.addWorldStates) {
            actionMeta.addWorldStates.forEach(function (element) {
                var splitArray = element.split(",");
                BattleManager.addWorldStates(Number(splitArray[0]), Number(splitArray[1]));
            }, this);
        }
        if (actionMeta.removeWorldStates) {
            actionMeta.removeWorldStates.forEach(function (element) {
                BattleManager.eraseWorldStates(Number(element));
            }, this);
        }
    };

    BattleManager.endTurnWorldStatesProcess = function () {
        this.worldState.forEach(function (stateId) {
            if (this.worldStateTurns[stateId] > 0) {
                this.worldStateTurns[stateId]--;
            }

            if (this.worldStateTurns[stateId] == 0) {
                this.eraseWorldStates(stateId);
            }
            else {
                SceneManager._scene._spriteset.refreshWorldState(this.worldStateTurns);
            }

        }, this)
    }

    var kz_BattleManager_updateTurnEnd = BattleManager.updateTurnEnd;
    BattleManager.updateTurnEnd = function () {
        kz_BattleManager_updateTurnEnd.call(this);
        this.endTurnWorldStatesProcess();
    }

    //-------------------------------その他エクストラ---------------------------
    var kz_DataManager_extractMetadata = DataManager.extractMetadata;
    DataManager.extractMetadata = function (data) {
        var re = /<([^<>:]+)(:?)([^>]*)>/g;
        data.metaArray = {};
        for (; ;) {
            var match = re.exec(data.note);
            if (match) {
                if (!data.metaArray[match[1]]) {
                    data.metaArray[match[1]] = [];
                }
                if (match[2] === ':') {
                    data.metaArray[match[1]].push(match[3]);
                }
            } else {
                break;
            }
        }
        kz_DataManager_extractMetadata.call(this, data);
    }

})();
