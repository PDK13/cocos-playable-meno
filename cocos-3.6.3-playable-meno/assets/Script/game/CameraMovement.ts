import { _decorator, Component, Node, Vec3, v3, Camera, CCFloat, director, tween, Tween, AudioSource, CCBoolean } from 'cc';
import { BackgroundParallax } from './BackgroundParallax';
import GameEvent from '../GameEvent';
const { ccclass, property } = _decorator;

@ccclass('CameraMovement')
export default class CameraMovement extends Component {
    @property(CCBoolean)
    lockX: boolean = false;

    @property(CCBoolean)
    lockY: boolean = false;

    //

    @property(CCBoolean)
    limit: boolean = false;

    @property(CCFloat)
    maxX: number = 999;

    @property(CCFloat)
    minX: number = -999;

    @property(CCFloat)
    maxY: number = 999;

    @property(CCFloat)
    minY: number = -999;

    //

    @property(CCFloat)
    smoothTime = 0.1;

    @property(Node)
    player: Node | null = null;

    @property(Node)
    background: Node | null = null;

    m_parallaxes: BackgroundParallax[] = [];

    m_lock: Vec3;
    m_target: Vec3;
    m_stop: boolean = false;
    m_finishPos: Vec3;
    m_targetY: number = 0;

    onLoad() {
        director.on(GameEvent.PLAYER_STOP, this.onFinish, this);
        director.on(GameEvent.PLAYER_X4, this.onPlayerX4, this);
        director.on(GameEvent.PLAYER_GROUND, this.onPlayerGround, this);
        director.on(GameEvent.PLAYER_FLAG, this.onPlayerFlag, this);
        //
        this.m_parallaxes = this.getComponentsInChildren(BackgroundParallax);
        //
        if (this.lockX || this.lockY)
            this.m_lock = this.node.position.clone();
    }

    start() {
        this.m_target = this.node.position.clone();
        let cam = this.getComponent(Camera);
        let ratio = 540 / cam.orthoHeight;
        this.background.scale = new Vec3(2 / ratio, 2 / ratio, 1);
    }

    lateUpdate(dt: number) {
        if (!this.lockX || !this.lockY) {
            let target = v3();
            if (this.m_stop) {
                target = this.m_finishPos;
            }
            else {
                target = this.player.position.clone();
                if ((this.m_targetY - target.y) > 100)
                    this.m_targetY = target.y;
            }
            target.y = this.m_targetY + 300;
            //
            //LOCK:
            if (this.lockX)
                target.x = this.m_lock.x;
            if (this.lockY)
                target.y = this.m_lock.y;
            //
            //LIMIT:
            if (this.limit) {
                if (target.x > this.maxX)
                    target.x = this.maxX;
                else
                    if (target.x < this.minX)
                        target.x = this.minX;

                if (target.y > this.maxY)
                    target.y = this.maxY;
                else
                    if (target.y < this.minY)
                        target.y = this.minY;
            }
            //
            this.m_target = this.m_target.lerp(target, this.smoothTime);
            this.node.position = this.m_target;
        }
        //
        this.m_parallaxes.forEach(element => {
            element.excute();
        });
    }

    onPlayerFlag() {
        Tween.stopAllByTarget(this.node);
        this.node.eulerAngles = v3();
        this.getComponent(AudioSource).stop();
    }

    onFinish(position: Vec3) {
        this.m_stop = true;
        this.m_finishPos = position.clone();
        Tween.stopAllByTarget(this.node);
        this.node.eulerAngles = v3();
        this.getComponent(AudioSource).stop();
    }

    onPlayerX4(active: boolean) {
        if (active) {
            let rotate1 = tween(this.node).to(0.025, { eulerAngles: v3(0, 0, 0.5) });
            let rotate2 = tween(this.node).to(0.025, { eulerAngles: v3(0, 0, -0.5) });
            tween(this.node).sequence(rotate1, rotate2).repeatForever().start();
        }
    }

    onPlayerGround(targetY: number) {
        this.m_targetY = targetY;
    }
}
