import { _decorator, Component, PhysicsSystem2D, v2, Node, game, director, tween, v3, CCString, sys, Enum, CCBoolean, Input } from 'cc';
import GameEvent from './GameEvent';
import { CCInteger } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Loader')
export default class Loader extends Component {

    @property(CCBoolean)
    loop = false;

    @property(CCBoolean)
    loopTimeOut = false;

    @property(CCBoolean)
    directStore = false;

    @property(CCString)
    androidLink = "";

    @property(CCString)
    iosLink = "";

    @property(CCInteger)
    adsType = 0;

    @property(Node)
    panelComplete: Node = null;

    @property(Node)
    panelLose: Node = null;

    @property(Node)
    panelRestart: Node = null;

    static finish: boolean = false;

    onLoad() {
        game.frameRate = 59;
        director.on(GameEvent.GAME_FINISH, this.onFinish, this);
        director.on(GameEvent.GAME_LOSE, this.onLose, this);
        director.on(GameEvent.TIMER_OUT, this.onTimeOut, this);
        if (this.directStore || Loader.finish)
            this.node.on(Input.EventType.TOUCH_START, this.retryOnclick, this);
        //
        PhysicsSystem2D.instance.enable = true;
        //PhysicsSystem2D.instance.gravity = v2(0, -4000);
    }

    onFinish() {
        if (this.loop) {
            Loader.finish = true;
            director.loadScene(director.getScene().name);
            return;
        }
        this.panelComplete.active = true;
        let panel = this.panelComplete.getChildByName("panel");
        tween(panel).to(0.1, { scale: v3(1, 1, 1) }).start();
    }

    onLose() {
        if (this.loop) {
            Loader.finish = true;
            director.loadScene(director.getScene().name);
            return;
        }
        this.panelLose.active = true;
        let panel = this.panelLose.getChildByName("panel");
        tween(panel).to(0.1, { scale: v3(1, 1, 1) }).start();
    }

    onTimeOut() {
        if (this.loop && this.loopTimeOut) {
            Loader.finish = true;
            director.loadScene(director.getScene().name);
            return;
        }
        this.panelRestart.active = true;
        let panel = this.panelRestart.getChildByName("panel");
        tween(panel).to(0.1, { scale: v3(1, 1, 1) }).start();
    }

    retryOnclick() {
        let link = '';
        switch (sys.os) {
            case sys.OS.ANDROID:
                link = this.androidLink;
                break;
            case sys.OS.IOS:
                link = this.iosLink;
                break;
            default:
                link = this.androidLink;
                break;
        }
        openGameStoreUrl(link);
    }

    restartOnClick() {
        Loader.finish = true;
        director.loadScene(director.getScene().name);
    }
}
