var c = document.getElementById("canvas");
var ctx = c.getContext("2d");

c.width = window.screen.width;
c.height = window.screen.height;

var TO_RADIANS = Math.PI/180;
var TO_GRADUSE = 180/Math.PI;

var date = new Date();
var time = date.getTime();

var images = {pudgeImg: new Image(),
              aaImg: new Image(),
              lsImg: new Image()};


var KEYS = {
    LEFT: {kode: 65, press: false},
    RIGHT: {kode: 68, press: false},
    TOP: {kode: 87, press: false},
    DOWN: {kode: 83, press: false}
};

// обьект для управления мышкой
function Mouse(){
    this.lb=false;
    this.rb=false;
    this.whel=0;
    this.xy={x:0,y:0};
    
    this.scanParams = function(){
        var r = {lb:this.lb, rb:this.rb, w:this.whel };
        this.lb=false;
        this.rb=false;
        this.whel=0;
        
        return r;
    }
} 
mouse = new Mouse();

function clock( _cd){
    this.cd = _cd;
    this.timeLeft=_cd;
    this.active = true;
    
    
    this.tick = function(t){
        if (this.active){
            this.timeLeft-=t;
            if (this.timeLeft<=0){
                this.timeLeft=0;
                this.active = false;
            }
        }
        
    }
    
    this.restart = function(){
        this.timeLeft = this.cd;
        this.active = true;
    }
    
}

//--------- ON ACTION ---------------------------------
function loadRes(){
    images.pudgeImg.src = "res\\pudgeImg.jpg";
    images.aaImg.src = "res\\aaImg.jpg";
    
    
}

window.onload = function load(){ 

    loadRes();
    resize();
    mineCircle();
                       
}

function resize() {
	var box = c.getBoundingClientRect();
	c.width = box.width;
	c.height = box.height;
}
window.onresize = resize();

c.onmousemove = function(mouseXY) {
    
    mouse.xy = mouseXY;
}

c.onmouseup = function(mouseXY){
    mouse.lb = true;
}


window.onkeydown = function(key){
    switch(key.keyCode) {
        case KEYS.LEFT.kode:
            KEYS.LEFT.press=true;
            break;
            
        case KEYS.RIGHT.kode:
            KEYS.RIGHT.press=true;
            break;
            
        case KEYS.TOP.kode:
            KEYS.TOP.press=true;
            break;
            
        case KEYS.DOWN.kode:
            KEYS.DOWN.press=true;
            break;
   
        // ...
    }
}
window.onkeyup = function(key){
    switch(key.keyCode) {
        case KEYS.LEFT.kode:
            KEYS.LEFT.press=false;
            break;    
        case KEYS.RIGHT.kode:
            KEYS.RIGHT.press=false;
            break;
        case KEYS.TOP.kode:
            KEYS.TOP.press=false;
            break;
        case KEYS.DOWN.kode:
            KEYS.DOWN.press=false;
            break;
   
        // ...
    }
}

function rotate( point,  angle){
           var rotated_point={x:0,y:0};
           rotated_point.x = point.x * Math.cos(angle) - point.y * Math.sin(angle);
           rotated_point.y = point.x * Math.sin(angle) + point.y * Math.cos(angle);
           return rotated_point;
}

//---------objects------------------------------------

//basic class
function Obj(_name,Vxy,Vwh,_hp,_Mspd,wght,pwr,_img,_angl, _rs) {
    this.name = _name;    
    this.x=Vxy.x;
    this.y=Vxy.y;
    this.w=Vwh.w;
    this.h=Vwh.h;
    this.radius = (this.w+this.h)/4;
    
    this.angle=_angl;//угол поворота
    this.rs = _rs; // скорость поворота в градусах
    this.hp=_hp;    
    this.spd=_Mspd; //скорость
    this.live = true;
    this.img = _img;
    this.moveXY ={x:this.x,y:this.y};
    this.moveAngle = 0;
    
	this.draw = function(){
        ctx.beginPath();
        var b = rotate({x:this.w, y:this.h},this.angle*TO_RADIANS)
        // translate context to center of canvas
        
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle*TO_RADIANS);
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.w/-2, this.h/-2, this.w, this.h);
        ctx.fillStyle = 'green';
        ctx.fillRect(this.w/-4, this.h/-4, this.w/2, this.h/2);
        // rotate 45 degrees clockwise
        
        

        // apply custom transform
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        
        
    }
    
    this.changeMoveDirection = function(x,y){
        this.moveXY.x=x;
        this.moveXY.y=y;
        
        var x1 = x - this.x;
        var y1 = y - this.y;
        
        
        var angle = Math.acos( (y1*(-1))/(Math.sqrt(x1*x1+y1*y1)*Math.sqrt(1)))*TO_GRADUSE;
        
        if (( x1)>0){
            this.moveAngle=angle;
        }else{
            this.moveAngle=360-angle;
        }
        
        
    }
    
    this.changeRotateDirection = function(_angle){
        this.moveAngle=_angle;
    }
    
    this.stop = function(){
        this.moveXY.x=this.x;
        this.moveXY.y=this.y;
        this.moveAngle=this.angle;
    }
    
    this.isActive = function(){
        return (this.moveXY.x!=this.x || this.moveXY.y!=this.y );
    }
    
    this.rotate = function(t){    
        
        //вычисляем в какую сторону будет быстрее крутиться
        var a,b;
        if (this.moveAngle>this.angle){
            a=this.moveAngle-360;
            b=this.moveAngle;
        }else{
            a=this.moveAngle;
            b=this.moveAngle+360;
        }
    
        if (this.angle-a < b-this.angle){
            this.angle-=this.rs*t
            if (this.angle<a)
                this.angle=this.moveAngle;
        }else{
            this.angle+=this.rs*t
            if (this.angle>b)
                this.angle=this.moveAngle;
        }
    }
    
    this.tick = function(t){

    }
    
}


function Player() {
    Obj.call(this,"_name",{x:c.width/2, y:c.height/2},{w:20, h:10}, 500,100,400,100,images.aaImg, 1, 360)
    

    this.tick = function(t, objs){

        //if (!this.isActive()) return;
        // если мышка нажата, то стреляем
        if (mouse.lb == true){
            mouse.lb = false;
            
            var b = {x:0,y:-(this.radius+5)};
            b = rotate(b,this.angle*TO_RADIANS);
            
            objs.push(new Bullet({x:this.x+b.x,y:this.y+b.y}, mouse.xy, 10, this.angle));
        }
        
        
        
        //вычисляем, куда смотрит мышка и сами туда хотим смотреть
        var x = mouse.xy.x;
        var y = mouse.xy.y;  
        this.moveXY.x=x;
        this.moveXY.y=y;      
        var x1 = x - this.x;
        var y1 = y - this.y;       
        var angle = Math.acos( (y1*(-1))/(Math.sqrt(x1*x1+y1*y1)*Math.sqrt(1)))*TO_GRADUSE;      
        if (( x1)>0){
            this.moveAngle=angle;
            //this.angle=angle;
        }else{
            this.moveAngle=360-angle;
            //  this.angle=360-angle;

        }
        
        this.rotate(t);
        //ole.log(this.moveAngle);

                
        var spd = { x:0,y:0};    
        if (KEYS.LEFT.press) spd.x = -this.spd;
        if (KEYS.RIGHT.press) spd.x = this.spd;
        if (KEYS.DOWN.press) spd.y = this.spd;
        if (KEYS.TOP.press) spd.y =-this.spd*1.5;
        
        // прикручиваем это ко времени
        spd.x*=t;
        spd.y*=t;
        // поворачиваем вектор скорости
        spd = rotate(spd,this.angle*TO_RADIANS);
        //двигаемся
        this.x += spd.x;
        this.y += spd.y;
        
        // 1. считываем значения с мыши и клавы
        // 2. обрабатываем эти данные
        // 
        /*
            от текущей позиции до позиции курсора проводим вектор и поворачиваемся 
            в его сторону на угол, равный скорости поворота*время и если перелетели,
            то ставим в нужную позицию
            далее производим движения, относительно вектора направления(куда смотрит,
            туда и идет вперед)
            */
        
        
        
        /*если текущий угол не совпадает углу направление, то нужно менять угол
        if (this.angle!=this.moveAngle){
            this.rotate(t);

        }else{
            var ox = this.x, oy = this.y;

            var dy,dx;
        KEYS    dx = this.moveXY.x - this.x;
            dy = this.moveXY.y - this.y;


            var kx =0;
            var ky =0;

            if (dx || dy){
                kx = dx / (Math.sqrt(Math.pow(dx, 2.) + Math.pow(dy, 2.)));
                ky = dy / (Math.sqrt(Math.pow(dx, 2.) + Math.pow(dy, 2.)));
            }

            this.x += kx*t*this.ms;
            this.y += ky*t*this.ms;

            // если пролетели нужно место, то отодвигаем в нужное место
            if (Math.sqrt(Math.pow(ox-this.x, 2.) + Math.pow(oy-this.y, 2.))>Math.sqrt(Math.pow(ox-this.moveXY.x, 2.) + Math.pow(oy-this.moveXY.y, 2.))){
                this.x=this.moveXY.x;
                this.y=this.moveXY.y;
            }
        }


        for (var j = 0; j < objs.length; j++) { 
            if (this != objs[j]){
                var dx = (objs[j].x - this.x);
                var dy = (objs[j].y - this.y);
                var d = Math.sqrt(dx * dx + dy * dy);  
                //if detect collisions, then отодвигаем от препятствия
                if (d < objs[j].radius + this.radius) {               
                    // делаем вектор, с начаа координат
                    var vectorOO = {x:this.x-objs[j].x, y:this.y-objs[j].y};

                    var mAB = this.radius+objs[j].radius - d;
                    //+1 = отодвигаем чуть дальше, чем нужно
                    this.x = vectorOO.x+vectorOO.x*(mAB+1)/d+objs[j].x; 
                    this.y = vectorOO.y+vectorOO.y*(mAB+1)/d+objs[j].y;

                }



            }
        }*/

    } 
}

function Bullet( _startXY, _targetXY, _dmg, _angle) {
    Obj.call(this,"_name", _startXY,{w:4, h:4}, _dmg, 500,400, 100,images.aaImg, _angle, 0)
    this.changeMoveDirection(_targetXY.x,_targetXY.y);
    console.log("bulet created!"+this.live);
    //------
	this.tick = function(t, objs) {
        
        /*if (!this.isActive()){
            return;
        }*/
       
        
        var ox = this.x, oy = this.y;

        var dy,dx;
        dx = this.moveXY.x - this.x;
        dy = this.moveXY.y - this.y;


        var kx =0;
        var ky =0;

        if (dx || dy){
            kx = dx / (Math.sqrt(Math.pow(dx, 2.) + Math.pow(dy, 2.)));
            ky = dy / (Math.sqrt(Math.pow(dx, 2.) + Math.pow(dy, 2.)));
        }

        this.x += kx*t*this.spd;
        this.y += ky*t*this.spd;

        // если пролетели нужно место, то отодвигаем в нужное место
        if (Math.sqrt(Math.pow(ox-this.x,2.)+Math.pow(oy-this.y, 2.))>Math.sqrt(Math.pow(ox-this.moveXY.x, 2.) + Math.pow(oy-this.moveXY.y, 2.))){
            this.live = false;
            this.x = this.moveXY.x;
            this.y = this.moveXY.y;
        }



        for (var j = 0; j < objs.length; j++) {
            if(this != objs[j]){	

                var dx = (objs[j].x - this.x);
                var dy = (objs[j].y - this.y);
                var d = Math.sqrt(dx * dx + dy * dy);               
              //if detect collisions, then отодвигаем от препятствия
                if (d < objs[j].radius + this.radius) {
                    this.live = false;
                    objs[j].live = false;
                    /*
                    // делаем вектор, с начаа координат
                    var vectorOO = {x:this.x-objs[j].x, y:this.y-objs[j].y};

                    var mAB = this.radius+objs[j].radius - d;

                    this.x = vectorOO.x+vectorOO.x*(mAB+1)/d+objs[j].x; 
                    this.y = vectorOO.y+vectorOO.y*(mAB+1)/d+objs[j].y;*/
                }
            }
        }
        console.log("bulet tick!"+this.moveXY.y);

	}
	
}



//--------- COLLISION ---------------------------------


var targets = [];



var car= new Player;
targets.push(car);

var fpsCD = new clock(1);

//--------- MINE CIRCLE ---------------------------------

fps = document.getElementById("FPS");
mxy = document.getElementById("MXY");
function mineCircle() {
    
    //удаление мертвых
    var i1=0;
    while (i1 < targets.length) {
        if (!targets[i1].live){
            targets.splice(i1,1);
        }else{
            ++i1;
        }
    }
    //console.log(""+this.moveXY.y);

    
    //-----ticks------------
    var newTime = (new Date()).getTime();
    var t = (newTime-time)/1000;

    for (var i = 0; i < targets.length; i++) {
		targets[i].tick(t, targets);
	};

    fpsCD.tick(t);
    time = newTime;  
    //-----draw-------------
    ctx.clearRect(0, 0, c.width, c.height);
      
    car.draw();
	for (var i = 0; i < targets.length; i++) {
        targets[i].draw();
	};
    
    //console.log(fpsCD.timeLeft);
    
    if (!fpsCD.active){
        fps.innerHTML = "fps="+1/t;
        mxy.innerHTML = "x:"+mouse.xy.x+" y:"+mouse.xy.y;
        fpsCD.restart();
    }

	requestAnimationFrame(mineCircle);
}

