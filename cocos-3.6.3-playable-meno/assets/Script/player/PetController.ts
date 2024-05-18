import { _decorator, AudioSource, BoxCollider2D, CCFloat, CCString, Collider2D, Component, director, instantiate, Node, PhysicsSystem2D, RigidBody2D, sp, tween, v2, v3, Vec2, Vec3 } from 'cc';
import GameEvent from '../GameEvent';
import { PlayerState } from './PlayerController';
const { ccclass, property } = _decorator;

@ccclass('PetController')
export class PetController extends Component {
    
    @property(CCString)
    defaultSkin = "2";

    @property(CCString)
    growSkin = "2_grow";

    @property(CCFloat)
    xDamping = 40;

    @property(CCFloat)
    airSpeedX = 200;

    @property(CCFloat)
    maxSpeedX = 1000;

    @property(CCFloat)
    jumpForce = 1000;
    @property(CCFloat)
    fanSpeedRatio = 1;

    @property(RigidBody2D)
    rigidbody: RigidBody2D = null;

    @property(sp.Skeleton)
    spine: sp.Skeleton = null;

    @property(Node)
    fan: Node = null;

    @property(AudioSource)
    jumpAudio: AudioSource = null;

    @property(AudioSource)
    hurtAudio: AudioSource = null;

    @property(AudioSource)
    finishAudio: AudioSource = null;

    m_bodyCollider: BoxCollider2D = null;
    m_botCollider: BoxCollider2D = null;
    m_topCollider: BoxCollider2D = null;

    m_isTall: boolean = false;
    m_grounded: boolean = false;
    m_moveDirection: number = 0;
    m_lockInput: boolean = false;
    m_baseScale: Vec3; 
    m_ratioSize: number;
    m_baseMass: number;  
    m_baseGravityScale: number = 0;
    m_lockJump: boolean = true;  
    m_hurt: boolean = false;
    m_state = PlayerState.IDLE;
    m_fire: boolean;
    m_currentTarget: Node = null;
    m_waitFinish: boolean = false;
    m_finish:boolean = false;
    m_finishPos: Vec3 = v3();    

    m_jumpTime: number = 0.25;
    m_jumpTimeCounter: number = 0;
    m_activeJumpInput: boolean = false;    

    get isBig(){
        return this.m_ratioSize > 1;
    }

    get isTall(){
        return this.m_isTall;
    }

    get isFan(){
        return this.fan.active;
    }

    onLoad() {

        this.m_baseScale = this.node.scale.clone();
        this.m_ratioSize = 1; 
        this.m_baseGravityScale = this.rigidbody.gravityScale;

        director.on(GameEvent.PLAYER_JUMP, this.onJump, this);
        director.on(GameEvent.PLAYER_JUMP_RELEASE, this.onJumRelease, this);
        director.on(GameEvent.PLAYER_JUMP_STOP, this.onStopJump, this);
        director.on(GameEvent.PLAYER_MOVE_LEFT, this.onPlayerMoveLeft, this);
        director.on(GameEvent.PLAYER_MOVE_RIGHT, this.onPlayerMoveRight, this);
        director.on(GameEvent.PLAYER_MOVE_STOP, this.onPlayerMoveStop, this);
        director.on(GameEvent.PLAYER_STOP, this.onPlayerStop, this);
        director.on(GameEvent.PLAYER_HURT, this.onHurt, this);
        director.on(GameEvent.PLAYER_X4, this.onX4, this);
        director.on(GameEvent.PLAYER_FLAG, this.onFlag, this);
        director.on(GameEvent.PLAYER_TALL, this.onTall, this);
        director.on(GameEvent.PLAYER_FAN, this.onFan, this);

        //physic    
        let colliders = this.getComponents(Collider2D);    
        colliders.forEach(c =>{
            switch(c.tag)
            {
                case 100:
                    this.m_bodyCollider = c as BoxCollider2D;
                    break;
                case 101:
                    //this.m_topCollider = c as BoxCollider2D;
                    break;
                case 102:
                    this.m_botCollider = c as BoxCollider2D;
                    break;
            }
        });
        // if (PhysicsSystem2D.instance) {
        //     PhysicsSystem2D.instance.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        //     //PhysicsSystem2D.instance.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        // }

    }    

    start(){
        this.m_baseMass = this.rigidbody.getMass();
        //
        this.onTall(false);      
        //
        this.m_jumpTimeCounter = this.m_jumpTime;
    }

    onFlag()
    {
        if(this.m_finish)
            return;
        this.fan.active = false;
        this.m_finish = true;
        this.m_waitFinish = true;
        this.m_lockInput = true;
        this.m_moveDirection = 0;
        this.rigidbody.linearVelocity = v2();
        this.rigidbody.gravityScale = 0;
        //
        let entry = this.spine.setAnimation(0, 'khe_lua', true);
        let basePos = this.node.getWorldPosition();
        basePos.x += 100;
        setTimeout(() => {
            //this.spine.setAnimation(0, '1_leo_cot2', true);
            if(this.isBig)
            {
                tween(this.node).to(0.2, {scale: this.m_baseScale.clone(), worldPosition: basePos}).call(()=>{
                    this.rigidbody.gravityScale = 5;
                    this.rigidbody.wakeUp();
                }).delay(0.01).start();
            }else
            {
                this.rigidbody.gravityScale = 5;
                this.rigidbody.wakeUp();
            }
        }, 0.2*1000);
    }

    onFan(active: boolean) {
        this.onTall(false);
        this.fan.active = true;      
    }

    onX4(active: boolean) {
        this.onTall(false);
        setTimeout(() => {
            let ratio = active ? 4 : 1;
            tween(this.node).to(0.25, {scale: this.m_baseScale.clone().multiplyScalar(ratio)}).call(()=>{            
                this.m_bodyCollider.apply();
            }).start();
            this.m_ratioSize = ratio;
        }, 1);        
    }

    onTall(active: boolean)
    {
        this.m_isTall = active;
        // let skinData = this.spine._skeleton.data.findSkin(active ? this.growSkin : this.defaultSkin);
        // let skin = new sp.spine.Skin('new-skin');
        // skin.addSkin(skinData);
        // this.spine._skeleton.setSkin(skin);
        // this.spine._skeleton.setSlotsToSetupPose();
        // this.spine.getState().apply(this.spine._skeleton);
        //update collider
        if(active)
        {
            if(this.isBig)
                return;
            //body
            let size = this.m_bodyCollider.size.clone();
            let offset = this.m_bodyCollider.offset.clone();
            size.y = 240;
            offset.y = 122;
            this.m_bodyCollider.size = size;
            this.m_bodyCollider.offset = offset;
            this.m_bodyCollider.apply();
            //top
            // offset = this.m_topCollider.offset.clone();
            // offset.y = 245;
            // this.m_topCollider.offset = offset;
            // this.m_topCollider.apply();
        }else
        {
            //body
            let size = this.m_bodyCollider.size.clone();
            let offset = this.m_bodyCollider.offset.clone();
            size.y = 180;
            offset.y = 92;
            this.m_bodyCollider.size = size;
            this.m_bodyCollider.offset = offset;
            this.m_bodyCollider.apply();
            //top
            // offset = this.m_topCollider.offset.clone();
            // offset.y = 185;
            // this.m_topCollider.offset = offset;
            // this.m_topCollider.apply();
        }
    }

    onJumRelease()
    {
        if(this.m_finish)
            return
        this.m_lockJump = true;
        this.m_jumpTimeCounter = this.m_jumpTime;
        this.m_activeJumpInput = false; 
        this.rigidbody.gravityScale = this.m_baseGravityScale;
        this.rigidbody.wakeUp();
    }

    onStopJump()
    {
        this.m_lockJump = true;  
        this.m_activeJumpInput = false; 
    }

    onJump(dt: number) {         
        this.m_activeJumpInput = true;
        if (this.m_finish || this.m_lockInput || this.m_lockJump)
            return;
        if(this.m_jumpTimeCounter <= 0)
        {
            this.m_lockJump = true;
            return;
        }
        this.m_jumpTimeCounter -= dt;
        let veloc = this.rigidbody.linearVelocity;
        veloc.y = this.jumpForce;
        this.rigidbody.linearVelocity = veloc; 
    }

    stopFire()
    {
        this.m_fire = false;
        this.spine.getState().setEmptyAnimation(1, 0.1);
        this.spine.getState().setEmptyAnimation(2, 0.1);
    }

    onHurt() {
        if(this.m_hurt)
            return;
        this.stopFire();
        this.m_state = PlayerState.HURT;
        this.m_hurt = true;        
        this.m_lockInput = true;        
        let entry = this.spine.setAnimation(0, 'hit', false);
        this.hurtAudio.play();
        this.scheduleOnce(() => {
            this.m_lockInput = false;
            this.m_hurt = false;
        }, entry.animationEnd);
    }

    onPlayerMoveLeft() {
        if(this.m_finish || this.m_lockInput)
            return;
        if(this.spine._skeleton.scaleX > 0)
            this.m_currentTarget = null;
        this.m_moveDirection = -1;    
        let scale = this.node.getScale();
        scale.x = -Math.abs(scale.x);    
        this.node.setScale(scale);
    }

    onPlayerMoveRight() {
        if(this.m_finish || this.m_lockInput)
            return;
        if(this.spine._skeleton.scaleX < 0)
            this.m_currentTarget = null;
        this.m_moveDirection = 1;
        let scale = this.node.getScale();
        scale.x = Math.abs(scale.x);    
        this.node.setScale(scale);
    }

    onPlayerMoveStop() {
        this.m_moveDirection = 0;
        let veloc = this.rigidbody.linearVelocity.clone();
        veloc.x = 0;
        this.rigidbody.linearVelocity = veloc;
    }

    onPlayerStop(position: Vec3) {
        this.stopFire();
        this.spine.setAnimation(0, 'run', true);
        this.finishAudio.play();
        this.m_finishPos = position.clone();
        this.finish();
    }    

    update(dt: number) {
        //check ground        
        const results = PhysicsSystem2D.instance.testAABB(this.m_botCollider.worldAABB);
        if(results.length < 1)
            this.m_grounded = false;
        else
        {    
            for (let i = 0; i < results.length; i++) 
            {
                if(results[i].tag == -1)//ground
                {
                    this.m_grounded = true;
                    this.m_lockJump = false;
                    director.emit(GameEvent.PLAYER_GROUND, this.node.worldPosition.y);
                    break;                    
                }else
                    this.m_grounded = false;
            }
        }
        if(this.m_waitFinish)
        {
            if(this.m_grounded)
            {
                this.m_waitFinish = false;
                director.emit(GameEvent.FINISH_FLAG);
            }
        }
        
        if(this.m_finish)
            return; 
        this.updateState();
        let veloc = this.rigidbody.linearVelocity.clone();
        let current = veloc.clone();
        veloc.x += this.m_moveDirection * this.airSpeedX;   
        if (veloc.x > this.maxSpeedX)
            veloc.x = this.maxSpeedX;
        else if (veloc.x < -this.maxSpeedX)
            veloc.x = -this.maxSpeedX;
        let realVeloc = current.lerp(veloc, this.xDamping * dt);
        if(this.isFan && !this.m_grounded && this.m_activeJumpInput && realVeloc.y <= 0)
        {
            realVeloc.x *= this.fanSpeedRatio;
            realVeloc.y = 0;
            this.rigidbody.gravityScale = 0;
        }
        this.rigidbody.linearVelocity = realVeloc;   
    }

    finish()
    { 
        let posX = this.node.worldPosition.x;
        let time = Math.abs(posX - this.m_finishPos.x)/1000; 
        let obj = {x: posX};
        tween(obj).to(time, {x: this.m_finishPos.x}, {onUpdate: (t, ratio:number)=>{
            let worldPos = this.node.worldPosition.clone();
            worldPos.x = t.x;
            this.node.worldPosition = worldPos;
        }}).call(()=>{
            this.spine.setAnimation(0, 'growl', true);
        }).delay(2).call(()=>{
            director.emit(GameEvent.GAME_FINISH);
        }).start();
    }

    addForceY(force: number) {
        let veloc = this.rigidbody.linearVelocity;
        veloc.y = force;
        this.rigidbody.linearVelocity = veloc;
        //
        this.m_grounded = false;
    }

    addForce(force: Vec2) {
        this.rigidbody.linearVelocity = force;
    }

    updateState()
    {
        let state = PlayerState.IDLE;
        //find state
        if(this.m_hurt)
            return;
        if(this.m_grounded)
        {
            if(this.m_moveDirection == 0)
                state = PlayerState.IDLE;
            else
                state = PlayerState.MOVE;
        }else
        {
            if(this.rigidbody.linearVelocity.y > 0)
                state = PlayerState.JUMP;
            else
                state = PlayerState.AIR;
        }
        //update state
        if(this.m_state == state)
            return;
        this.unschedule(this.onTransitionIdle);
        switch(Number(state))
        {
            case PlayerState.IDLE:
                if(this.m_state == PlayerState.AIR)
                {
                    let entry = this.spine.setAnimation(0, 'jump_down_idle', false);
                    this.scheduleOnce(this.onTransitionIdle, entry.animationEnd);
                }else
                    this.spine.setAnimation(0, 'idle', true);
                break;
            case PlayerState.MOVE:
                this.spine.setAnimation(0, 'run', true);
                break;
            case PlayerState.JUMP:  
                let entry = this.spine.setAnimation(0, 'jump_up', false);  
                this.jumpAudio.play();    
                // setTimeout(() => {
                //     this.spine.setAnimation(0, 'air_on', true);
                // },entry.animationEnd*1000);     
                break;
            case PlayerState.AIR:
                this.spine.setAnimation(0, 'jump_down', false);
                break;
            case PlayerState.HURT:                
                break;
        }
        this.m_state = state;
    }

    onTransitionIdle()
    {
        this.spine.setAnimation(0, 'idle', true);
    }

    // onBeginContact (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
    //     if(otherCollider.tag != 200)
    //         return;    
    //     this.m_targets.push(otherCollider.node);    
    // }

    // onEndContact (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
    //     if(otherCollider.tag != 200)
    //         return;
    //     let index = this.m_targets.indexOf(otherCollider.node);
    //     if(index > -1)
    //         this.m_targets.splice(index, 1);
    // } 
}


