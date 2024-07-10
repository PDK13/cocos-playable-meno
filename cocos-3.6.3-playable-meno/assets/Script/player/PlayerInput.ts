import { _decorator, Component, Node, input, Input, KeyCode, director, CCBoolean } from 'cc';
import GameEvent from '../GameEvent';
import Loader from '../Loader';
import { BasePlayer } from '../base/BasePlayer';
const { ccclass, property } = _decorator;

@ccclass('PlayerInput')
export class PlayerInput extends Component {

    @property(CCBoolean)
    loop = false;

    @property(CCBoolean)
    directStore = false;

    @property(Node)
    buttonLeft: Node = null;

    @property(Node)
    buttonRight: Node = null;

    @property(Node)
    buttonJump: Node = null;

    @property(Node)
    buttonFire: Node = null;

    @property(Node)
    buttonSwitch: Node = null;

    m_keyLeftActive: boolean = false;
    m_keyRightActive: boolean = false;
    m_jumpActive: boolean = false;
    m_fireActive: boolean = false;
    m_switchRB: number = 0;

    onLoad() {

        director.on(BasePlayer.PLAYER_REVIVE, this.onRevive, this);
        director.on(BasePlayer.PLAYER_DEAD, this.onDead, this);
        //

        if (this.directStore) {
            return;
        }
        if (this.loop) {
            this.buttonRight.getChildByName('hand').active = Loader.finish;
            if (Loader.finish)
                return;
        }
        
        input.on(Input.EventType.KEY_DOWN, this.onKeyPressed, this);
        input.on(Input.EventType.KEY_UP, this.onKeyReleased, this);
        //
        this.buttonJump.on(Input.EventType.TOUCH_START, this.onJumpStart, this);
        this.buttonJump.on(Input.EventType.TOUCH_END, this.onJumpEnd, this);
        this.buttonJump.on(Input.EventType.TOUCH_CANCEL, this.onJumpEnd, this);

        this.buttonLeft.on(Input.EventType.TOUCH_START, this.onLeftStart, this);
        this.buttonLeft.on(Input.EventType.TOUCH_END, this.onLeftEnd, this);
        this.buttonLeft.on(Input.EventType.TOUCH_CANCEL, this.onLeftEnd, this);

        this.buttonRight.on(Input.EventType.TOUCH_START, this.onRightStart, this);
        this.buttonRight.on(Input.EventType.TOUCH_END, this.onRightEnd, this);
        this.buttonRight.on(Input.EventType.TOUCH_CANCEL, this.onRightEnd, this);

        this.buttonFire.on(Input.EventType.TOUCH_START, this.onFireStart, this);
        this.buttonFire.on(Input.EventType.TOUCH_END, this.onFireEnd, this);
        this.buttonFire.on(Input.EventType.TOUCH_CANCEL, this.onFireEnd, this);

        this.buttonSwitch.on(Input.EventType.TOUCH_START, this.onSwitchRB, this);
    }

    onRevive() {
        this.buttonLeft.active = true;
        this.buttonRight.active = true;
        this.buttonJump.active = true;
    }

    onDead() {
        this.buttonLeft.active = false;
        this.buttonRight.active = false;
        this.buttonJump.active = false;
    }

    onJumpStart() {
        this.m_jumpActive = true;
    }

    onJumpEnd() {
        this.m_jumpActive = false;
        director.emit(GameEvent.PLAYER_JUMP_RELEASE);
    }

    onFireStart() {
        this.m_fireActive = true;
    }

    onFireEnd() {
        this.m_fireActive = false;
        director.emit(GameEvent.PLAYER_FIRE, false);
    }

    onLeftStart() {
        this.m_keyLeftActive = true;
    }

    onLeftEnd() {
        this.m_keyLeftActive = false;
        if (!this.m_keyRightActive)
            director.emit(GameEvent.PLAYER_MOVE_STOP);
    }

    onRightStart() {
        this.m_keyRightActive = true;
    }

    onRightEnd() {
        this.m_keyRightActive = false;
        if (!this.m_keyLeftActive)
            director.emit(GameEvent.PLAYER_MOVE_STOP);
    }

    onKeyPressed(event) {
        let keyCode = event.keyCode;
        switch (keyCode) {
            case KeyCode.ARROW_LEFT:
                this.m_keyLeftActive = true;
                break;
            case KeyCode.ARROW_RIGHT:
                this.m_keyRightActive = true;
                break;
            case KeyCode.SPACE:
            case KeyCode.ARROW_UP:
                this.m_jumpActive = true;
                break;
            case KeyCode.KEY_S:
                this.m_fireActive = true;
                break;
        }
    }

    onKeyReleased(event) {
        let keyCode = event.keyCode;
        switch (keyCode) {
            case KeyCode.ARROW_LEFT:
                this.m_keyLeftActive = false;
                if (!this.m_keyRightActive)
                    director.emit(GameEvent.PLAYER_MOVE_STOP);
                break;
            case KeyCode.ARROW_RIGHT:
                this.m_keyRightActive = false;
                if (!this.m_keyLeftActive)
                    director.emit(GameEvent.PLAYER_MOVE_STOP);
                break;
            case KeyCode.SPACE:
            case KeyCode.ARROW_UP:
                this.m_jumpActive = false;
                director.emit(GameEvent.PLAYER_JUMP_RELEASE);
                break;
            case KeyCode.KEY_S:
                this.m_fireActive = false;
                director.emit(GameEvent.PLAYER_FIRE, false);
                break;
        }
    }

    update(dt: number) {
        if (this.m_keyLeftActive)
            director.emit(GameEvent.PLAYER_MOVE_LEFT);
        else if (this.m_keyRightActive)
            director.emit(GameEvent.PLAYER_MOVE_RIGHT);

        if (this.m_jumpActive)
            director.emit(GameEvent.PLAYER_JUMP, dt);

        if (this.m_fireActive)
            director.emit(GameEvent.PLAYER_FIRE, true);
    }

    onSwitchRB() {
        this.m_switchRB = this.m_switchRB == 0 ? 1 : 0;
        director.emit(GameEvent.PLAYER_SWITCH, this.m_switchRB);
    }
}