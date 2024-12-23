/*:
 * @plugindesc ターン開始、終了時自動スキル
 * @target MZ
 * @author 剣崎宗二
 *  
 * @help
 * メモ欄にタグをつけます。
 * 
 * LinkActionの拡張なのでデフォルトのLink ActionSkill.js必須。
 * <linkcondition>も使用可ですがターゲットがuser以外効果がありません。
 * （スキルではなく「ターンが始まった/終わった」に反応してないからaもbもactionもない。クラッシュカウンターも効かない。
 * 
 * ターン数の指定について
 * 0にすると開幕即発動（0ターン目）
 * 正数でそのターンに１回だけ
 * マイナスでそのターンごとに一回 (-2 = ２ターンに１回）
 *
 * 戦闘開始時　　<turnaction: 0, [発動スキルID]>
 * 
 * ターン開始時　<turnaction: [発動ターン数], [発動スキルID]>
 * 
 * ターン終了時　<turnendaction: [発動ターン数], [発動スキルID]>
 */

(function () {
    const kz_LinkActionManager_initMembers = LinkActionManager.initMembers;
    LinkActionManager.initMembers = function () {
        kz_LinkActionManager_initMembers.call(this);
        this.endTurnExecuted = false;
    };

    LinkActionManager.createTurnBasedLinkedAction = function (turn, user) {
        user.traitObjects().forEach(state => {
            if (state.meta && state.meta.turnaction) {

                let chainTarget = state.meta.turnaction.split(',')
                let definedTurn = Number(chainTarget[0]);

                if (definedTurn != turn && definedTurn >= 0) return;
                if (definedTurn < 0 && (turn % Math.abs(definedTurn) != 0)) return;
                if (Number(chainTarget[0]) < 0 && turn == 0) return;

                if (state.meta.linkcondition) {
                    const condition = this.getConditionTagFromState(state);
                    if (!condition || !eval(condition)) return;
                }

                let newAction = new Game_Action(user);

                newAction.setSkill(Number(chainTarget[1]));
                newAction.activeCondition = state.meta.strictcondition ? state.meta.strictcondition : "true";

                this._linkActionQueue.push(newAction);
            }
        });
    }

    LinkActionManager.createEndTurnBasedLinkedAction = function (turn, user) {
        user.traitObjects().forEach(state => {
            if (state.meta && state.meta.turnendaction) {

                let chainTarget = state.meta.turnendaction.split(',')
                let definedTurn = Number(chainTarget[0]);

                if (definedTurn != turn && definedTurn >= 0) return;
                if (definedTurn < 0 && (turn % Math.abs(definedTurn) != 0)) return;
                if (Number(chainTarget[0]) < 0 && turn == 0) return;

                if (state.meta.linkcondition) {
                    const condition = this.getConditionTagFromState(state);
                    if (!condition || !eval(condition)) return;
                }

                let newAction = new Game_Action(user);

                newAction.setSkill(Number(chainTarget[1]));
                newAction.activeCondition = state.meta.strictcondition ? state.meta.strictcondition : "true";

                this._linkActionQueue.push(newAction);
            }
        });
    }

    const kz_BattleManager_startTurn = BattleManager.startTurn;
    BattleManager.startTurn = function () {
        kz_BattleManager_startTurn.call(this)
        $gameParty.members().forEach(e => LinkActionManager.createTurnBasedLinkedAction($gameTroop.turnCount(), e))
        $gameTroop.members().forEach(e => LinkActionManager.createTurnBasedLinkedAction($gameTroop.turnCount(), e))
    };

    const kz_BattleManager_startBattle = BattleManager.startBattle;
    BattleManager.startBattle = function () {
        kz_BattleManager_startBattle.call(this);
        $gameParty.members().forEach(e => LinkActionManager.createTurnBasedLinkedAction(0, e));
        $gameTroop.members().forEach(e => LinkActionManager.createTurnBasedLinkedAction(0, e));
        LinkActionManager.checkLinkedActionShouldStart();
        if (LinkActionManager.isInLinkedAction) {
            this._phase = "turn";
        }
    };

    const kz_BattleManager_endTurn = BattleManager.endTurn
    BattleManager.endTurn = function () {
        if ($gameTroop.turnCount() == 0)
        {
            this._phase = "start";
            return;
        }

        if (!LinkActionManager.endTurnExecuted) {
            $gameParty.members().forEach(e => LinkActionManager.createEndTurnBasedLinkedAction($gameTroop.turnCount(), e))
            $gameTroop.members().forEach(e => LinkActionManager.createEndTurnBasedLinkedAction($gameTroop.turnCount(), e))
            LinkActionManager.checkLinkedActionShouldStart();
            if (LinkActionManager.isInLinkedAction) {
                this._phase = "turn";
                LinkActionManager.endTurnExecuted = true;
                return;
            }
        }
        
        LinkActionManager.endTurnExecuted = false;
        kz_BattleManager_endTurn.call(this);
    };



})();