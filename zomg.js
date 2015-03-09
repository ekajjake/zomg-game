$(document).ready(function()
    {
      var canvas = $("#gameCanvas")[0];
      var ctx = canvas.getContext("2d");
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      var h = $("#gameCanvas").height();
      var w = $("#gameCanvas").width();
      var centerX = w/2;
      var centerY = h/2;

      //INPUT
      var keys = {l : false,
                  r : false,
                  u : false,
                  d : false};

      //CONSTANTS
      var AMT_ZOMBIES = 100;
      var MIN_ZOMBIE_SIZE = 10;
      var MAX_ZOMBIE_SIZE = 20;
      var ZOMBIE_SPEED = 1;
      var PLAYER_WIDTH = 10;
      var PLAYER_HEIGHT = 20;
      var PLAYER_SPEED = 5;
      var BULLET_SIZE = 10;
      var BULLET_SPEED = 15;

      //GAME OBJECTS
      var zombies;
      var player;
      var bullets;

      function init()
      {
        initPlayer();
        initZombies();
        initBullets();
        if (typeof gameLoop != 'undefined') clearInterval(gameLoop);
        var gameloop = setInterval(paint, 30);
      }

      init();

      function paint()
      {
        ctx.fillStyle = "black";
        ctx.fillRect(0,0,w,h);
        movePlayer();
        getInput();
        paintPlayer();
        paintZombies();
        moveZombies();
        shootBullets();
        paintBullets();
        moveBullets();
        clearDeadZombies();
      }

      function initPlayer()
      {
        if (typeof player === 'undefined')
        {
          player = {x: centerX,
                    y: centerY,
                    shooting: false,
                    shootDirX: 0,
                    shootDirY: 1,
                    health: 100}
        }
      }

      function paintPlayer()
      {
        ctx.fillStyle = "yellow";
        ctx.fillRect(player.x, player.y, PLAYER_WIDTH, PLAYER_HEIGHT);
      }

      function getInput()
      {
        $(document).keydown(function(e)
        {
          var key = e.which;
          if(key == "37" || key == "65")
          {
            //LEFT
            keys.l = true;
          }
          if(key == "38" || key == "87")
          {
            //UP
            keys.u = true;
          }
          if(key == "39" || key == "68")
          {
            //RIGHT
            keys.r = true;
          }
          if(key == "40" || key == "83")
          {
            //DOWN
            keys.d = true;
          }
          if (key == "32")
          {
            player.shooting = true;
          }

        });

        $(document).keyup(function(e)
        {
          var key = e.which;
          if(key == "37" || key == "65")
          {
            //LEFT
            keys.l = false;
          }
          if(key == "38" || key == "87")
          {
            //UP
            keys.u = false;
          }
          if(key == "39" || key == "68")
          {
            //RIGHT
            keys.r = false;
          }
          if(key == "40" || key == "83")
          {
            //DOWN
            keys.d = false;
          }
          if (key == "32")
          {
            player.shooting = false;
          }

        });
      }

      function movePlayer()
      {
        if (keys.l)
        {
          player.x -= PLAYER_SPEED;
          player.shootDirX = -1;
          player.shootDirY = 0;
        }
        if (keys.r)
        {
          player.x += PLAYER_SPEED;
          player.shootDirX = 1;
          player.shootDirY = 0;
        }
        if (keys.u)
        {
          player.y -= PLAYER_SPEED;
          //player.shootDirY = -1;
          //player.shootDirX = 0;
        }
        if (keys.d)
        {
          player.y += PLAYER_SPEED;
          //player.shootDirY = 1;
          //player.shootDirX = 0;
        }
      }

      function initBullets()
      {
        if (typeof bullets === "undefined")
        {
          bullets = [];
        }
      }

      function shootBullets()
      {
        if (player.shooting)
        {
          bullets.push({
            x : player.x,
            y : player.y,
            xDir : player.shootDirX,
            yDir : player.shootDirY,
            hit : false
          })
        }
      }

      function moveBullets()
      {
        for (var i=0; i < bullets.length; i++)
        {
          bullets[i].x += BULLET_SPEED*bullets[i].xDir;
          bullets[i].y += BULLET_SPEED*bullets[i].yDir;
        }
      }

      function paintBullets()
      {
        for (var i=0; i < bullets.length; i++)
        {
          if (!bullets[i].hit)
          {
            ctx.fillStyle = "gray";
            ctx.fillRect(bullets[i].x, bullets[i].y, BULLET_SIZE, BULLET_SIZE/3);
          }
        }
      }

      function cleanupBullets()
      {
        var old_bullets = bullets.slice(0);
        bullets = [];
        for (var i=0; i < old_zombies.length; i++)
        {
          if (!old_bullets[i].hit || outOfBounds(bullets[i]))
          {
            bullets.push(old_zombies[i]);
          }
        }
      }

      function outOfBounds(objIn)
      {
        return (objIn.x > w || objIn.y > h || objIn.x < 0 || objIn.y < 0);
      }

      function initZombies()
      {
        if (typeof zombies === 'undefined')
        {
          zombies = [];
        }

        for (var i=0; i < AMT_ZOMBIES; i++)
        {
          var randomX = Math.random() * w;
          var randomY = Math.random() * h;
          var randomSize = (Math.random() * MAX_ZOMBIE_SIZE) + MIN_ZOMBIE_SIZE;

          zombies.push({x : randomX,
                        y : randomY,
                        size : randomSize,
                        dead : false})
        }
      }

      function moveZombies()
      {
        for (var i=0; i < zombies.length; i++)
        {
          var currentX = zombies[i].x;
          var currentY = zombies[i].y;
          var xC = currentX - player.x;
          var yC = currentY - player.y;
          var magnitude = Math.sqrt(xC*xC + yC*yC)

          zombies[i].x -= ZOMBIE_SPEED*((xC)/magnitude);
          zombies[i].y -= ZOMBIE_SPEED*((yC)/magnitude);
        }
      }

      function paintZombies()
      {
        ctx.fillStyle = "white";

        for (var i=0; i < zombies.length; i++)
        {
          var xCoord = zombies[i].x;
          var yCoord = zombies[i].y;
          var zHeight = zombies[i].size;
          var zWidth = (zombies[i].size) / 2;
          var zDead = zombies[i].dead;

          if (!zDead)
          {
            ctx.fillRect(xCoord, yCoord, zWidth, zHeight);
          }
        }
      }

      function clearDeadZombies()
      {
        var old_zombies = zombies.slice(0);
        zombies = [];
        for (var i=0; i < old_zombies.length; i++)
        {
          if (!old_zombies[i].dead)
          {
            zombies.push(old_zombies[i]);
          }
        }
      }

    });
