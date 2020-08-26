(function() {
    /* I've designed an accompanied canvas.html to handle this javascript. It's certainly trivial
     * to make this work in a more dynamic context, but you'll have to figure that out.
     * 
     * BUG [maybe] --my method of adding functions to an array for execution brings the respective
     * function's "this" out of context. E.g. Example, in user.draw(), I could use "this.color" but 
     * now must use "user.color." It kinda makes sense to me but seems like a large drawback,
     * though there's an easy workaround.
     * */
    //////////  global variables  ////////////////////////////////////////
    // debug variable helps me find where I am in coding.
    var debug = {
        str     : "empty",
        update  :     function(str){
            if(str != undefined){
                this.str = str;
            }
            document.getElementById("debug").innerHTML = this.str;
        }
    }
    //////////  INPUT  ////////////////////////////////////////
    // source: http://stackoverflow.com/questions/5203407/javascript-multiple-keys-pressed-at-once
    var map = []; // array holding all pressed keycodes as "true"
    onkeydown = onkeyup = function(e){
        e = e || event; // to deal with IE
        map[e.keyCode] = e.type == 'keydown';
    }
    //////////  WORLD  ////////////////////////////////////////
    var world = {
        array   : [], // Here is an array holding all the objects in the 2D world 
        add     : function(obj){ // adding objects to the array
            this.array.push(obj);
        },
        remove  : function(obj){ // removing objects from the array
            index = this.array.indexOf(obj);
            this.array.splice(index,1);
            obj = null;
        },
        update  : function(){ // runs update() functions for each object in the array
            for(i = 0; i < this.array.length; i++){
                if (typeof this.array[i].update == 'function') {
                    this.array[i].update();
                }
            }
        },
        draw    : function(){ // runs draw() functions for each object in the array
            for(i = 0; i < this.array.length; i++){
                if (typeof this.array[i].draw == 'function') {
                    this.array[i].draw();
                }
            }
        }
    }
    //////////  GAME  ////////////////////////////////////////
    function game() { // This is the loop that runs the game
        world.update();
        world.draw();
        requestAnimationFrame(game); // This is bootstrapped at the end of the script.
    }
    //////////  CANVAS  ////////////////////////////////////////
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    canvas.update = function(){
        canvas.width    = window.innerWidth;
        canvas.height   = window.innerHeight;
    }
    canvas.draw = function(){
        context.fillStyle = '#ccc';
        context.fillRect(0, 0, window.innerWidth, window.innerHeight-40);
        context.strokeStyle = 'black';
        context.lineWidth = '5';
        context.strokeRect(0, 0, window.innerWidth, window.innerHeight-40);
    }
    world.add(canvas);
    //////////  USER  ////////////////////////////////////////
    var user = {
        color   : '#000', 
        canJump         : false,
        isJumping       : false,
        isFalling       : true,
        canMoveLeft     : true,
        iSMovingLeft    : false,
        canMoveRight    : true,
        isMovingRight   : false,
        speed   : 5,
        width   : 10,
        height  : 40,
        downforce   : 1,
        X       : window.innerWidth/2,
        Y       : (window.innerHeight - 40)/2,
        update  : function(){
            //// INPUT ////////////
            // jump (space)
            if((map[32])
            && (user.canJump)){
                user.canJump = false;
                user.isJumping = true;
                user.isFalling = true; 
                user.downforce = -20;
            }
            // left
            if((map[37])
            && (user.canMoveLeft)){
                user.isMovingLeft = true;
                user.X -= user.speed;
            }else{
                user.isMovingLeft = false;
            }
            // right
            if((map[39])
            && (user.canMoveRight)){
                user.isMovingRight = true;
                user.X += user.speed;
            }else{
                user.isMovingRight = false;
            }
            if(map[40]){ // down
            }
            // external forces
            if(user.isFalling){
                user.downforce += 1;
            }
            user.Y += user.downforce;
        },
        draw    : function(){
            context.fillStyle = user.color;
            context.fillRect(user.X,user.Y,user.width,user.height);
        }
    };
    world.add(user);
    //////////  FLOOR  ////////////////////////////////////////
    var floor = {
        Y : (window.innerHeight - 40),
        update : function(){
            if((user.Y + user.height) >= floor.Y){
                user.isFalling  = false;
                user.canJump    = true;
                user.isJumping  = false;
                user.Y = floor.Y - user.height;
                user.downforce = 0;
            }
        }
    }
    world.add(floor);
    //////////  LEFT WALL  ////////////////////////////////////////
    var leftWall = {
        X : 0,
        update : function(){
            if(user.X <= leftWall.X){
                user.canMoveLeft = false;
            }else{
                user.canMoveLeft = true;
            }
        }
    }
    world.add(leftWall);
    //////////  RIGHT WALL  ////////////////////////////////////////
    var rightWall = {
        X : window.innerWidth,
        update : function(){
            if((user.X + user.width) >= rightWall.X){
                user.canMoveRight = false;
            }else{
                user.canMoveRight = true;
            }
        }
    }
    world.add(rightWall);
    //////////  PLATFORM[s]  ////////////////////////////////////////
    function Platform(X, color){
        if(color == undefined){ // default color if none is set.
            this.color = this.color = "#909";
        }else{
            this.color = color;
        }
        if(X == undefined){ // default X position if none is set.
            this.X = window.innerWidth  * Math.random();
        }else{
            this.X = X;
        }
        // scoot left if the platform is beyond the right-most wall
        // not working. 
        if((this.X + this.width) > window.innerWidth){
            this.X -= this.width;
        }
        this.width = window.innerWidth / 10;
        this.Y = 0;
        this.height = window.innerHeight / 30;
        this.speed = 1;
        this.userOnMe = false;
        this.update = function(){
            this.Y += this.speed;
            if(this.Y > floor.Y){
                world.remove(this);
                new Platform();
            }
            // collision
            if(((user.X + user.width) > this.X) && (user.X < (this.X + this.width))){
                if(((user.Y + user.height) > this.Y - 1) && (user.Y < (this.Y + this.height))){
                    this.userOnMe = true;
                }
            }else{
                this.userOnMe = false;
            }
            if(this.userOnMe){
                user.isFalling  = false;
                user.canJump    = true;
                user.isJumping  = false;
                user.Y = this.Y - user.height;
                user.downforce = 0;
            }

        }
        this.draw = function(){
            context.fillStyle = this.color;
            context.fillRect(this.X, this.Y, this.width, this.height);
        }
        world.add(this);
    }
    new Platform();
    //////////  TEXT  ////////////////////////////////////////
    var text = {
        draw : function(){
        context.textAlign = 'center';
        context.font="10px Georgia";
        context.fillStyle = "#000";
        context.fillText(   debug.str,
                            window.innerWidth/2,
                            window.innerHeight - 20);
        }
    }
    world.add(text)
    requestAnimationFrame(game);
})();
