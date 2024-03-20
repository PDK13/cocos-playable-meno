import { _decorator, CCInteger, Color, Component, director, Label, Node, Tween } from 'cc';
import GameEvent from '../GameEvent';
const { ccclass, property } = _decorator;

@ccclass('TimerDuration')
export class TimerDuration extends Component {
    @property(CCInteger)
    duration: Number = 15;

    @property(Label)
    labelTime: Label = null;

    finish: boolean = false;
    timerDuration: Number = 0;

    protected onLoad(): void {
        director.on(GameEvent.GAME_FINISH, this.onFinish, this);
    }

    protected start(): void {
        this.SetTimeCountdown();
    }

    private onFinish(): void {
        this.finish = true;
    }

    SetTimeCountdown() {
        if (this.finish)
            return;
        if (this.duration.valueOf() <= 10)
            this.labelTime.color = Color.RED;
        //
        this.labelTime.string = this.duration.toString();
        //
        this.duration = this.duration.valueOf() - 1;
        if (this.duration.valueOf() < 0)
            director.emit(GameEvent.TIMER_OUT);
        else
            this.scheduleOnce(() => this.SetTimeCountdown(), 1);
    }
}