import { _decorator, CCInteger, CCString, Collider2D, Component, Contact2DType, director, IPhysics2DContact, Node } from 'cc';
import { BaseObjectTrigger } from './object/BaseObjectTrigger';
import GameEvent from '../GameEvent';
import { BaseSpine } from './renderer/BaseSpine';
import { BaseAnimation } from './renderer/BaseAnimation';
const { ccclass, property } = _decorator;

@ccclass('BaseFinish')
export class BaseFinish extends Component {

    @property(CCString)
    animIdle: string = "";

    @property(CCString)
    animTrigger: string = "";

    @property(CCString)
    animReady: string = "";

    @property(CCString)
    animFinish: string = "";

    @property(CCInteger)
    contactOther: number = 100; //player

    @property(CCInteger)
    contactSelfReady: number = 0;

    @property(CCInteger)
    contactSelfFinish: number = 1;

    m_ready: boolean = false;
    m_finish: boolean = false;
    m_spine: BaseSpine = null;
    m_animation: BaseAnimation = null;

    protected onLoad(): void {
        this.m_spine = this.getComponent(BaseSpine);
        this.m_animation = this.getComponent(BaseAnimation);
    }

    protected start(): void {
        let collider = this.getComponent(Collider2D);
        if (collider) {
            let colliders: Collider2D[] = this.getComponents(Collider2D);
            if (colliders) {
                colliders.forEach(collider => {
                    collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
                    collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
                })
            }
            //collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
        //
        if (this.m_spine != null) {

        }
        if (this.m_animation != null) {
            this.m_animation.SetPlay(this.animIdle);
        }
        //
    }

    //

    onReady() {
        this.m_ready = true;
        //
        if (this.m_spine != null) {
            this.scheduleOnce(() => {
                this.m_spine.SetAnim(this.animReady, true)
            }, this.m_spine.SetAnim(this.animTrigger, false));
        }
        if (this.m_animation != null) {
            this.m_animation.SetPlay(this.animReady);
        }
    }

    onOut() {
        this.m_ready = false;
        //
        if (this.m_spine != null) {
            this.m_spine.SetAnim(this.animIdle, true)
        }
        if (this.m_animation != null) {
            this.m_animation.SetPlay(this.animIdle);
        }
    }

    onFinish() {
        this.m_finish = true;
        //
        if (this.m_spine != null) {
            this.m_spine.SetAnim(this.animFinish, false)
        }
        if (this.m_animation != null) {
            this.m_animation.SetPlay(this.animFinish);
        }
        //
        director.emit(GameEvent.PLAYER_STOP, this.node.worldPosition.clone());
    }

    //

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (this.m_finish)
            return;
        switch (otherCollider.tag) {
            case 100://player
                if (selfCollider.tag == this.contactSelfReady && !this.m_ready)
                    this.onReady();
                if (selfCollider.tag == this.contactSelfFinish)
                    this.onFinish();
                break;
        }
    }

    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (this.m_finish)
            return;
        switch (otherCollider.tag) {
            case 100://player
                if (selfCollider.tag == this.contactSelfReady && this.m_ready)
                    this.onOut();
                break;
        }
    }
}