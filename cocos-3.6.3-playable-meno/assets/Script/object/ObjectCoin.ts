import { _decorator, AudioSource, Collider2D, Component, Contact2DType, IPhysics2DContact, Node, sp, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ObjectCoin')
export class ObjectCoin extends Component {
    @property(Node)
    effect: Node = null;

    @property(AudioSource)
    audio: AudioSource = null;

    m_stop: boolean = false;
    m_collider: Collider2D = null;

    onLoad() {
        this.m_collider = this.getComponent(Collider2D);
        if (this.m_collider) {
            this.m_collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            //collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        }
    }

    onBeginContact (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        
        if(this.m_stop)
            return;
        switch(otherCollider.tag)
        {
            case 100://player
                this.m_stop = true;
                this.doEffect();
                break;
        }
    }

    doEffect()
    {
        let audio = this.audio;
        audio.play();
        audio.node.setParent(this.node.parent, true);
        this.m_collider.destroy();
        this.getComponent(UIOpacity).opacity = 0;
        //
        let effect = this.effect;
        effect.setParent(this.node.parent, true);
        effect.active = true;
        effect.setWorldPosition(this.node.worldPosition);
        effect.getComponent(sp.Skeleton).setAnimation(0, 'animation', false); 
        setTimeout(() => {
            effect.destroy();
            audio.destroy();
        }, 1000);       
        setTimeout(() => {
            this.node.destroy();
        }, 1);
    }
}


