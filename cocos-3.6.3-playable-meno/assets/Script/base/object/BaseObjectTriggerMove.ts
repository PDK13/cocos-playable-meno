import { _decorator, CCFloat, CCString, Component, director, Node, v2, Vec2 } from 'cc';
import { BaseObject } from './BaseObject';
const { ccclass, property } = _decorator;

@ccclass('BaseObjectTriggerMove')
export class BaseObjectTriggerMove extends Component {

    @property(CCString)
    keyTrigger: string = 'object-trigger';

    @property(CCString)
    keyReturn: string = 'object-return';

    @property(BaseObject)
    baseObject: BaseObject = null;

    @property(Vec2)
    moveOffset: Vec2 = new Vec2(0, 5);

    @property(CCFloat)
    moveDuration: number = 0.5;

    posStart: Vec2;

    protected onLoad(): void {
        director.on(this.keyTrigger, this.onMove, this);
        director.on(this.keyReturn, this.onReturn, this);
    }

    protected start(): void {
        this.posStart = v2(this.node.position.clone().x, this.node.position.clone().y);
    }

    onMove(Stage: boolean) {
        if (!Stage)
            return;
        let MovePos = v2(0, 0);
        MovePos.x += this.node.position.x + this.moveOffset.x;
        MovePos.y += this.node.position.y + this.moveOffset.y;
        this.baseObject.onTweenMove(MovePos, this.moveDuration);
    }

    onReturn() {
        this.baseObject.onPosV2(this.posStart);
    }
}