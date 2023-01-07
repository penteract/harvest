

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
var pDepth;
var time = 0;
var map;
var cursor;

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
        ,"0,0"//plant
    ]
    pDepth = 11;
    map = new LAYERS[0](0,globalrng, null);
    cursor = map
    while(cursor.depth<pDepth){
        cursor = cursor.getChildren()[pLocation[cursor.depth+1]]
    }
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
    mkChildren(){ // this is the only function in which the rng should be used above a certain depth
        return {0: this.randomChild()};
    }
    randomChild(){
        return new LAYERS[this.depth+1](this.depth+1, this,  false, this.rng());
    }
    wait(){
        if(this.waited===undefined){
            if(this.children===undefined) return this;
            newch = {}
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
    constructor(depth,seed,parent){
        super(depth,seed,parent);
        this.planted=false;
    }
    draw(ctx){
        
    }
}
PLOTSZ = 10
class Plot extends Map{
    constructor(depth,seed,parent){
        super(depth,seed,parent);
        this.full=false;
    }
    mkChildren(){
        let ch = {}
        for(let x=0;x<PLOTSZ;x++){
            for(let y=0;y<PLOTSZ;y++){
                ch[[x,y]] = this.randomChild();
            }
        }
        return ch;
    }
}
LAYERS[11] = Plant
LAYERS[10] = Plot