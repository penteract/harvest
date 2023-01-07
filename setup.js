

/*
11:plant
10:plot 5x5? 10x10?
9: farm 10x10 plots
8: region 10x10 farms
7: continent/face of cube
6: planet (cube)
5: solar system
4: galaxy
3: universe
2: multiverse
*/

var pLocation;
var time = 0;
var map;
var cursor;
var seeds;
var smallaut,bigaut;
//progress:
var minDepth;
var tutorial=0;

function init(reallyRandom){
    globalrng = mkrng(reallyRandom?(Math.random()*1000000000|0):105)
    // constant seed for now, TODO: allow people to either pick a random one or restart with this one for competitive comparisons
    pLocation = [0
        ,0
        ,0
        ,0//universe
        ,0//galaxy
        ,0//system
        ,0//planet
        ,0//face
        ,0//region
        ,0//farm
        ,0//plot
        ,55//plant
    ]
    minDepth = 10;
    map = new LAYERS[0](0,globalrng(), null);
    cursor = map
    while(cursor.depth < pLocation.length-1){
        cursor = cursor.getChildren()[pLocation[cursor.depth+1]]
    }
    time = 0;
    seeds=1n;
    [bigaut,smallaut] = buildAutomata(globalrng)
}

var LAYERS;
class Map{
    constructor(depth, parent, children, seed){
        this.depth=depth;
        this.parent=parent
        if (children){
            for(k in children){
                children[k].parent = this
            }
            this.children = children
        }
        else this.rng=mkrng(seed);
    }
    getChildren(){
        if(this.children===undefined)
            this.children = this.mkChildren();
        return this.children;
    }
    mkChildren(){ // this is the only function in which the rng should be used
        return {0: this.randomChild()};
    }
    randomChild(){
        return new LAYERS[this.depth+1](this.depth+1, this,  false, this.rng());
    }
    wait(){
        if(this.waited===undefined){
            if(this.children===undefined) return this;
            let newch = {}
            for(k in this.children){
                newch[k] = this.children[k].wait()
            }
            this.waited = new LAYERS[this.depth](this.depth, this.parent, newch) // parent probably gets overwritten
        }
        return this.waited
    }
}
LAYERS = new Array(12).fill(Map)
class Plant extends Map{
    constructor(depth, parent, children, seed){
        super(depth, parent, children, seed);
        this.planted=false;
    }
    draw(ctx){
        let sz = ctx.canvas.width
        ctx.fillStyle = "brown"
        ctx.fillRect(0,0,sz,sz)
        if(this.planted){
            ctx.fillStyle = "green"
            ctx.fillRect(sz/10,sz/10,sz*8/10,sz*8/10)
        }
    }
    paste(){
        this.planted=true
    }
}
PLOTSZ = 10
class Plot extends Map{
    constructor(depth, parent, children, seed){
        super(depth, parent, children, seed);
        this.full=false;
        this.terrain="soil";
    }
    mkChildren(){
        let ch = {}
        for(let x=0;x<PLOTSZ;x++){
            for(let y=0;y<PLOTSZ;y++){
                ch[x+PLOTSZ*y] = this.randomChild();
            }
        }
        return ch;
    }
    draw(ctx){
        let sz = ctx.canvas.width
        ctx.fillStyle = "brown"
        ctx.fillRect(sz/100,sz/100,sz*98/100,sz*98/100)
        ctx.save()
        ctx.scale(1/PLOTSZ,1/PLOTSZ)
        let ch = this.getChildren()
        for(let x=0;x<PLOTSZ;x++){
            for(let y=0;y<PLOTSZ;y++){
                ch[x+PLOTSZ*y].draw(ctx)
                ctx.translate(0,sz)
            }
            ctx.translate(sz,-PLOTSZ*sz)
        }
        ctx.restore()
    }
    drawZoomed(t, ctx){
        this.draw(ctx)
    }
    wait(){
        if(this.waited===undefined){
            let state = new Array(PLOTSZ*PLOTSZ)
            let ch = this.getChildren()
            for(let k in ch)state[k]=ch[k].planted
            result = step(state,this.terrain=="soil"?smallaut:bigaut,this.terrain=="soil"?1:2)
            if(this.children===undefined) return this;
            let newch = {}
            for(k in this.children){
                newch[k] = this.children[k].wait()
            }
            this.waited = new LAYERS[this.depth](this.depth, this.parent, newch) // parent probably gets overwritten
        }
        return this.waited
    }
}
FARMSZ = 10
class Farm extends Map{
    constructor(depth, parent, children, seed){
        super(depth, parent, children, seed);
        this.full=false;
        this.waterdistance = 1;
    }
    mkChildren(){
        let ch = {}
        for(let x=0;x<FARMSZ;x++){
            for(let y=0;y<FARMSZ;y++){
                ch[x+FARMSZ*y] = this.randomChild();
            }
        }
        return ch;
    }
    draw(ctx){
        sz = ctx.canvas.width
        ctx.fillStyle = "green"
        ctx.fillRect(sz/10,sz/10,sz*8/10,sz*8/10)
    }
}
LAYERS[11] = Plant
LAYERS[10] = Plot
LAYERS[9] = Farm