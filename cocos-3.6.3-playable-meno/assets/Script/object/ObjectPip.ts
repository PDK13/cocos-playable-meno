import { _decorator, AudioSource, BoxCollider2D, Collider2D, Component, Contact2DType, IPhysics2DContact, Node, RigidBody2D, tween, v3 } from 'cc';
import { PlayerControllerMeno } from '../player/PlayerControllerMeno';
const { ccclass, property } = _decorator;

@ccclass('ObjectPip')
export class ObjectPip extends Component {

    @property(BoxCollider2D)
    collider: BoxCollider2D = null;

    @property(AudioSource)
    audioExplode: AudioSource = null;

    m_stop: boolean = false;

    onLoad() {
        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }

    onBeginContact (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) 
    {
        if(this.m_stop)
            return;
        let player = otherCollider.getComponent(PlayerControllerMeno);
        if(!player)
            return
        if(otherCollider.tag == 100 && player.isBig)
        {
            this.audioExplode.play();
            this.m_stop = true;
            let direction = this.node.getWorldPosition().subtract(otherCollider.node.worldPosition);
            this.getComponent(RigidBody2D).sleep();
            this.collider.sensor = true; 
            let directMove = v3();
            if(direction.x > 0)
                directMove = v3(1, 1, 0);
            else
                directMove = v3(-1, 1, 0);
            tween(this.node).to(1, {position: directMove.multiplyScalar(5000), eulerAngles: v3(0, 0, -720)}).call(()=>{this.node.destroy()}).start();
        }
    }

}


