import { _decorator, AudioClip, AudioSource, BoxCollider2D, Collider2D, Component, Contact2DType, director, Enum, instantiate, IPhysics2DContact, Node, Prefab, RigidBody2D, sp, tween, v3 } from 'cc';
import GameEvent from '../GameEvent';
import { PlayerControllerMeno } from '../player/PlayerControllerMeno';
const { ccclass, property } = _decorator;

export enum BrickType
{
    NONE,
    COIN,
    CAKE
}

@ccclass('ObjectBlockBrick')
export class ObjectBlockBrick extends Component {

    @property({
        type: Enum(BrickType),
        displayName: "Brick Type"
    })
    brickType = BrickType.NONE;

    @property(BoxCollider2D)
    collider: BoxCollider2D = null;

    @property(Node)
    body: Node = null;

    @property(Node)
    effect: Node = null;
    
    @property(Prefab)
    coin: Prefab = null;

    @property(Node)
    cake: Node = null;

    @property(AudioSource)
    audioSource: AudioSource = null;

    @property(AudioClip)
    clipHit: AudioClip = null;

    @property(AudioClip)
    clipBreak: AudioClip = null;

    @property(AudioClip)
    clipCoin: AudioClip = null;

    m_maxCoin: number = 5;

    onLoad() {
        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }

    onBeginContact (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) 
    {              
        let player = otherCollider.getComponent(PlayerControllerMeno);
        switch(otherCollider.tag)
        {
            case 100://player                        
                if(player)
                {
                    if(player.isBig)
                    {
                        setTimeout(() => {
                            this.explode();
                        }, 1);
                    }
                }else
                {
                    setTimeout(() => {
                        this.explode();
                    }, 1);
                }
                break;
            case 101://player head
                if(player && player.rigidbody.linearVelocity.y >= 0)
                {
                    setTimeout(() => {
                        director.emit(GameEvent.PLAYER_JUMP_STOP);                
                        this.doBrick(player.isTall, player.isBig);                    
                    }, 1);  
                }              
                break;
        }
    }

    doBrick(isTall: boolean, isBig: boolean)
    {
        if(!isBig)
        {   
            tween(this.body.position).to(0.05, {y: 50}).to(0.05, {y: 0}).start();
            switch(this.brickType)
            {
                case BrickType.NONE:     
                    if(this.cake && this.cake.active)
                    {
                        this.audioSource.playOneShot(this.clipHit);
                        this.cake.destroy();
                        this.cake = null;
                        director.emit(GameEvent.PLAYER_TALL, true);
                    }
                    else if(isTall)
                    {
                        this.explode();
                    }
                    else
                        this.audioSource.playOneShot(this.clipHit);
                    break;
                case BrickType.COIN:
                    this.m_maxCoin--;
                    this.audioSource.playOneShot(this.clipCoin);
                    let c = instantiate(this.coin);
                    c.setParent(this.node.parent, true);
                    let pos = this.node.getWorldPosition();
                    pos.y += 60;
                    c.worldPosition = pos;
                    c.setSiblingIndex(this.node.getSiblingIndex()-1);
                    setTimeout(() => {     
                        c.destroy();
                    }, 500);   
                    if(this.m_maxCoin < 1)
                        this.brickType = BrickType.NONE;
                    break;
                case BrickType.CAKE:
                    this.cake.active = true;
                    tween(this.cake).to(0.2, {position: v3(0, 100, 0) }).start();
                    this.brickType = BrickType.NONE;
                    break;
            }
        }
    }

    explode()
    {
        let audioSource = this.audioSource;
        audioSource.playOneShot(this.clipBreak);
        audioSource.node.setParent(this.node.parent);
        setTimeout(() => {
            audioSource.destroy();
        }, 1000);
        this.effect.active = true;
        this.effect.setParent(this.node.parent, true);
        setTimeout(() => {
            this.node.destroy();
        }, 1);                        
    }
}


