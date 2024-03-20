import { _decorator, Camera, CCFloat, Component, Node, UITransform, v2, v3, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BackgroundParallax')
export class BackgroundParallax extends Component {
    @property(CCFloat)
    parallaxEffect = 1;

    m_camera: Camera = null;

    m_length: number;
    m_startPos: number;
    m_width: number;

    onLoad() {
        this.m_camera = this.node.parent.parent.getComponent(Camera);
    }

    start () {
        this.m_startPos = 0;
        this.m_length = 1920/(540/this.m_camera.orthoHeight);
        this.m_width = this.m_camera.orthoHeight* (screen.width / screen.height);
    }

    excute () {  
        if(this.m_camera == null)
            return;      
        let camWorldPos = this.m_camera.node.worldPosition;
        let temp = camWorldPos.x*(1 - this.parallaxEffect);
        let dist = camWorldPos.x * this.parallaxEffect;
        let x = this.m_startPos + dist;
        let target = new Vec3(x, camWorldPos.y, 0);
        this.node.setWorldPosition(target);
        if(temp > (this.m_startPos + this.m_width))
        {            
            this.m_startPos += this.m_length;
        }
        else if(temp < (this.m_startPos - this.m_width))
            this.m_startPos -= this.m_length;
    }
}


