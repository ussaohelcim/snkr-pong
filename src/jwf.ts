export interface IColor{
	/** Red, 0 .. 255 */
	r:number
	/** Green, 0 .. 255 */
	g:number
	/** Blue, 0 .. 255 */
	b:number
	/** Alpha, 0 .. 255 */
	a?:number
}

export interface IVec2{
	x:number
	y:number
}

export interface IRect extends IVec2{
	w:number
	h:number
}

export interface ITriangle {
	p1:IVec2;	p2:IVec2;	p3:IVec2;
}

export interface ICircle extends IVec2{
	r:number
}

export interface ILine{
	p1:IVec2
	p2:IVec2
}