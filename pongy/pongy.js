(function() {
    // we have canvas
    var canvas = document.getElementById('canvas');
    // we have context
    var context = canvas.getContext('2d');
    // debug variable
    var debug = "";
    // how long have we been playing?
    var timeElapsed = 0;
    setInterval(function () {
        if(document.hasFocus()){
            timeElapsed += 0.01
        }
    }, 10);
    
    // our objects --two paddles and a ball.
    var leftPaddle = {
        width : 10,
        height: 40,
        xPos  : window.innerWidth/20,
        yPos  : 100,
        speed : 10,
        score : 0
    }
    var rightPaddle = {
        width : 10,
        height: 40,
        xPos  : window.innerWidth - (window.innerWidth/20),
        yPos  : 100,
        speed : 10,
        score : 0
    }
    var ball = {
        xPos  :  window.innerWidth       / 2,
        yPos  : (window.innerHeight - 40)/ 2,
        radius: window.innerWidth        / 100,
        speed : { x : 5,
                  y : 5
                }
    }
    //// this is how we tell which keys are pressed
    /// shamelessly stolen from
    // http://stackoverflow.com/questions/5203407/javascript-multiple-keys-pressed-at-once
    var map = []; // array holding all pressed keycodes as "true"
    onkeydown = onkeyup = function(e){
        e = e || event; // to deal with IE
        map[e.keyCode] = e.type == 'keydown';
        /*insert conditional here*/
        // no! It's smoother in my update methods 
    }
    
    // game function. 
    function game() {
        // I should have an input(); here, but I don't. Handling all that in updates
        update();
        draw();
        requestAnimationFrame(game);
    }
    requestAnimationFrame(game);
    // update variables as needed
    function update(){
        updateCanvas();
        updateLeftPaddle();
        updateRightPaddle();
        updateBall();
        updateText();
    }
    // draw all the things!
    function draw(){
        drawCanvas();
        drawLeftPaddle();
        drawRightPaddle();
        drawBall();
        drawText();
    }
    // the canvas and background
    function updateCanvas(){
        // keeps the canvas the size of the window
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    function drawCanvas(){
        context.fillStyle = '#ccc';
        context.fillRect(0, 0, window.innerWidth, window.innerHeight-40);
        context.strokeStyle = 'black';
        context.lineWidth = '5';
        context.strokeRect(0, 0, window.innerWidth, window.innerHeight-40);
    }
    // left paddle functions
    function updateLeftPaddle() {
        leftPaddle.xPos     = window.innerWidth/20;
        leftPaddle.height   = window.innerHeight/10;
        if(map[69])// 69 == e    -- if pressing 'e'
            moveLeftPaddleUp();  // move up.
        if(map[70])// 70 == f    -- if pressing 'f'
            moveLeftPaddleDown();// move down
    }
    function drawLeftPaddle() {
        context.fillStyle = 'red';
        context.fillRect(   leftPaddle.xPos,
                            leftPaddle.yPos, 
                            leftPaddle.width,
                            leftPaddle.height
        );
    }
    function moveLeftPaddleUp() {
        if(leftPaddle.yPos > 0) // don't go off screen
            leftPaddle.yPos -= leftPaddle.speed;
    }
    function moveLeftPaddleDown() {
        if(leftPaddle.yPos + leftPaddle.height < window.innerHeight - 40)  // don't go off screen
            leftPaddle.yPos += leftPaddle.speed;
    }
    // right paddle functions
    function updateRightPaddle() {
        rightPaddle.xPos = window.innerWidth - (window.innerWidth/20);
        rightPaddle.height = window.innerHeight/10;
        if(map[74])// 74 == j     -- if pressing 'j'
            moveRightPaddleDown();// move down
        if(map[73])// 73 == i     -- if pressing 'i'
            moveRightPaddleUp();  // move up
    }
    function drawRightPaddle() {
        context.fillStyle = 'blue';
        context.fillRect(   rightPaddle.xPos,
                            rightPaddle.yPos, 
                            rightPaddle.width,
                            rightPaddle.height
        );
    }
    function moveRightPaddleUp() {
        if(rightPaddle.yPos > 0) // don't go off screen
            rightPaddle.yPos -= rightPaddle.speed;
    }
    function moveRightPaddleDown() {
        if(rightPaddle.yPos + rightPaddle.height < window.innerHeight - 40) // don't go off screen
            rightPaddle.yPos += rightPaddle.speed;
    }

    function updateBall() {
        ball.radius = window.innerWidth / 100;
        ball.xPos += ball.speed.x;
        ball.yPos += ball.speed.y;
        /*
        this website didn't help me with the code a lot but I like the pictures
        http://www.migapro.com/circle-and-rotated-rectangle-collision-detection/
        I may go back and actually read the article, or I might just delete this comment.
        */
        // bounce if you hit a top or bottom wall.
        if(window.innerHeight - 40 < ball.yPos + ball.radius
        || ball.yPos - ball.radius < 0)
            ball.speed.y *= -1;
            
        // bounce off left paddle
        if( (ball.xPos - ball.radius) <= (leftPaddle.xPos + leftPaddle.width) ){
            if( (leftPaddle.xPos + leftPaddle.width) <= (ball.xPos)){
                if( (leftPaddle.yPos) < (ball.yPos) ) {
                    if ((ball.yPos) < (leftPaddle.yPos + leftPaddle.height)){
                        ball.xPos = leftPaddle.xPos + leftPaddle.width + ball.radius + 1;
                        ball.speed.x *= -1;
                    }
                }
            }
        }
        // bounce off right paddle
        if( (ball.xPos + ball.radius) >= (rightPaddle.xPos) ){
            if( (rightPaddle.xPos) >= (ball.xPos)){
                if( (rightPaddle.yPos) < (ball.yPos) ) {
                    if ((ball.yPos) < (rightPaddle.yPos + rightPaddle.height)){
                        ball.xPos = rightPaddle.xPos - ball.radius - 1;
                        ball.speed.x *= -1;
                    }
                }
            }
        }
        
        
        // increase right paddle's score if ball hits the left wall & return ball to center
        if(window.innerWidth < ball.xPos + ball.radius) {
            leftPaddle.score += 1;
            ball.speed.x *= -1; 
            ball.xPos = window.innerWidth / 2;
            ball.yPos = (window.innerHeight - 40) / 2;
        }
        // increase left paddle's score if ball hits the left wall & return ball to center
        if(ball.xPos - ball.radius < 0) {
            rightPaddle.score += 1;
            ball.speed.x *= -1; 
            ball.xPos = window.innerWidth / 2;
            ball.yPos = (window.innerHeight - 40) / 2;
        }
    }
    function drawBall() {
        context.fillStyle = 'green';
        context.arc(ball.xPos,
                    ball.yPos,
                    ball.radius,
                    0,2*Math.PI);
        context.fill();
    }
    
    function updateText() {
        
    }
    function drawText() {
        context.font="20px Georgia";
        //left score
        context.fillStyle = "#000";
        context.fillText(   leftPaddle.score.toString(),
                            leftPaddle.xPos,
                            window.innerHeight - 15);
        //right score
        context.fillText(   rightPaddle.score.toString(),
                            rightPaddle.xPos,
                            window.innerHeight - 15);
        //middle text
        context.textAlign = 'center';
        context.font="10px Georgia";
        //time elapsed
        context.fillText(   "Time elapsed: " + (timeElapsed).toFixed(2).toString(),
                            window.innerWidth/2,
                            window.innerHeight - 20);
        context.fillText(   debug,
                            window.innerWidth/2,
                            window.innerHeight - 10);
    }
})();
