import { _decorator, Component, Vec2, RigidBody2D, Vec3, tween, sp, Collider2D } from 'cc';
import { BaseSpine } from '../base/BaseSpine';
const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {

    protected m_rigidbody: RigidBody2D = null;
    protected m_spine: BaseSpine = null;

    //

    protected m_control: boolean = true;

    get Control() {
        return this.m_control;
    }

    set Control(value: boolean) {
        this.m_control = value;
    }

    //

    protected m_big: boolean = false;

    get isBig() {
        return this.m_big;
    }

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
}