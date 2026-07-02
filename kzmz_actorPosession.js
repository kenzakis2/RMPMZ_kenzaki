/*:ja
 * @plugindesc 指定アクターへ別アクターの能力を憑依（合算）させるプラグイン
 * @author 剣崎宗二
 *
 * @target MZ
 *
 * @help
 * 憑依（能力の上乗せ）の発動・解除はスクリプトコマンドのみで行います。
 *
 * $gameActors.actor(1).setPosessingActor(2)
 * →アクター2の能力（パラメータ・特徴）をアクター1に上乗せします。
 *
 * $gameActors.actor(1).releasePosessingActor()
 * →上記の憑依状態を解除します。
 *
 * $gameActors.actor(1).isPosessingSomeone()
 * →現在誰かに憑依されているアクターかどうかを判定します。
 *
 * ---------------------------------------------------------------
 * 憑依する側（能力を提供する側＝posessingActor）のアクターのメモ欄に
 * 以下のタグを入れると、そのパラメータが上乗せされる際の倍率を指定できます。
 * タグがない場合は等倍（1.0）で上乗せされます。
 *
 * <possesionrate/mhp: 倍率>
 * <possesionrate/mmp: 倍率>
 * <possesionrate/atk: 倍率>
 * <possesionrate/def: 倍率>
 * <possesionrate/mat: 倍率>
 * <possesionrate/mdf: 倍率>
 * <possesionrate/agi: 倍率>
 * <possesionrate/luk: 倍率>
 *
 * 例：<possesionrate/atk: 0.6>
 * →このアクターが誰かに憑依した際、上乗せされる攻撃力が0.6倍になります
 */

(() => {

    const POSESSION_RATE_PARAM_NAMES = ["mhp", "mmp", "atk", "def", "mat", "mdf", "agi", "luk"];

    function posessionRateFor(actor, paramId) {
        const paramName = POSESSION_RATE_PARAM_NAMES[paramId];
        const meta = actor.actor().meta;
        const tag = meta["possesionrate/" + paramName];
        return tag !== undefined ? Number(tag) : 1;
    }

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

        let value = posessor ? baseParam + posessor.param(paramId) * posessionRateFor(posessor, paramId) : baseParam;

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