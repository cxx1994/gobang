import { ctx } from '../game.conf'
import { drawRoundRect } from "../base/draw";

export default class Button {
    constructor(options) {
        this.id = '';
        this.x = 0;
        this.y = 0;
        this.width = 100;
        this.height = 30;
        this.borderRadius = 12;
        this.borderWidth = 2;
        this.borderColor = '#753a1c';
        this.text = '';
        this.fontColor = '#fbde9a';
        this.backgroundColor = '#c28556';
        this.onClick = null;
        Object.assign(this, options);
    }

    draw() {
        ctx.save();
        drawRoundRect(ctx, this.x, this.y, this.width, this.height, this.borderRadius, this.borderWidth, this.borderColor);
        ctx.fillStyle = this.backgroundColor;
        ctx.fill();
        ctx.fillStyle = this.fontColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = '18px';
        ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2);
        ctx.restore();
    }

    //判断x,y坐标点的鼠标是否点击此按钮
    isClick(x, y) {
        return this.x <= x && x <= (this.x + this.width) &&
            this.y <= y && y <= (this.y + this.height)
    }

    //点击
    click(x, y){
        this.isClick(x, y) && this.onClick && this.onClick()
    }
}