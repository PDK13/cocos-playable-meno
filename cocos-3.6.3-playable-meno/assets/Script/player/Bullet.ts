import { _decorator, AudioSource, Collider2D, Component, Contact2DType, IPhysics2DContact, Node, sp, v3, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component {

    @property(sp.Skeleton)
    spine: sp.Skeleton = null;
    
    @property(AudioSource)
    shootAudio: AudioSource = null;

    @property(AudioSource)
    impactAudio: AudioSource = null;

    m_direction: Vec3 = v3();
    m_speed: number = 0;
    m_maxRange: number = 0;
    m_stop: boolean = false;
    m_distance: number = 0;

    init(direction: Vec3, speed: number, maxRange: number)
    {
        this.m_direction = direction;
        this.m_speed = speed;
        this.m_stop = false;
        this.m_maxRange = maxRange;
        this.m_distance = 0;
        //
        let collider = this.getComponent(Collider2D);
        collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        this.shootAudio.node.parent = this.node.parent;
        this.shootAudio.play();
    }

    update(dt: number){
        if(this.m_stop)
            return;
        let vecSpeed = this.m_direction.clone().multiplyScalar(this.m_speed*dt);
        this.m_distance += vecSpeed.length();
        this.node.worldPosition = this.node.worldPosition.clone().add(vecSpeed);
        if(this.m_distance >= this.m_maxRange)
        {
            this.m_stop = true;
            setTimeout(() => {
                this.node.destroy();
            }, 10);
        }
    }

    onBeginContact (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) 
    {  
        if(this.m_stop)    
            return;  
        switch(otherCollider.tag)
        {
            case -1://ground
            case 200://monster   
                this.impactAudio.node.parent = this.node.parent;
                this.impactAudio.play();
                this.m_stop = true;
                otherCollider.node.emit("onDead");
                let entry = this.spine.setAnimation(0, 'explosion', false);
                setTimeout(() => {
                    this.node.destroy();
                }, entry.animationEnd*1000);
                break;
        }
    }
}


