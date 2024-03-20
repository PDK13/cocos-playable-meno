import { _decorator, Collider2D, Component, Contact2DType, director, IPhysics2DContact, Node } from 'cc';
import GameEvent from '../GameEvent';
const { ccclass, property } = _decorator;

@ccclass('ObjectCake')
export class ObjectCake extends Component {

    m_stop: boolean = false;

    start() {
        let collider = this.getComponent(Collider2D);
        collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }

    onBeginContact (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if(this.m_stop || otherCollider.tag != 100)//player
            return;  
        this.m_stop = true;  
        setTimeout(() => {
            director.emit(GameEvent.PLAYER_TALL, true);
            this.node.destroy();
        }, 1);        
    }
}


