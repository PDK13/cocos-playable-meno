import { _decorator } from 'cc';

export default class GameEvent  {
    static PLAYER_JUMP: string = 'EVENT_PLAYER_JUMP';
    static PLAYER_JUMP_RELEASE: string = 'EVENT_PLAYER_JUMP_RELEASE';
    static PLAYER_JUMP_STOP: string = 'PLAYER_JUMP_STOP';
    static PLAYER_FIRE: string = 'EVENT_PLAYER_FIRE';
    static PLAYER_MOVE_LEFT: string = 'EVENT_PLAYER_MOVE_LEFT';
    static PLAYER_MOVE_RIGHT: string = 'EVENT_PLAYER_MOVE_RIGHT';
    static PLAYER_MOVE_STOP: string = 'EVENT_PLAYER_MOVE_STOP';
    static PLAYER_STOP: string = 'EVENT_PLAYER_STOP';
    static GAME_FINISH: string = 'GAME_FINISH';
    static GAME_LOSE: string = 'GAME_LOSE';
    static TRIGGER_KEY: string = 'TRIGGER_KEY';
    static PLAYER_HURT = 'PLAYER_HURT';
    static PLAYER_X4 = 'PLAYER_X4';
    static PLAYER_FAN = 'PLAYER_FAN';
    static PLAYER_TALL = 'PLAYER_TALL';
    static PLAYER_GROUND = 'PLAYER_GROUND';
    static PLAYER_FLAG = 'PLAYER_FLAG';
    static FINISH_FLAG = 'FINISH_FAG';
    static TIMER_OUT = "TIMER_FINISH";
    static PLAYER_SWITCH = "PLAYER_SWITCH";
}