/*:ja
 * @plugindesc スキル範囲修正
 * @author 剣崎宗二
 *
 * @target MZ
 *
 *
 * @help
 * 特定のタグがある物を付けている場合、特定の条件を満たす技の範囲を修正します。
 * 使用の為には「メモ」欄に以下二つのタグを入れる事。
 *
 * <scopechange:[範囲番号(下参照)]>
 *  
 * <scopecondition>
 * [条件式]
 * </scopecondition>
 * [条件式]:
 * 具体的にどういうスキルに対して上記の修正が行われるのか。
 * 使用できるのは以下のオブジェクト：
 * ・user： このタグが付いている、スキルの使用者
 * ・data： DataSkill/DataItem。使用したスキル、アイテムの基礎データ
 *  
 * 範囲番号一覧：
 * 1: 敵単体
 * 2: 敵全体
 * 3-6: 敵ランダム（1-4体）
 * 7: 味方単体/生存
 * 8: 味方全体/生存
 * 9: 味方単体/死亡
 * 10: 味方全体/死亡
 * 11: 使用者
 * 12: 味方単体/無条件
 * 13: 味方全体/無条件
 * 14: 敵味方全体（生存）
 * 
 *
 * 具体的にやりたいスキルがある場合は、ツイッターなどでお聞き頂ければ幸いです。
 * @EYN_kenzaki
 */

function ScopeManager() {
    throw new Error("This is a static class");
}

(function () {

    ScopeManager.getScopeTagFromState = function(state)
    {
        const matcher = /<scopecondition>[\r\n]+(.+)<\/scopecondition>/is;
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

    ScopeManager.fixResultScope = function(originalData, user)
    {
        const data = JsonEx.makeDeepCopy(originalData);
        if (!data || !user) return originalData;

        user.traitObjects().forEach(state => {
            if (state.meta && state.meta.scopechange && state.meta.scopecondition)
            {
                const condition = this.getScopeTagFromState(state);
                if (!condition || !eval(condition)) return;

                data.scope = Number(state.meta.scopechange);
            }
        });
        return data.scope;
    }

    Game_Action.prototype.checkItemScope = function(list) {
        return list.includes(ScopeManager.fixResultScope(this.item(), this.subject()));
    };
})();