import { _decorator, Node, AudioSource, Component, Vec2, director, RigidBody2D, Vec3, tween, v3, Quat, CCFloat, sp, PhysicsSystem2D, ERaycast2DType, v2, input, Contact2DType, Collider2D, IPhysics2DContact, Input, __private, EventMouse, instantiate, math, Skeleton, BoxCollider2D, Rect, CCString } from 'cc';
import GameEvent from '../GameEvent';
import { BaseSpine } from '../base/BaseSpine';
import { BasePlayer } from '../base/BasePlayer';
const { ccclass, property } = _decorator;
const { spine } = sp;

export enum PlayerState {
    IDLE,
    MOVE,
    JUMP,
    AIR,
    HURT
}

@ccclass('PlayerController')
export class PlayerController extends Component {

    @property(CCString)
    defaultSkin = "2";

    @property(CCString)
    growSkin = "2_grow";

    @property(CCString)
    animIdle: string = 'idle';

    @property(CCString)
    animMove: string = 'run';

    @property(CCString)
    animJumpUp: string = 'jump_up';

    @property(CCString)
    animAirOn: string = 'air_on';

    @property(CCString)
    animAirOff: string = 'air_off';

    @property(CCFloat)
    xDamping = 40;

    @property(CCFloat)
    airSpeedX = 10;

    @property(CCFloat)
    maxSpeedX = 40;

    @property(CCFloat)
    jumpForce = 50;

    @property(CCFloat)
    bulletSpeed = 4000;

    @property(CCFloat)
    bulletRange = 1000;

    @property(CCFloat)
    fanSpeedRatio = 1;

    @property(Node)
    bulletSample: Node = null;

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
    m_baseGravityScale: number = 0;
    m_hurt: boolean = false;
    m_state = PlayerState.IDLE;
    m_spineScaleX: number;
    m_fire: boolean;
    m_currentTarget: Node = null;
    m_waitFinish: boolean = false;
    m_finishPos: Vec3 = v3();
    m_lockInput: boolean = false;
    m_lockJump: boolean = false;
    m_moveDirection: number = 0;
    m_ratioSize: number = 1;
    m_baseScale: Vec3 = Vec3.ONE;
    m_baseMass: number;
    m_grounded: boolean = false;
    m_immortal: boolean = false;
    m_finish: boolean = false;
    m_jumpTime: number = 0.25;
    m_jumpTimeCounter: number = 0;
    m_activeJumpInput: boolean = false;
    m_big: boolean = false;

    m_rigidbody: RigidBody2D = null;
    m_spine: BaseSpine = null;
    m_player: BasePlayer = null;

    get isTall() {
        return this.m_isTall;
    }

    get isFan() {
        return this.fan.active;
    }

    onLoad() {
        this.m_rigidbody = this.getComponent(RigidBody2D);
        this.m_spine = this.getComponent(BaseSpine);
        this.m_player = this.getComponent(BasePlayer);
        //
        this.m_baseScale = this.node.scale.clone();
        this.m_ratioSize = 1;
        this.m_baseGravityScale = this.m_rigidbody.gravityScale;
        //
        director.on(GameEvent.PLAYER_JUMP, this.onJump, this);
        director.on(GameEvent.PLAYER_JUMP_RELEASE, this.onJumRelease, this);
        director.on(GameEvent.PLAYER_JUMP_STOP, this.onStopJump, this);
        director.on(GameEvent.PLAYER_FIRE, this.onFire, this);
        director.on(GameEvent.PLAYER_MOVE_LEFT, this.onPlayerMoveLeft, this);
        director.on(GameEvent.PLAYER_MOVE_RIGHT, this.onPlayerMoveRight, this);
        director.on(GameEvent.PLAYER_MOVE_STOP, this.onPlayerMoveStop, this);
        director.on(GameEvent.PLAYER_STOP, this.onPlayerStop, this);
        director.on(GameEvent.PLAYER_HURT, this.onHurt, this);
        director.on(GameEvent.PLAYER_X4, this.onX4, this);
        director.on(GameEvent.PLAYER_FLAG, this.onFlag, this);
        director.on(GameEvent.PLAYER_TALL, this.onTall, this);
        director.on(GameEvent.PLAYER_FAN, this.onFan, this);
        //
        //physic
        let colliders = this.getComponents(Collider2D);
        colliders.forEach(c => {
            switch (c.tag) {
                case 100:
                    this.m_bodyCollider = c as BoxCollider2D;
                    break;
                case 101:
                    this.m_topCollider = c as BoxCollider2D;
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

    start() {
        this.m_baseMass = this.m_rigidbody.getMass();
        //
        this.onTall(false);

        this.m_spineScaleX = this.m_spine.spine._skeleton.scaleX;
        //
        this.m_jumpTimeCounter = this.m_jumpTime;
    }

    onFlag() {
        if (this.m_finish)
            return;
        this.fan.active = false;
        this.m_finish = true;
        this.m_waitFinish = true;
        this.m_lockInput = true;
        this.m_moveDirection = 0;
        this.m_rigidbody.linearVelocity = v2();
        this.m_rigidbody.gravityScale = 0;
        //
        let duration = this.m_spine.SetAnim('1_leo_cot', false);
        let basePos = this.node.getWorldPosition();
        basePos.x += 100;
        setTimeout(() => {
            this.m_spine.SetAnim('1_leo_cot2', true);
            if (this.isBig) {
                tween(this.node).to(0.2, { scale: this.m_baseScale.clone(), worldPosition: basePos }).call(() => {
                    this.m_rigidbody.gravityScale = 5;
                    this.m_rigidbody.wakeUp();
                }).delay(0.01).start();
            } else {
                this.m_rigidbody.gravityScale = 5;
                this.m_rigidbody.wakeUp();
            }
        }, duration);
    }

    onFan(active: boolean) {
        this.onTall(false);
        this.fan.active = true;
    }

    onX4(active: boolean) {
        this.onTall(false);
        setTimeout(() => {
            let ratio = active ? 4 : 1;
            tween(this.node).to(0.25, { scale: this.m_baseScale.clone().multiplyScalar(ratio) }).call(() => {
                this.m_bodyCollider.apply();
            }).start();
            this.m_ratioSize = ratio;
        }, 1);
        this.m_big = active;
    }

    

    get isBig() {
        return this.m_big;
    }

    onTall(active: boolean) {
        this.m_isTall = active;
        let skinData = this.m_spine.spine._skeleton.data.findSkin(active ? this.growSkin : this.defaultSkin);
        let skin = new sp.spine.Skin('new-skin');
        skin.addSkin(skinData);
        this.m_spine.spine._skeleton.setSkin(skin);
        this.m_spine.spine._skeleton.setSlotsToSetupPose();
        this.m_spine.spine.getState().apply(this.m_spine.spine._skeleton);
        //update collider
        if (active) {
            if (this.isBig)
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
            offset = this.m_topCollider.offset.clone();
            offset.y = 245;
            this.m_topCollider.offset = offset;
            this.m_topCollider.apply();
        } else {
            //body
            let size = this.m_bodyCollider.size.clone();
            let offset = this.m_bodyCollider.offset.clone();
            size.y = 180;
            offset.y = 92;
            this.m_bodyCollider.size = size;
            this.m_bodyCollider.offset = offset;
            this.m_bodyCollider.apply();
            //top
            offset = this.m_topCollider.offset.clone();
            offset.y = 185;
            this.m_topCollider.offset = offset;
            this.m_topCollider.apply();
        }
    }

    onJumRelease() {
        if (this.m_finish)
            return
        this.m_lockJump = true;
        this.m_jumpTimeCounter = this.m_jumpTime;
        this.m_activeJumpInput = false;
        this.m_rigidbody.gravityScale = this.m_baseGravityScale;
        this.m_rigidbody.wakeUp();
    }

    onStopJump() {
        this.m_lockJump = true;
        this.m_activeJumpInput = false;
    }

    onJump(dt: number) {
        this.m_activeJumpInput = true;
        if (this.m_finish || this.m_lockInput || this.m_lockJump || !this.m_player.Control)
            return;
        if (this.m_jumpTimeCounter <= 0) {
            this.m_lockJump = true;
            return;
        }
        this.m_jumpTimeCounter -= dt;
        let veloc = this.m_rigidbody.linearVelocity;
        veloc.y = this.jumpForce;
        this.m_rigidbody.linearVelocity = veloc;
    }

    onFire(active: boolean) {
        if (this.m_finish || this.m_hurt)
            return;
        if (active) {
            if (!this.m_fire)
                this.fire();
        }
        else
            this.stopFire();
        this.m_fire = active;
    }

    fire() {
        let duration = this.m_spine.SetAnimIndex(1, 'fight_1_mix', false);
        this.m_spine.SetAnimIndex(2, 'aim', true);
        this.scheduleOnce(() => {
            if (this.m_fire)
                this.fire();
        }, duration);
        this.scheduleOnce(() => {
            let bullet = instantiate(this.bulletSample);
            bullet.setParent(this.node.parent);
            bullet.active = true;
            //
            // let direction = this.aimGun.worldPosition.clone().subtract(this.rootGun.worldPosition.clone()).normalize();
            // bullet.worldPosition = this.rootGun.worldPosition.clone().add(v3(direction.clone().multiplyScalar(this.spine.spine._skeleton.scaleX * 100)));
            // bullet.getComponent(Bullet).init(direction, this.bulletSpeed, this.bulletRange);
        }, 0.05);
    }

    stopFire() {
        this.m_fire = false;
        this.m_spine.SetAnimEmty(1, 0.1);
        this.m_spine.SetAnimEmty(2, 0.1);
    }

    onHurt() {
        if (this.m_hurt)
            return;
        this.stopFire();
        this.m_state = PlayerState.HURT;
        this.m_hurt = true;
        this.m_lockInput = true;
        let duration = this.m_spine.SetAnim('hit', false);
        this.hurtAudio.play();
        this.scheduleOnce(() => {
            this.m_lockInput = false;
            this.m_hurt = false;
        }, duration);
    }

    onPlayerMoveLeft() {
        if (!this.m_player.Control) {
            this.onPlayerMoveStop();
            return;
        }
        if (this.m_finish || this.m_lockInput)
            return;
        if (this.m_spine.spine._skeleton.scaleX > 0)
            this.m_currentTarget = null;
        this.m_moveDirection = -1;
        this.m_spine.spine._skeleton.scaleX = this.m_moveDirection;
    }

    onPlayerMoveRight() {
        if (!this.m_player.Control) {
            this.onPlayerMoveStop();
            return;
        }
        if (this.m_finish || this.m_lockInput)
            return;
        if (this.m_spine.spine._skeleton.scaleX < 0)
            this.m_currentTarget = null;
        this.m_moveDirection = 1;
        this.m_spine.spine._skeleton.scaleX = this.m_moveDirection;
    }

    onPlayerMoveStop() {
        this.m_moveDirection = 0;
        let veloc = this.m_rigidbody.linearVelocity.clone();
        veloc.x = 0;
        this.m_rigidbody.linearVelocity = veloc;
    }

    onPlayerStop(position: Vec3) {
        this.stopFire();
        this.m_spine.SetAnim(this.animMove, true);
        this.finishAudio.play();
        this.m_finishPos = position.clone();
        this.finish();
    }

    update(dt: number) {
        //check ground        
        const results = PhysicsSystem2D.instance.testAABB(this.m_botCollider.worldAABB);
        if (results.length < 1)
            this.m_grounded = false;
        else {
            for (let i = 0; i < results.length; i++) {
                if (results[i].tag == -1)//ground
                {
                    this.m_grounded = true;
                    this.m_lockJump = false;
                    director.emit(GameEvent.PLAYER_GROUND, this.node.worldPosition.y);
                    break;
                } else
                    this.m_grounded = false;
            }
        }
        if (this.m_waitFinish) {
            if (this.m_grounded) {
                this.m_waitFinish = false;
                director.emit(GameEvent.FINISH_FLAG);
            }
        }

        if (this.m_finish)
            return;
        this.updateState();
        let veloc = this.m_rigidbody.linearVelocity.clone();
        let current = veloc.clone();
        veloc.x += this.m_moveDirection * this.airSpeedX;
        if (veloc.x > this.maxSpeedX)
            veloc.x = this.maxSpeedX;
        else if (veloc.x < -this.maxSpeedX)
            veloc.x = -this.maxSpeedX;
        let realVeloc = current.lerp(veloc, this.xDamping * dt);
        if (this.isFan && !this.m_grounded && this.m_activeJumpInput && realVeloc.y <= 0) {
            realVeloc.x *= this.fanSpeedRatio;
            realVeloc.y = 0;
            this.m_rigidbody.gravityScale = 0;
        }
        this.m_rigidbody.linearVelocity = realVeloc;
    }

    finish() {
        let posX = this.node.worldPosition.x;
        let time = Math.abs(posX - this.m_finishPos.x) / 1000;
        let obj = { x: posX };
        tween(obj).to(time, { x: this.m_finishPos.x }, {
            onUpdate: (t, ratio: number) => {
                let worldPos = this.node.worldPosition.clone();
                worldPos.x = t.x;
                this.node.worldPosition = worldPos;
            }
        }).call(() => {
            this.m_spine.SetAnim('door_1', true);
        }).delay(2).call(() => {
            director.emit(GameEvent.GAME_FINISH);
        }).start();
    }

    addForceY(force: number) {
        let veloc = this.m_rigidbody.linearVelocity;
        veloc.y = force;
        this.m_rigidbody.linearVelocity = veloc;
        //
        this.m_grounded = false;
    }

    addForce(force: Vec2) {
        this.m_rigidbody.linearVelocity = force;
    }

    updateState() {
        let state = PlayerState.IDLE;
        //find state
        if (this.m_hurt)
            return;
        if (this.m_grounded) {
            if (this.m_moveDirection == 0)
                state = PlayerState.IDLE;
            else
                state = PlayerState.MOVE;
        } else {
            if (this.m_rigidbody.linearVelocity.y > 0)
                state = PlayerState.JUMP;
            else
                state = PlayerState.AIR;
        }
        //update state
        if (this.m_state == state)
            return;
        this.unschedule(this.onTransitionIdle);
        switch (Number(state)) {
            case PlayerState.IDLE:
                if (this.m_state == PlayerState.AIR) {
                    let duration = this.m_spine.SetAnim(this.animAirOff, false);
                    this.scheduleOnce(this.onTransitionIdle, duration);
                } else
                    this.m_spine.SetAnim(this.animIdle, true);
                break;
            case PlayerState.MOVE:
                this.m_spine.SetAnim(this.animMove, true);
                break;
            case PlayerState.JUMP:
                let duration = this.m_spine.SetAnim(this.animJumpUp, false);
                this.jumpAudio.play();
                setTimeout(() => {
                    this.m_spine.SetAnim(this.animAirOn, true);
                }, duration);
                break;
            case PlayerState.AIR:
                this.m_spine.SetAnim(this.animAirOn, true);
                break;
            case PlayerState.HURT:
                break;
        }
        this.m_state = state;
    }

    onTransitionIdle() {
        this.m_spine.SetAnim(this.animIdle, true);
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