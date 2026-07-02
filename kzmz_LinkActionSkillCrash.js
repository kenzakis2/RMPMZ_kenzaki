/*:ja
 * @plugindesc 連鎖行動によるクラッシュ（強制割込み）- LinkActionSkill拡張
 * @author 剣崎宗二
 *
 * @target MZ
 *
 * @help
 * kzmz_LinkActionSkill.jsの拡張プラグインです。必ずその下に配置してください。
 *
 * ステートのメモ欄に<linkaction:...>と<linkcondition>に加えて
 * <link_crash>
 * タグを入れると、条件を満たした際に元の行動そのものを差し替える「クラッシュ」動作になります。
 * （通常のlinkaction/counterは元の行動の後に追加で発動しますが、
 * link_crashは元の行動自体をキャンセルし、代わりに連鎖スキルを発動させます）
 *
 * スキル・アイテムのメモ欄に
 * <linkirreplacible>
 * を入れると、そのスキル・アイテムはクラッシュによる差し替えの対象外になります。
 */

(function () {

    // a = Game_Battler, b = Game_Battler[], action = Game_Action, user = Game_Battler
    LinkActionManager.createCrashLinkedAction = function(a, b, action, user)
    {
        
        if (action.item().meta && action.item().meta.linkirreplacible) return;
        let subject = {};
        let targets = {};

        subject.isSelf = LinkActionManager.isSameBattler(a, user);
        subject.isAlly = a.isActor() === user.isActor();

        targets.isSelf = b.some(e => LinkActionManager.isSameBattler(e, user));
        targets.isAlly = b.some(e => e.isActor() === user.isActor());
 
        return user.states().reduce((existing, current) => {
            if (existing) return existing;
            if (current.meta && current.meta.linkaction && current.meta.linkcondition && current.meta.link_crash)
            {
                const condition = this.getConditionTagFromState(current);
                if (!condition || !eval(condition)) return null;

                //新規アクション構築
                let newAction = new Game_Action(user);
                let chainTarget = current.meta.linkaction.split(',')

                let realTargetIndex = chainTarget[0] == "chain" ? b[0].index() : a.index();

                console.log(Number(chainTarget[1]));
                newAction.setTarget(realTargetIndex)
                newAction.setSkill(Number(chainTarget[1]));

                console.log(newAction);
                return newAction;
            }
        }, null);
    }

    LinkActionManager.searchCrashLinkedAction = function(a, b, action)
    {
        const fullList = $gameParty.members().concat($gameTroop.members());
        const searchResult = fullList.reduce(function(current, newVal){
            if (current) return current;

            const newAction = LinkActionManager.createCrashLinkedAction(a, b,  action, newVal);
            return newAction;
        },null)
        console.log(searchResult);
        return searchResult;
    }

    const kz_BattleManager_startAction = BattleManager.startAction;
    BattleManager.startAction = function() {
        let crashAction = LinkActionManager.searchCrashLinkedAction(this._subject, this._subject.currentAction().makeTargets(),  this._subject.currentAction())

        if (crashAction)
        {
            
            this.startLinkedAction(crashAction);
        }
        else
        {
            kz_BattleManager_startAction.call(this);
        }
    };

    const kz_BattleManager_startLinkedAction = BattleManager.startLinkedAction;
    BattleManager.startLinkedAction = function(action) {
        let crashAction = LinkActionManager.searchCrashLinkedAction(action.subject(), action.makeTargets(),  action)

        if (crashAction)
        {
            this.startLinkedAction(crashAction);
        }
        else
        {
            kz_BattleManager_startLinkedAction.call(this,action);
        }
    };

})();