/*:ja
 * @plugindesc フィールド魔法スキル作成
 * @author 剣崎宗二
 * 
 * @param Window X
 * @desc 戦闘中のワールドステート窓のX座標です。
 * @default 30
 * 
 * @param Window Y
 * @desc 戦闘中のワールドステート窓のY座標です。
 * @default 20
 * 
 * @param Window Width
 * @desc 戦闘中のワールドステート窓の横幅です。
 * @default 600
 * 
 * @param Window Height
 * @desc 戦闘中のワールドステート窓の縦幅です。
 * @default 500
 * 
 * @param Left Overhead
 * @desc ワールドステート名のウィンドウ左端からの距離です。
 * @default 40
 * 
 * @param Top Overhead
 * @desc ワールドステートテキストの、行の上からの距離です。
 * @default 10
 * 
 * @param Name Width
 * @desc ワールドステート名の横幅です。説明文の表示位置にも影響します。
 * @default 100
 * 
 * @param Line Height
 * @desc ワールドステート1行の高さです
 * @default 20
 * 
 * @param Line Overhead
 * @desc ワールドステートの行間距離です。
 * @default 20
 * 
 * @help このプラグインにはプラグインコマンドはありません。
 *
 * スキルの「メモ」欄に
 * 
 * <addWorldStates:[ステートID],[持続ターン]>
 * で該当のステートがワールドステートとして場に付与されます。
 * このステート自体のメモ欄に何もなければ、このステート自体がそのまま全キャラクターにそのまま付与されますが、
 * <allystate:3>
 * <enemystate:5>
 * と言ったように味方と敵に別々ののステートを付与するタグをステート自体に追加する事が可能です。
 * 
 * <removeWorldStates:[消すステートのID]>
 * で該当のステートを消去します。
 * 尚これは上記の追加と併用可能であり、1スキルで既存のステートを消し、新しいステートを付与する事で
 * 擬似的な上書きとなります。
 * 
 * 尚、これらのタグは何れも複数可です。同時に付与されたり、同時に消されたりします。
 * 
 * ワールドステートの説明文には、該当のステートの「この状態が解除された時」のテキストが使用されます。
 * 尚、注意点として、スキルのターゲットは必ず設定してください。でないとステートは付与されません。
 *
 */

(function () {
    var parameters = PluginManager.parameters('kz_WorldState');
    //------各表示用パラメーター-------
    var windowX = Number(parameters['Window X'] || 30);
    var windowY = Number(parameters['Window Y'] || 20);
    var windowWidth = Number(parameters['Window Width'] || 600);
    var windowHeight = Number(parameters['Window Height'] || 500);

    var NameOverheadX = Number(parameters['Left Overhead'] || 40); //名称の左からの距離
    var NameWidth = Number(parameters['Name Width'] || 40)
    var DescOverheadX = NameWidth + 20;  //説明の左からの距離
    var TurnOverheadX = DescOverheadX + 200;  //説明の左からの距離
    var yOverhead = Number(parameters['Top Overhead'] || 10)

    var LineHeight = Number(parameters['Line Height'] || 20)
    var vd = LineHeight + Number(parameters['Line Overhead'] || 20); //次の行との距離

    var fontSizeName = 20; //名前部分フォントサイズ
    var fontSizeDesc = 20; //解説部分フォントサイズ

    //------各表示用パラメーター-------

    //---------------[初期化]------------------------

    var kz_BattleManager_initMembers = BattleManager.initMembers;
    BattleManager.initMembers = function () {
        this.worldState = [];
        this.worldStateTurns = [];
        kz_BattleManager_initMembers.call(this);
    }

    var kz_BattleManager_endBattle = BattleManager.endBattle;
    BattleManager.endBattle = function (result) {
        kz_BattleManager_endBattle.call(this, result);
        this.worldState = [];
        this.worldStateTurns = [];
    };

    //-------------------------------[判定表示系]-------------------------------

    var kz_Game_BattlerBase_prototype_isStateAffected = Game_BattlerBase.prototype.isStateAffected;
    Game_BattlerBase.prototype.isStateAffected = function (stateId) {
        if (BattleManager.worldState && BattleManager.worldState.length > 0) {
            return this._states.concat(BattleManager.worldState).contains(stateId);
        }
        else {
            return kz_Game_BattlerBase_prototype_isStateAffected.call(this, stateId);
        }
    };

    var kz_Game_BattlerBase_prototype_states = Game_BattlerBase.prototype.states;
    Game_BattlerBase.prototype.states = function () {
        if (BattleManager.worldState && BattleManager.worldState.length > 0) {
            var worldStateMap = BattleManager.worldState.map(function (id) {
                var target = $dataStates[id];
                var extraState = [];
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

            var result = kz_Game_BattlerBase_prototype_states.call(this);
            for (var i = 0; i < worldStateMap.length; i++) {
                result = result.concat(worldStateMap[i]);
            }

            return result;
        }
        return kz_Game_BattlerBase_prototype_states.call(this);
    };


    Spriteset_Base.prototype.refreshWorldState = function (worldState, worldStateTurns) {
    }

    Spriteset_Battle.prototype.refreshWorldState = function (worldState, worldStateTurns) {
        if (this._worldStateWindow) {
            this._battleField.removeChild(this._worldStateWindow);
        }

        var worldStateDisplay = BattleManager.worldState.map(function (id) {
            var result = {};
            result.iconIndex = $dataStates[id].iconIndex;
            result.name = $dataStates[id].name;
            result.description = $dataStates[id].message4;
            result.turns = this.worldStateTurns[id];
            return result;
        });

        this._worldStateWindow = new Sprite();
        this._worldStateWindow.bitmap = new Bitmap(windowWidth, windowHeight);

        var y = yOverhead;
        var originalFontSize = this._worldStateWindow.bitmap.fontSize;
        worldStateDisplay.forEach(function (result) {
            var iconIndex = result.iconIndex;

            this._worldStateWindow.bitmap.fontSize = fontSizeName;
            this._worldStateWindow.bitmap.drawText(result.name, NameOverheadX, y + 10, NameWidth, LineHeight, 'left'); //ステート名

            this._worldStateWindow.bitmap.fontSize = fontSizeDesc;
            this._worldStateWindow.bitmap.drawText(result.description, DescOverheadX, y + 10, 200, LineHeight, 'left'); //ステート説明
            this._worldStateWindow.bitmap.drawText(result.turns + "T", TurnOverheadX, y + 10, 50, LineHeight, 'right'); //ターン数

            var sprite = new Sprite();
            sprite.bitmap = ImageManager.loadSystem('IconSet');

            var pw = 32;
            var ph = 32;
            var sx = iconIndex % 16 * pw;
            var sy = Math.floor(iconIndex / 16) * ph;

            sprite.setFrame(sx, sy, pw, ph);
            sprite.y = y;
            y += vd;

            this._worldStateWindow.addChild(sprite);


        }, this);
        this._worldStateWindow.bitmap.fontSize = originalFontSize;

        this._worldStateWindow.x = windowX;
        this._worldStateWindow.y = windowY;
        this._battleField.addChild(this._worldStateWindow)
    }
    //-------------------------------付加排除系----------------------------------
    BattleManager.addWorldStates = function (stateId, turns) {
        if (this.worldState.indexOf(stateId) < 0) {
            this.worldState.push(stateId);
        }
        this.worldStateTurns[stateId] = turns;
        SceneManager._scene._spriteset.refreshWorldState();
    }

    BattleManager.eraseWorldStates = function (stateId) {
        var index = this.worldState.indexOf(stateId);
        if (index >= 0) {
            this.worldState.splice(index, 1);
        }
        delete this.worldStateTurns[stateId];
        SceneManager._scene._spriteset.refreshWorldState();
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

            SceneManager._scene._spriteset.refreshWorldState();
  

        }, this)
    }

    var kz_BattleManager_endTurn = BattleManager.endTurn;
    BattleManager.endTurn = function () {
        kz_BattleManager_endTurn.call(this);
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
