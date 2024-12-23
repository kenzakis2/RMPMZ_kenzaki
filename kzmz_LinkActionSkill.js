/*:ja
 * @plugindesc 反撃/連鎖ステート
 * @author 剣崎宗二
 *
 * @target MZ
 *
 *
 * @help
 * 特定のステートが掛かっている際に、敵や味方の行動に反応し、追加で自分が行動を行うと言うステートを作るプラグインです。
 * 使用の為にはステートの「メモ」欄に以下二つのタグを入れる事。
 *
 * <linkaction:[タイプ],[発動するスキルID]>
 * [タイプ]: chainとcounterの何れか。chainは元スキルのターゲット、counterは元スキルの発動者
 * [発動するスキルID]: 連鎖先のスキルID
 * 例：<linkaction:chain,3> ID3のスキルを元スキルのターゲットに向けて発動
 * 但し、元のスキルのターゲット設定で指定されていない物には向けられない。（敵の攻撃に攻撃で追撃しても、味方を攻撃はせず、敵の誰かを攻撃する）
 * 
 * <linkcondition>
 * [条件式]
 * </linkcondition>
 * [条件式]:
 * 具体的にどういう行動の際に上記の追撃、反撃が行われるのか。
 * 使用できるのは以下のオブジェクト：
 * ・a,b： ダメージ計算式のa,bと同じ。ただしbはターゲットされている全員である数列です。よくわからない場合はb[0]を計算式のbとして指定してください。
 * ・user： このステートが掛かっている、追撃反撃の「発動者」
 * ・action： Game_Action。使用したスキル、アイテムのデータなどが含まれております
 * 
 * また、デフォルトのデータにない以下の参照用データが実装されております。
 * ・b[0].cResult: b[0]への攻撃結果。命中したか、ダメージ量などが含まれております。（Game_ActionResult）
 * ・targets.isSelf: スキルのターゲットがこのステートがついているキャラクターの場合
 * ・targets.isAlly: スキルのターゲットがこのステートがついているキャラクターを含む仲間の場合
 * ・subject.isSelf: スキルの使用者がこのステートがついているキャラクターの場合
 * ・subject.isAlly: スキルの使用者がこのステートがついているキャラクターを含む仲間の場合
 * 
 * 例:
 * user.isDead() && !subject.isAlly && targets.isAlly 
 * →敵から味方に攻撃が行われ、使用者が死亡している場合（何かしらの方法で死んだ際もステートを維持する必要はあります）
 * 
 * !subject.isAlly && targets.isAlly && b[0].cResult.hpDamage > 0
 * →敵から味方に攻撃が行われ、１以上のダメージが与えられた場合
 * 
 * user.isAlive() && subject.isSelf && action.item().id == 発動したいスキルID && b[0].cResult.hpDamage > 0
 * →自分が発動した特定のスキルIDに追撃する
 * (user.isAlive()を入れない場合、パッシブなどで死亡時にもステートがついている場合、死んでいても追撃しますのでご注意ください)
 * 
 * 具体的にやりたいスキルがある場合は、ツイッターなどでお聞き頂ければ幸いです。
 * @EYN_kenzaki
 */


function LinkActionManager() {
    throw new Error("This is a static class");
}


(function () {


    LinkActionManager.setup = function () {
        this.initMembers();
    };

    LinkActionManager.initMembers = function () {
        this.isInLinkedAction = false;
        this._uniqueId = 100000;
        this._subject = null;
        this._targets = null;
        this._action = null;
        this._linkActionQueue = [];
    };

    LinkActionManager.getUniqueId = function () {
        let result = this._uniqueId;
        this._uniqueId++;
        return result;
    };

    LinkActionManager.isSameBattler = function(a,b)
    {
        return a.uniqueId() === b.uniqueId();
    }

    LinkActionManager.checkLinkedActionShouldStart = function () {
        if (this._linkActionQueue.length > 0) this.isInLinkedAction = true;
    }

    LinkActionManager.checkLinkedActionShouldEnd = function () {
        if (this._linkActionQueue.length <= 0) this.isInLinkedAction = false;
    }

    // a = Game_Battler, b = Game_Battler[], action = Game_Action, user = Game_Battler
    LinkActionManager.createLinkedAction = function(a, b, action, user)
    {
        if (!a || !b || !action || !user) return;
        if (action.item().meta && action.item().meta.linkirreplacible) return;
        let subject = {};
        let targets = {};

        subject.isSelf = LinkActionManager.isSameBattler(a, user);
        subject.isAlly = a.isActor() === user.isActor();

        targets.isSelf = b.some(e => LinkActionManager.isSameBattler(e, user));
        targets.isAlly = b.some(e => e.isActor() === user.isActor());
        user.traitObjects().forEach(state => {
            if (state.meta && state.meta.linkaction && state.meta.linkcondition && !state.meta.link_crash)
            {
                const condition = this.getConditionTagFromState(state);
                if (!condition || !eval(condition)) return;

                //新規アクション構築
                let newAction = new Game_Action(user);
                let chainTarget = state.meta.linkaction.split(',')

                let realTargetIndex = chainTarget[0] == "chain" ? b[0].index() : a.index();

                newAction.setTarget(realTargetIndex)
                newAction.setSkill(Number(chainTarget[1]));

                this._linkActionQueue.push(newAction);
            }
        });
    }


    LinkActionManager.getConditionTagFromState = function(state)
    {
        const matcher = /<linkcondition>[\r\n]+(.+)<\/linkcondition>/is;
        if (state)
        {
            const regExResult = state.note.match(matcher);
            if(regExResult)
            {
                return regExResult[1];
            }
        }
        return null;
    }


    //-------登録部分


    Game_Actor.prototype.uniqueId = function () {
        return this.actorId();
    };

    const kz_Game_Enemy_prototype_setup = Game_Enemy.prototype.setup;
    Game_Enemy.prototype.setup = function (enemyId, x, y) {
        kz_Game_Enemy_prototype_setup.call(this, enemyId, x, y);
        this._uniqueId = LinkActionManager.getUniqueId();
    };

    Game_Enemy.prototype.uniqueId = function () {
        return this._uniqueId;
    };

    const kz_BattleManager_setup = BattleManager.setup;
    BattleManager.setup = function (troopId, canEscape, canLose) {
        LinkActionManager.setup();
        kz_BattleManager_setup.call(this, troopId, canEscape, canLose);
    };

    //-------複合部分
    const kz_BattleManager_endAction = BattleManager.endAction;
    BattleManager.endAction = function() {
        $gameParty.members().forEach(e => LinkActionManager.createLinkedAction(LinkActionManager._subject, LinkActionManager._targets, LinkActionManager._action, e))       
        $gameTroop.members().forEach(e => LinkActionManager.createLinkedAction(LinkActionManager._subject, LinkActionManager._targets, LinkActionManager._action, e))

        kz_BattleManager_endAction.call(this);

        LinkActionManager.checkLinkedActionShouldEnd();
    };

    const kz_BattleManager_startAction = BattleManager.startAction;
    BattleManager.startAction = function() {
        LinkActionManager._subject = this._subject;
        LinkActionManager._action = this._subject.currentAction();
        
        kz_BattleManager_startAction.call(this);

        LinkActionManager._targets = this._targets.concat();  
    };

    BattleManager.startLinkedAction = function(action) {
        const subject = action.subject();
        LinkActionManager._subject = subject;
        LinkActionManager._action = action;
        
        const targets = action.makeTargets();
        this._phase = "action";
        this._action = action;
        this._targets = targets;
        subject.cancelMotionRefresh();
        subject.useItem(action.item());
        this._action.applyGlobal();
        this._logWindow.startAction(subject, action, targets);

        LinkActionManager._targets = this._targets.concat();  
    };


    ////-------行動部分

    const kz_BattleManager_updateTurn = BattleManager.updateTurn;
    BattleManager.updateTurn = function(timeActive) {
        LinkActionManager.checkLinkedActionShouldStart();
        kz_BattleManager_updateTurn.call(this, timeActive);
    };

    const kz_BattleManager_getNextSubject = BattleManager.getNextSubject;
    BattleManager.getNextSubject = function() {
        if (LinkActionManager.isInLinkedAction)
        {
            return LinkActionManager._linkActionQueue[0].subject();
        }
        return kz_BattleManager_getNextSubject.call(this);
    };

    const kz_BattleManager_processTurn = BattleManager.processTurn;
    BattleManager.processTurn = function() {

        if (LinkActionManager.isInLinkedAction)
        {
            const action = LinkActionManager._linkActionQueue.shift();
            this.startLinkedAction(action);
            return;
        }

        kz_BattleManager_processTurn.call(this);
    };    

    const kz_Game_Action_prototype_apply = Game_Action.prototype.apply;
    Game_Action.prototype.apply = function(target) {
        kz_Game_Action_prototype_apply.call(this, target);
        target.cResult = JsonEx.makeDeepCopy(target.result());
    }
})();