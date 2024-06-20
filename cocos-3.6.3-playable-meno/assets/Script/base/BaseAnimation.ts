import { _decorator, AnimationComponent, CCBoolean, Component, director, Node } from 'cc';
import { BaseSpine } from './BaseSpine';
const { ccclass, property } = _decorator;

//Document: https://docs.cocos.com/creator/3.8/manual/en/animation/animation-component.html

@ccclass('BaseAnimation')
export class BaseAnimation extends Component {

    static ANIMATION_PLAY: string = 'ANIMATION_PLAY';
    static ANIMATION_STOP: string = 'ANIMATION_STOP';

    @property(AnimationComponent)
    animation: AnimationComponent = null;

    @property(CCBoolean)
    animationEvent: boolean = false;

    animationName: string = '';

    protected onLoad(): void {
        if (this.animationEvent) {
            director.on(BaseAnimation.ANIMATION_PLAY, this.animation.resume, this);
            director.on(BaseAnimation.ANIMATION_STOP, this.animation.pause, this);
        }
    }

    public SetPlay(Anim: string = ''): void {
        if (this.animationName == Anim)
            return;
        this.animationName = Anim;

        if (Anim != '')
            this.animation.play(Anim);
        else
            this.animation.play();
    }

    public SetPlaySmooth(Anim1: string, Anim2: string, Smooth: number): void {
        if (this.animationName == Anim1 || this.animationName == Anim2)
            return;

        this.animation.play(Anim1);
        this.animation.crossFade(Anim2, Smooth);

        this.animationName = Anim1;
        this.scheduleOnce(() => this.animationName = Anim2, Smooth);
    }

    public SetPause() {
        this.animation.pause();
    }

    public SetResume() {
        this.animation.resume();
    }

    public SetStop() {
        this.animation.stop();
    }
}