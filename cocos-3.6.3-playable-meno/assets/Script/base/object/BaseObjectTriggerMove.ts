import { _decorator, CCFloat, CCString, Component, director, Node, v2, Vec2 } from 'cc';
import { BaseObject } from './BaseObject';
const { ccclass, property } = _decorator;

@ccclass('BaseObjectTriggerMove')
export class BaseObjectTriggerMove extends Component {

    @property(CCString)
    keyTrigger: string = 'object-trigger';

    @property(BaseObject)
    baseObject: BaseObject = null;

    @property(Vec2)
    moveOffset: Vec2 = new Vec2(0, 5);

    @property(CCFloat)
    moveDuration: number = 0.5;

    protected onLoad(): void {
        director.on(this.keyTrigger, this.onMove, this);
    }

    onMove(Stage: boolean) {
        if (!Stage)
            return;
        let MovePos = v2(0, 0);
        MovePos.x += this.node.position.x + this.moveOffset.x;
        MovePos.y += this.node.position.y + this.moveOffset.y;
        this.baseObject.onTweenMove(MovePos, this.moveDuration);
    }
}