import { _decorator, CCBoolean, CCFloat, CCInteger, Collider2D, Component, director, Node, RigidBody2D, tween, v3, Vec2, Vec3 } from 'cc';
import GameEvent from '../GameEvent';
const { ccclass, property } = _decorator;

@ccclass('BasePlayer')
export class BasePlayer extends Component {

    static PLAYER_DEAD: string = 'PLAYER_DEAD';
    static PLAYER_REVIVE: string = 'PLAYER_REVIVE';

    protected onLoad(): void {
        director.on(GameEvent.PLAYER_HURT, this.onHurt, this);
    }

    protected start(): void {
        this.m_revivePos = this.node.position.clone();
    }

    //

    protected m_control: boolean = true;

    get Control() { return this.m_control; }

    set Control(value: boolean) { this.m_control = value; }

    //

    m_x2: boolean = false;
    m_x4: boolean = false;

    onX2(Active: boolean) {
        this.m_x2 = Active;
        //
        if (this.m_x4)
            return;
        //
        let BaseScale: Vec3 = Vec3.ONE;
        let Ratio = Active ? 1.75 : 1;
        let Colliders = this.getComponents(Collider2D);
        setTimeout(() => {
            tween(this.node).to(0.25, { scale: BaseScale.clone().multiplyScalar(Ratio) }).call(() => {
                Colliders.forEach(c => {
                    c.apply();
                });
            }).start();
        }, 1);
    }

    onX4(Active: boolean) {
        this.m_x4 = Active;
        //
        if (!Active && this.m_x2) {
            this.onX2(true);
            return;
        }
        //
        let BaseScale: Vec3 = Vec3.ONE;
        let Ratio = Active ? 4 : 1;
        let Colliders = this.getComponents(Collider2D);
        setTimeout(() => {
            tween(this.node).to(0.25, { scale: BaseScale.clone().multiplyScalar(Ratio) }).call(() => {
                Colliders.forEach(c => {
                    c.apply();
                });
            }).start();
        }, 1);
    }

    //

    @property(CCBoolean)
    HurtDead: boolean = false;

    @property(CCFloat)
    HurtDelay: number = 1;

    m_dead: boolean = false;

    onHurt() {
        if (this.m_dead)
            return;
        if (this.HurtDead) {
            this.m_dead = true;
            if (this.revive > 0) {
                this.scheduleOnce(() => {
                    this.node.position = v3(this.m_revivePos.x, this.m_revivePos.y, this.node.position.z);
                    this.revive--;
                    this.m_dead = false;
                    director.emit(BasePlayer.PLAYER_REVIVE);
                }, this.HurtDelay);
            }
            else {
                this.scheduleOnce(() => {
                    director.emit(GameEvent.GAME_LOSE);
                }, this.HurtDelay);
            }
            director.emit(BasePlayer.PLAYER_DEAD);
        }
    }

    //

    @property(CCInteger)
    revive: number = 0;

    m_revivePos: Vec3;
}