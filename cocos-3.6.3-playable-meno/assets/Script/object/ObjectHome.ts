import { _decorator, AudioSource, BoxCollider2D, CCBoolean, Collider2D, Component, Contact2DType, director, game, IPhysics2DContact, Node, sp } from 'cc';
import GameEvent from '../GameEvent';
const { ccclass, property } = _decorator;

@ccclass('ObjectHome')
export class ObjectHome extends Component {
    @property(CCBoolean)
    flag: boolean = true;

    @property(Node)
    center: Node = null;

    @property(sp.Skeleton)
    spine: sp.Skeleton = null;

    @property(AudioSource)
    audio: AudioSource = null;

    m_opened: boolean = false;
    m_stop: boolean = false;

    finishArea: Collider2D = null;
    openArea: Collider2D = null;

    onLoad() {
        if (this.flag) {
            director.on(GameEvent.FINISH_FLAG, this.onFinishFlag, this);
        }
        else {
            let colliders: Collider2D[] = this.getComponents(Collider2D);
            if (colliders) {
                colliders.forEach(collider => {
                    collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
                    //collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
                    if (collider.tag == 1)
                        this.finishArea = collider;
                    else
                        this.openArea = collider;
                })
            }
        }
    }

    onFinishFlag() {
        this.open();
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (this.m_stop)
            return;
        switch (otherCollider.tag) {
            case 100://player
                if (selfCollider.tag == 0 && !this.m_opened)
                    this.open();
                if (selfCollider.tag == 1)
                    this.finish();
                break;
        }
    }

    open() {
        this.m_opened = true;
        this.audio.play();
        //this.openArea.destroy();
        this.finish();
        let entry = this.spine.setAnimation(0, "open", false);
        //director.emit(GameEvent.PLAYER_X4, false);
        let time = entry.animationEnd;
        this.scheduleOnce(() => {
            this.spine.setAnimation(0, "open-loop", true);
        }, time);
    }

    finish() {
        this.m_stop = true;
        director.emit(GameEvent.PLAYER_STOP, this.center.worldPosition.clone());
    }
}


