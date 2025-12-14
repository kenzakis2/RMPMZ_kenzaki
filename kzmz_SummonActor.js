//=============================================================================
// kzmz_SummonActor.js
//=============================================================================

/*:
* @target MZ
* @plugindesc 戦闘中にアクターを召喚するプラグイン
* @author Souji Kenzaki
*
* @help 戦闘中にアクターを召喚できるようにするプラグインです。
* 近い事はバトルコマンド「メンバーの入れ替え」でも出来ますが、
* これは動的にパーティーサイズを拡張する事で、パーティーが満員の状態でも召喚を可能にします。
* また、一時的な召喚である事を示す為、戦闘終了で召喚されたキャラクターが消えるようになっています。
*
* ------------------------------------------------------------------------------------------------　
* スキルメモ欄タグ：
* <summon_actor:[召喚するアクターのID]>
* 基本的な召喚タグです。IDが指し示したアクターを召喚します。
*
* <summon_require_state:[ステートID]>
* 基本タグへの補正タグ。このタグが召喚を行うスキルにあった場合、召喚されたアクターに対して自動でステートIDのステートを付与し、
* 何かしらの要因（解除技、時間経過等）でこのステートが解除された場合即座に召喚物は消滅します。（死亡ではなく消滅ですので、
* 死亡時に効果を発揮するプラグインを使用していた場合、実装にもよりますが高い確率でその効果は発揮されないと思われます）
*
* アクタータグ：
* <summon_vanish_anime_id:[アニメID]>
* 消滅時再生されるアニメのID。
*
* <summon_appear_anime_id:[アニメID]>
* 召喚された時に再生されるアニメのID。
* ------------------------------------------------------------------------------------------------
* ．
* 【仕様及び注意点】
* ・召喚されたアクターは他のパーティーメンバー同様に操作可能です。
* ・同じアクターIDは戦場に1体しか存在できません。召喚技を2度使おうとすると失敗しますし、召喚するアクターIDに既にパーティーに居る者を指定した場合も同様です。
* ・召喚は技の他の効果が全て発揮された後に実行されます。全体バフ等を技に含める場合ご注意ください。
* ・召喚はLv1、装備がない状態で成されます。ステータスを設定する際はこの点をご考慮ください。
* ・召喚されたアクターはHPが0になる、或いは戦闘が終了すると消滅します。この際能力値、バフ等が全てリセットされます。
* ・上記の影響の為、一時的にパーティーを離脱しているキャラクターを召喚するのはお勧めいたしません。そのキャラクターのレベルなどがリセットされるためです。
* ・パーティメンバー最大数を操作するプラグインとは競合する可能性があります。出来るだけこのプラグインを下に置くようにしてください。
*/

(function() {
    
    var kz_Game_Party_prototype_initialize = Game_Party.prototype.initialize;
    Game_Party.prototype.initialize = function() {
        kz_Game_Party_prototype_initialize.call(this);
        this._summonMemberCount = 0;
    };

    var kz_Game_Party_prototype_maxBattleMembers = Game_Party.prototype.maxBattleMembers;
    Game_Party.prototype.maxBattleMembers = function() {
        return kz_Game_Party_prototype_maxBattleMembers.call(this) + this._summonMemberCount;
    };

    Game_Party.prototype.summonActorInBattle = function(actorId, stateId)
    {
        this.lastSummonResult = 1;
        var target = $gameActors.actor(actorId);
        if (target) {
            if (this._actors.indexOf(actorId) < 0)
            {
                this._actors.splice(this.maxBattleMembers(),0,actorId);
                this._summonMemberCount ++;
                target._summoned = true;
                if (stateId > 0)
                {
                    target._summoned_require_state = stateId;
                    target.addState(stateId);
                }
                target.appear();
                SceneManager._scene._spriteset.addLastActorSprite();
                var targetSprite = SceneManager._scene._spriteset.findSpriteFromBattler(target);
                target.startAppearAnime();
                this.lastSummonResult = 2;
            }
        }
        $gameTemp.requestBattleRefresh();
    }

    Game_Party.prototype.removeActorFromBattle = function(actorId)
    {
        var target = $gameActors.actor(actorId);
        if (target && this._actors.contains(actorId))
        {
            SceneManager._scene._spriteset.removeLastActorSprite(target);
            this.removeActor(actorId)
            if (target._summoned)
            {
                this._summonMemberCount --;
                $gameActors.deleteActor(actorId);
            }
            return true;
        }
        return false;
    }

    Game_Party.prototype.removeAllSummons = function()
    {
        var targetActorIds = [];
        this._actors.forEach(function(actorId){
        if ($gameActors.actor(actorId)._summoned)
        {
            targetActorIds.push(actorId);
        }
        });

        for (var i = 0; i < targetActorIds.length; i++)
        {
            this.removeActorFromBattle(targetActorIds[i]);
        }
    }

    //データ量節約とデータリセットを兼ねる
    Game_Actors.prototype.deleteActor = function(actorId) {
        if (this._data[actorId]) {
            this._data[actorId] = new Game_Actor(actorId);
        }
    };

    //条件による消滅処理
    var kz_Game_Actor_prototype_refresh = Game_Actor.prototype.refresh;
    Game_Actor.prototype.refresh = function() {
        kz_Game_Actor_prototype_refresh.call(this);    

        //死亡消滅
        if (this.isDead() && this._summoned)
        {
            this.startVanishAnime();
        }

        //必要ステート未達による消滅
        if (this._summoned_require_state && !this.isStateAffected(this._summoned_require_state))
        {
            this.startVanishAnime();
        }
    };

    Game_Actor.prototype.startVanishAnime = function()
    {
        var vanishAnimeId = $dataActors[this.actorId()].meta.summon_vanish_anime_id
        if (vanishAnimeId)
        {
            $gameTemp.requestAnimation([this], Number(vanishAnimeId));
            BattleManager._logWindow.waitForEffect();
        }
        this._removeAfterAnime = true;
    }

    Game_Actor.prototype.startAppearAnime = function()
    {
        var appearAnimeId = $dataActors[this.actorId()].meta.summon_appear_anime_id
        if (appearAnimeId)
        {
            $gameTemp.requestAnimation([this], Number(appearAnimeId));
            BattleManager._logWindow.waitForEffect();
        }
        this._appearAfterAnime = true;
    }

    var kz_Game_Action_prototype_apply = Game_Action.prototype.apply;
    Game_Action.prototype.apply = function( target) {
        $gameParty.lastSummonResult = 0;
        kz_Game_Action_prototype_apply.call(this, target);
        var summonActorId = this.item().meta.summon_actor;
        if (summonActorId)
        {
            var summonState = this.item().meta.summon_require_state;
            var numSummonState = summonState ? parseInt(summonState, 10) : -1;
            var numActorId = parseInt(summonActorId, 10);
            $gameParty.summonActorInBattle(numActorId, numSummonState);
            target.result().success = true;
        }
    }

    var kz_BattleManager_update = BattleManager.update;
    BattleManager.update = function() {
        var spriteset = SceneManager._scene._spriteset;
        $gameParty.allMembers().forEach(function(actor) {
            var sprite = spriteset.findSpriteFromBattler(actor);
            if (!actor.isAnimationPlayingForSummon())
            {
                if (actor._removeAfterAnime)
                {
                    BattleManager.summonVanish(actor);
                    return;
                }

                if (actor._appearAfterAnime)
                {
                    sprite.opacity = 255;
                    actor._appearAfterAnime = false;
                    return;
                }
            }
            else if(actor._appearAfterAnime)
            {
                sprite.opacity = 0;
            }
        });

        kz_BattleManager_update.call(this);
    };

    BattleManager.summonVanish = function(actor)
    {
        var removed = $gameParty.removeActorFromBattle(actor.actorId());
        if (removed)
        {
            this._logWindow.showSummonVanish(actor.name());
        }
    }

    var kz_BattleManager_processVictory = BattleManager.processVictory;
    BattleManager.processVictory = function() {
        kz_BattleManager_processVictory.call(this);
        $gameParty.removeAllSummons();
    }

    var kz_BattleManager_processEscape = BattleManager.processEscape;
    BattleManager.processEscape = function() {
        var success = kz_BattleManager_processEscape.call(this);
        if (success)
        {
            $gameParty.removeAllSummons();
        }
        return success;
    }

    Spriteset_Battle.prototype.addLastActorSprite = function() {
        var newActorSprite = new Sprite_Actor();
        this._actorSprites.push(newActorSprite);
        this._battleField.addChild(newActorSprite);
    };

    Spriteset_Battle.prototype.removeLastActorSprite = function(targetActor) {
        var targetActorSprite = this.findSpriteFromBattler(targetActor);
        var num = this._actorSprites.indexOf(targetActorSprite);
        this._actorSprites.splice(num, 1);
        this._battleField.removeChild(targetActorSprite);
    };

    Spriteset_Battle.prototype.findSpriteFromBattler = function(battler)
    {
        var targetSet = battler.isActor() ? this._actorSprites : this._enemySprites;
        var result = null;
        targetSet.forEach(function(sprite)
        {
            if (sprite._battler == battler)
            {
                result = sprite;
            }
        });
        return result;
    }

    var kz_Sprite_Actor_prototype_startEntryMotion = Sprite_Actor.prototype.startEntryMotion;
    Sprite_Actor.prototype.startEntryMotion = function() {
        if (this._actor && this._actor._summoned) {
            this.startMove(0, 0, 0);
        }
        else
        {
            kz_Sprite_Actor_prototype_startEntryMotion.call(this);
        }
    };

    var kz_Window_BattleLog_prototype_endAction = Window_BattleLog.prototype.endAction;
    Window_BattleLog.prototype.endAction = function(subject) {
        this.showSummonResult(subject);
        kz_Window_BattleLog_prototype_endAction.call(this, subject);
    };

    Window_BattleLog.prototype.showSummonResult = function(subject) {       
        if ($gameParty.lastSummonResult == 2)   
        {
            this.push('addText', "召喚に成功した");
            $gameParty.lastSummonResult = 0;
            this.push('wait');
            this.push('clear');
        }
        else if ($gameParty.lastSummonResult == 1)
        {
            this.push('addText', "召喚に失敗した");
            $gameParty.lastSummonResult = 0;
            this.push('wait');
            this.push('clear');
        }
    };

    Window_BattleLog.prototype.showSummonVanish = function(actorName) {    
        var text = "%1が消滅した！";
        this.push('addText', text.format(actorName));
        this.push('wait');
        this.push('clear');
    };

    Game_Battler.prototype.isAnimationPlayingForSummon = function() {
        const animeList = SceneManager._scene._spriteset._animationSprites;
        if (!animeList) return false;
        const target = this;
        return animeList.some(e => e && e._targets.includes(target));
    };

})();    