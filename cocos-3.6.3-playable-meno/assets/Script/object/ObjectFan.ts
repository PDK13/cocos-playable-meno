import { _decorator, Collider2D, Component, Contact2DType, director, IPhysics2DContact, Node, RigidBody2D } from 'cc';
import GameEvent from '../GameEvent';
const { ccclass, property } = _decorator;

@ccclass('ObjectFan')
export class ObjectFan extends Component {
    m_stop: boolean = false;

    onLoad() {
        let collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            //collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        }
    }

    onBeginContact (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null)
    {      
        if(this.m_stop)
            return;         
        switch(otherCollider.tag)
        {
            case 100://player     
                this.m_stop = true;  
                setTimeout(() => {
                    director.emit(GameEvent.PLAYER_FAN, true);    
                    this.getComponent(RigidBody2D).sleep();
                    this.node.destroy();
                }, 1);
                break;
        }
    }
}


