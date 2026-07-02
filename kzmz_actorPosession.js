/*:ja
 * @plugindesc 指定アクターへ別アクターの能力を憑依（合算）させるプラグイン
 * @author 剣崎宗二
 *
 * @target MZ
 *
 * @help
 * スクリプトコマンドのみで動作します。プラグインパラメータやメモ欄タグはありません。
 *
 * $gameActors.actor(1).setPosessingActor(2)
 * →アクター2の能力（パラメータ・特徴）をアクター1に上乗せします。
 *
 * $gameActors.actor(1).releasePosessingActor()
 * →上記の憑依状態を解除します。
 *
 * $gameActors.actor(1).isPosessingSomeone()
 * →現在誰かに憑依されているアクターかどうかを判定します。
 */

(() => {

    const kzmz_Game_Actor_prototype_initMembers = Game_Actor.prototype.initMembers;
    Game_Actor.prototype.initMembers = function () {
        kzmz_Game_Actor_prototype_initMembers.call(this);
        this._posessingActorId = null;
    };

    Game_Actor.prototype.posessingActor = function () {
        if (!this._posessingActorId) return null;
        return $gameActors.actor(this._posessingActorId);
    };

    Game_Actor.prototype.setPosessingActor = function (actorId) {
        if (!actorId) return;
        this._posessingActorId = actorId;
    };

    Game_Actor.prototype.releasePosessingActor = function () {
        this._posessingActorId = null;
    };

    Game_Actor.prototype.isPosessingSomeone = function () {
        return $gameActors.isActorIdPosessing(this.actorId());
    };

    const kzmz_Game_Actor_prototype_param = Game_Actor.prototype.param;
    Game_Actor.prototype.param = function (paramId) {
        const baseParam = kzmz_Game_Actor_prototype_param.call(this, paramId);
        const posessor = this.posessingActor();

        let value = posessor ? baseParam + posessor.param(paramId) : baseParam;

        const maxValue = this.paramMax(paramId);
        const minValue = this.paramMin(paramId);
        return Math.round(value.clamp(minValue, maxValue));
    };

    const kzmz_Game_Actor_prototype_allTraits = Game_Actor.prototype.allTraits;
    Game_Actor.prototype.allTraits = function () {
        const posessor = this.posessingActor();
        let baseList = kzmz_Game_Actor_prototype_allTraits.call(this);
        if (posessor)
        {
            return baseList.concat(posessor.allTraits())
        }

        return baseList;
    };

    Game_Actors.prototype.isActorIdPosessing = function(actorId) {
        this._data.some(e => e && e.posessingActor().actorId() == actorId)
    }

})();