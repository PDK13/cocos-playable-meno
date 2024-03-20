import { _decorator, CCFloat, Component, Node, Sprite, Tween, tween, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BoardX4')
export class BoardX4 extends Component {

    @property(CCFloat)
    scalePlayerSmall: number = 1;

    @property(CCFloat)
    scalePlayerBig: number = 2;

    @property(CCFloat)
    posPotionTop: number = 110;

    @property(CCFloat)
    posPotionBot: number = -80;

    @property(Node)
    spinePlayer: Node = null;

    @property(Node)
    spritePotion: Node = null;

    start() {
        this.SetPlayStep01();
    }

    SetPlayStep01() {
        this.spritePotion.getComponent(Sprite).enabled = true;
        this.spritePotion.setPosition(v3(0, this.posPotionTop, 0));
        //
        tween(this.spritePotion)
            .delay(1)
            .to(1, { position: v3(0, this.posPotionBot, 0) }, { easing: 'linear' })
            .call(() => this.SetPlayStep02())
            .start();
    }

    SetPlayStep02() {
        this.spritePotion.getComponent(Sprite).enabled = false;
        //
        tween(this.spinePlayer)
            .to(1, { scale: v3(this.scalePlayerBig, this.scalePlayerBig, this.scalePlayerBig) }, { easing: 'elasticOut' })
            .delay(1)
            .to(1, { scale: v3(this.scalePlayerSmall, this.scalePlayerSmall, this.scalePlayerSmall) }, { easing: 'elasticOut' })
            .call(() => this.SetPlayStep01())
            .start();
    }
}