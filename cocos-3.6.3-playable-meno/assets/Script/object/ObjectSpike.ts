import { _decorator, Component, director, Node } from 'cc';
import { BaseObjectTrigger } from '../base/object/BaseObjectTrigger';
import GameEvent from '../GameEvent';
const { ccclass, property } = _decorator;

@ccclass('ObjectSpike')
export class ObjectSpike extends Component {

    m_object: BaseObjectTrigger = null;

    protected onLoad(): void {
        this.m_object = this.getComponent(BaseObjectTrigger);
    }

    protected start(): void {
        director.on(BaseObjectTrigger.OBJECT_TRIGGER, this.onPlayerTrigger, this);
    }

    onPlayerTrigger(Object: BaseObjectTrigger) {
        if (Object != this.m_object)
            return;
        director.emit(GameEvent.PLAYER_HURT);
    }
}