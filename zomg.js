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

      //GAME CHARACTERS
      var zombies;
      var player;

      function init()
      {
        initPlayer();
        initZombies();
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
        clearDeadZombies();
      }

      function initPlayer()
      {
        if (typeof player === 'undefined')
        {
          player = {x: centerX,
                    y: centerY,
                    dir: "up",
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

        });
      }

      function movePlayer()
      {
        if (keys.l)
        {
          console.log("LEFT")
          player.x -= PLAYER_SPEED;
        }
        if (keys.r)
        {
          player.x += PLAYER_SPEED;
        }
        if (keys.u)
        {
          player.y -= PLAYER_SPEED;
        }
        if (keys.d)
        {
          player.y += PLAYER_SPEED;
        }
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
