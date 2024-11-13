//=============================================================================
// kzmz_Barrier.js
//=============================================================================


/*:ja
* @plugindesc バリアステートの実装 - v1.0
* @author 剣崎宗二
* 
* @target MZ
*
* @param BarrierText
* @desc バリア発動時の表示テキスト (%2=吸収ダメージ量 %3=残強度 %1=バリアのステート名) 破壊された際は表示されません。
* @default %1が%2ダメージを吸収し、残量%3となった！
*
* @param BarrierBreakText
* @desc バリア破壊時メッセージ(%1=バリアのステート名 %2=ダメージ量)
* @default %1が%2のダメージを受け破壊された！
*
* @param Piercing
* @type boolean
* @desc 障壁の体力を超過したダメージが貫通するか否か。falseの場合、如何なる大技でも一発は無効化する。
* @default true
*
* @param PiercingChain
* @type boolean
* @desc 貫通したダメージが次の障壁に阻まれるかどうか。falseの場合貫通ダメージは他の障壁を無視してキャラクターに入る。
* @default true
*
* @param BarrierAnime 
* @type number
* @desc バリアで防げた場合のアニメーションID（デフォルト）
* @default 1
* 
* @param BarrierBreakAnime 
* @type number
* @desc バリアが割れた場合のアニメーションID（デフォルト）
* @default 2
*
* @help
* ダメージを軽減するバリアを再現するためのプラグインです。
* ステートのメモに<barrier:300> (数字は軽減値）を入れると、値がなくなるまで軽減してくれます。
* 尚軽減値はダメージ計算式と同様の式を入れる事も可能ですが、 '>' が使えない事とa(攻撃側)が存在せずb(付与される側)のみ使用可能であることにご留意ください。
* アニメタグはステートに<BarrierBreakAnime:1>　（割れた場合ID3を再生）
* <BarrierAnime:3>　　（割れなかった場合ID1を再生）
* 等。
* <barrierelement:3,9>で属性ID3,9のみをガード。
* スキルタグ<ignorebarrier>はバリアを強制貫通します。
* 
* Game_Actorに対して特定のコマンドで該当アクターの有するバリア値を調べる事が可能です。
* ActorID3 ($gameActors.actor(3))を例とすると：
* 全バリアの総合値：$gameActors.actor(3).findTotalBarrierValue()
* ステートID5によるバリア：$gameActors.actor(3).findBarrierValueForState(5)
*
* v1.0 - MV版から改修
*/

(() => {

    const script = "kzmz_Barrier";
    const parameters = PluginManager.parameters(script);
    const BarrierText = parameters['BarrierText'];
    const BarrierBreakText = parameters['BarrierBreakText'];
    const Piercing = (parameters['Piercing'] == "true");
    const PiercingChain = (parameters['PiercingChain'] == "true");

    const BarrierAnime = Number(parameters['BarrierAnime']);
    const BarrierBreakAnime = Number(parameters['BarrierBreakAnime']);

    //ActionLogs系
    const Game_ActionResult_prototype_clear = Game_ActionResult.prototype.clear;
    Game_ActionResult.prototype.clear = function () {
        Game_ActionResult_prototype_clear.call(this);
        this.barrieredDmg = [];
        this.barrieredBreak = [];
    };

    //Message系
    Window_BattleLog.prototype.displayBarrier = function (target) {
        let targetBarrierDmg = target.result().barrieredDmg;
        let targetBarrierBreak = target.result().barrieredBreak;

        targetBarrierBreak.forEach(function (element) {
            let name = $dataStates[element.id].name;
            let dmg = element.value;

            this.showNormalAnimation([target], element.animeId, target.isEnemy());
            this.push('addText', BarrierBreakText.format(name, dmg));
        }, this);

        targetBarrierDmg.forEach(function (element) {
            let name = $dataStates[element.id].name;
            let dmg = element.value;

            let barrierDmgd = target.findBarrierByStateId(element.id);
            if (!barrierDmgd) return;

            let left = barrierDmgd.value;
            this.showNormalAnimation([target], element.animeId, target.isEnemy());
            this.push('addText', BarrierText.format(name, dmg, left));
        }, this);
    };

    const Window_BattleLog_prototype_displayHpDamage = Window_BattleLog.prototype.displayHpDamage;
    Window_BattleLog.prototype.displayHpDamage = function (target) {
        this.displayBarrier(target);
        Window_BattleLog_prototype_displayHpDamage.call(this, target);
    }

    //state系
    Game_Battler.prototype.findBarrierByStateId = function (stateId) {
        if (!this._barrierList) return null;

        return this._barrierList.find(e => e.id == stateId)
    };

    Game_Battler.prototype.findAllAvailableBarrier = function () {
        if (!this._barrierList) return null;

        return this._barrierList.filter(e => e && e.value > 0);
    };

    Game_Battler.prototype.findTotalBarrierValue = function () {
        let base = this.findAllAvailableBarrier();
        
        if (!base) return 0;

        return base.reduce(
            (n, current) => n.value + current, 0
        );
    };

    Game_Battler.prototype.findBarrierValueForState = function (stateId) {
        let base = this.findBarrierByStateId(stateId);
        
        if (!base) return 0;

        return base.value;
    };

    const Game_Battler_prototype_addState = Game_Battler.prototype.addState;
    Game_Battler.prototype.addState = function (stateId) {
        Game_Battler_prototype_addState.call(this, stateId);

        let targetState = $dataStates[stateId];
        let targetBarrierState = this.findBarrierByStateId(stateId);
        if (targetState && (targetState.meta.barrier || targetState.meta.healablebarrier)) {
            let b = this;
            let b_str = targetState.meta.healablebarrier ? targetState.meta.healablebarrier : targetState.meta.barrier;
            let b_value = eval(b_str);
            if (!b_value) { b_value = 1; }
            let b_healable = !!targetState.meta.healablebarrier;
            let b_element = targetState.meta.barrierelement ? targetState.meta.barrierelement.split(",") : [];
            let b_anime = targetState.meta.BarrierAnime ? targetState.meta.BarrierAnime : BarrierAnime;
            let b_break_anime = targetState.meta.BarrierBreakAnime ? targetState.meta.BarrierBreakAnime : BarrierBreakAnime


            if (!targetBarrierState) {
                let barrierStateObject = {};
                barrierStateObject.id = stateId;
                barrierStateObject.value = b_value;
                barrierStateObject.healable = b_healable;
                barrierStateObject.maxValue = b_value;
                barrierStateObject.elements = b_element;
                barrierStateObject.defenceAnimeId = b_anime
                barrierStateObject.breakAnimeId = b_break_anime
                this._barrierList.push(barrierStateObject);
            }
            else {
                targetBarrierState.value = b_value;
                targetBarrierState.maxValue = b_value;
            }
        }
    };

    const Game_BattlerBase_prototype_eraseState = Game_BattlerBase.prototype.eraseState;
    Game_BattlerBase.prototype.eraseState = function (stateId) {
        Game_BattlerBase_prototype_eraseState.call(this, stateId)
        this._barrierList = this._barrierList.filter(e => e.id != stateId);
    };

    const kz_Game_BattlerBase_prototype_clearStates = Game_BattlerBase.prototype.clearStates;
    Game_BattlerBase.prototype.clearStates = function () {
        kz_Game_BattlerBase_prototype_clearStates.call(this);
        this._barrierList = [];
    };

    //Dmg系
    const Game_Action_prototype_executeHpDamage = Game_Action.prototype.executeHpDamage;
    Game_Action.prototype.executeHpDamage = function (target, value) {
        let skill = this.item();
        if (target._barrierList && target._barrierList.length > 0 && !skill.meta.ignorebarrier) {
            //バリアリストに何か入ってる場合
            let blist = target._barrierList;
            target.result().barrieredDmg = [];
            target.result().barrieredBreak = [];

            if (value > 0) {
                let removalList = [];
                for (let i = 0; i < blist.length; i++) {
                    if (blist[i].elements.length < 1 || this.barrierElementMatch(blist[i], skill))

                        if (blist[i].value > value)  //割れなかった場合
                        {
                            let dmgObject = {};
                            dmgObject.id = blist[i].id;
                            dmgObject.animeId = blist[i].defenceAnimeId;
                            dmgObject.value = value;
                            target.result().barrieredDmg.push(dmgObject);

                            blist[i].value -= value;
                            value = 0;
                            break;
                        }
                        else  //割れた場合
                        {
                            let breakObject = {};
                            breakObject.id = blist[i].id;
                            breakObject.animeId = blist[i].breakAnimeId;
                            breakObject.value = blist[i].value;
                            target.result().barrieredBreak.push(breakObject);

                            if (Piercing) {
                                value -= blist[i].value;
                            }
                            else {
                                value = 0;
                            }
                            removalList.push(blist[i].id);
                            if (!PiercingChain) { break; }
                        }
                }
                for (let i = 0; i < removalList.length; i++) {
                    target.removeState(removalList[i]);
                }
            }
            else {
                //回復の場合
                let healableList = blist.filter(function (item) {
                    return item.healable;
                });

                for (let i = 0; i < healableList.length; i++) {
                    let dmgOnBarrier = healableList[i].value - healableList[i].maxValue;
                    if (dmgOnBarrier < value) //バリアの減りの方が激しい場合
                    {
                        let dmgObject = {};
                        dmgObject.id = blist[i].id;
                        dmgObject.value = value;
                        target.result().barrieredDmg.push(dmgObject);

                        healableList[i].value -= value;
                        value = 0;
                        break;
                    }
                    else //回復量が上回った場合
                    {
                        let dmgObject = {};
                        dmgObject.id = blist[i].id;
                        dmgObject.value = dmgOnBarrier;
                        target.result().barrieredDmg.push(dmgObject);

                        value -= dmgOnBarrier;
                        if (!PiercingChain) { break; }
                    }
                }
            }
        }
        Game_Action_prototype_executeHpDamage.call(this, target, value);
    }

    Game_Action.prototype.barrierElementMatch = function (barrier, skill) {
        if (skill.damage.elementId < 0) {
            let result = false;
            this.subject().attackElements().forEach(function (e) {
                if (barrier.elements.indexOf(e) > 0) {
                    result = true;
                }
            }, this)
            return result;
        } else {
            return barrier.elements.indexOf(skill.damage.elementId.toString()) >= 0;
        }
    }
})();


