declare interface IColor {
    /** Red, 0 .. 255 */
    r: number;
    /** Green, 0 .. 255 */
    g: number;
    /** Blue, 0 .. 255 */
    b: number;
    /** Alpha, 0 .. 255 */
    a?: number;
}
declare interface IVec2 {
    x: number;
    y: number;
}
declare interface IRect extends IVec2 {
    w: number;
    h: number;
}
declare interface ITriangle {
    p1: IVec2;
    p2: IVec2;
    p3: IVec2;
}
declare interface ICircle extends IVec2 {
    r: number;
}
declare interface ILine {
    p1: IVec2;
    p2: IVec2;
}
declare const __BLACK: IColor;
declare const jwf: (canvas: HTMLCanvasElement) => {
    _canvas: HTMLCanvasElement;
    gfx: CanvasRenderingContext2D | null;
    drawPixel: (pixel: IVec2) => void;
    drawLine: (line: ILine, thick?: number, color?: IColor) => void;
    drawLineBezier(startPos: IVec2, cp1: IVec2, cp2: IVec2, endPos: IVec2, thick?: number, color?: IColor | undefined): void;
    /**
     *
     * @param rect
     * @param color Optional
     */
    drawRect: (rect: IRect, color?: IColor) => void;
    drawRectangleLines: (rect: IRect, color?: IColor) => void;
    drawCircle: (circle: ICircle, color?: IColor) => void;
    drawCircleLines: (circle: ICircle, color?: IColor) => void;
    /**
     * Draws an arc.
     * @param circle Circle shape
     * @param startAngle start angle in RADIANS
     * @param endAngle end angle in RADIANS
     * @param color
     */
    drawCircleSector: (circle: ICircle, startAngle: number, endAngle: number, color?: IColor) => void;
    drawImage: (pos: IVec2, img: HTMLImageElement) => void;
    drawTriangle: (triangle: ITriangle, color?: IColor) => void;
    clearBackground: (x?: number | undefined, y?: number | undefined) => void;
    drawText: (position: IVec2, text: string, color?: IColor) => void;
    /**
     * Set the font. Need to call this every time you change canvas resolution.
     * @param size
     * @param font
     * @param baseLine
     */
    setFont: (size: number, font: string, baseLine?: CanvasTextBaseline | undefined) => void;
    /**
     *
     * @param a (m11) Horizontal scaling. A value of 1 results in no scaling.
     * @param b (m12) Vertical skewing.
     * @param c (m21) Horizontal skewing.
     * @param d (m22) Vertical scaling. A value of 1 results in no scaling.
     * @param e (dx) Horizontal translation (moving).
     * @param f (dy) Vertical translation (moving).
     */
    setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void;
    getColor(r: number, g: number, b: number, a: number): IColor;
    _colorToString(color: IColor): string;
    _fill(color: IColor): void;
    _stroke(stroke?: number, color?: IColor | undefined): void;
};