import { _decorator, AudioSource, BoxCollider2D, Collider2D, Component, Contact2DType, director, IPhysics2DContact, Node, Vec3 } from 'cc';
import GameEvent from '../GameEvent';
const { ccclass, property } = _decorator;

@ccclass('ObjectFlag')
export class ObjectFlag extends Component {

    @property(Node)
    flag: Node = null;

    @property(AudioSource)
    audio: AudioSource = null;

    m_player: Node = null;
    m_flagCollider: BoxCollider2D = null;
    m_finish: boolean = false;
    m_startY: number = 0;
    m_startPos: Vec3;

    onLoad(){
        director.on(GameEvent.FINISH_FLAG, this.onFinishFlag, this);
    }

    start() {
        this.m_startPos = this.flag.getWorldPosition();
        let colliders = this.getComponents(Collider2D);
        colliders.forEach(c=>{
            if(c.tag != -1)
            {
                this.m_flagCollider = c as BoxCollider2D;
                c.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            }
        });
    }

    onFinishFlag()
    {
        this.m_player = null;
    }

    onBeginContact (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if(this.m_finish || otherCollider.tag != 100)
            return; 
        this.m_finish = true;
        this.m_player = otherCollider.node;
        this.m_startY = this.m_player.worldPosition.y;
        director.emit(GameEvent.PLAYER_FLAG);
        this.audio.play();
        setTimeout(() => {
            this.m_flagCollider.destroy();
        }, 1);
    }

    update(dt: number){
        if(!this.m_player)
            return;
        let delY = Math.abs(this.m_player.worldPosition.y - this.m_startY);
        let pos = this.m_startPos.clone();
        pos.y += delY;
        this.flag.worldPosition = pos;
    }
}


