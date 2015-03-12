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

      var gameloop;

      //INPUT
      var keys = {l : false,
                  r : false,
                  u : false,
                  d : false};

      //CONSTANTS
      var AMT_ZOMBIES = 100;
      var MIN_ZOMBIE_SIZE = 10;
      var MAX_ZOMBIE_SIZE = 20;
      var MAX_PLAYER_HEALTH = 100;
      var MAX_ZOMBIE_HEALTH = MAX_PLAYER_HEALTH/2;
      var ZOMBIE_SPEED = 1;
      var PLAYER_WIDTH = 10;
      var PLAYER_HEIGHT = 20;
      var PLAYER_SPEED = 5;
      var BULLET_SIZE = 30;
      var FULL_FLAME_DISTANCE = 200;
      var MAX_FLAME_DISTANCE = 200;
      var BULLET_SPEED = 15;
      var SPAWN_RADIUS = w/2;
      var BULLET_DAMAGE = 3;
      var ZOMBIE_DAMAGE = .5;

      //GAME OBJECTS
      var zombies;
      var player;
      var bullets;

      function init()
      {
        initPlayer();
        initZombies();
        initBullets();
        if (typeof gameloop != 'undefined') clearInterval(gameloop);
        gameloop = setInterval(paint, 30);
      }

      init();

      function paint()
      {
        ctx.fillStyle = "black";
        ctx.fillRect(0,0,w,h);
        movePlayer();
        getInput();
        moveZombies();
        collidePlayer();
        shootBullets();
        collideBullets();
        moveBullets();
        cleanUpBullets();
        paintPlayer();
        paintZombies();
        paintBullets();
        cleanUpZombies();
        playerDeath();
        paintPlayerHealth();
        paintPlayerScore();
      }

      function initPlayer()
      {
          player = {x: centerX,
                    y: centerY,
                    shooting: false,
                    shootDirX: 1,
                    shootDirY: 0,
                    score: 0,
                    health: 100}
      }

      function playerDeath()
      {
        if (player.health < 0)
        {
          init();
        }
      }

      function paintPlayer()
      {
        ctx.fillStyle = "yellow";
        ctx.fillRect(player.x, player.y, PLAYER_WIDTH, PLAYER_HEIGHT);
      }

      function paintPlayerHealth()
      {
        ctx.fillStyle = "#32cd32"
        ctx.fillRect(0, 0, w*(player.health/MAX_PLAYER_HEALTH), 20);
      }

      function paintPlayerScore()
      {
        ctx.font = "20pt Trebuchet MS"; //score
        ctx.fillStyle = "white";
        ctx.fillText("SCORE: " + player.score, 10, 50);
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
        if (!outOfBounds(player))
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
      }

      function collidePlayer()
      {
        for (var i=0; i < zombies.length; i++)
        {
            if (((zombies[i].x + zombies[i].size/4) > player.x) &&
                ((zombies[i].x + zombies[i].size/4) < player.x + PLAYER_WIDTH) &&
                ((zombies[i].y + zombies[i].size/2) > player.y) &&
                ((zombies[i].y + zombies[i].size/2) < player.y + PLAYER_HEIGHT))
            {
              player.health -= ZOMBIE_DAMAGE;
            }
        }
      }

      function initBullets()
      {
          bullets = [];
      }

      function collideBullets()
      {
        for (var i=0; i < zombies.length; i++)
        {
          for (var j=0; j < bullets.length; j++)
          {
            if (((bullets[j].x + BULLET_SIZE/2) > zombies[i].x) &&
                ((bullets[j].x + BULLET_SIZE/2) < zombies[i].x + zombies[i].size/2) &&
                ((bullets[j].y + BULLET_SIZE/2) > zombies[i].y) &&
                ((bullets[j].y + BULLET_SIZE/2) < zombies[i].y + zombies[i].size))
            {
              if (!bullets[j].hit)
              {
                bullets[j].hit = true;
                zombieHit(zombies[i]);
              }
            }
          }
        }
      }

      function zombieHit(zombieIn)
      {
        if (zombieIn.health <= 0)
        {
          zombieIn.dead = true;
          buildZombie();
          player.score++;
        }
        else
        {
          zombieIn.health -= BULLET_DAMAGE;
        }
      }

      function shootBullets()
      {
        if (player.shooting)
        {
          bullets.push({
            x : (player.x + PLAYER_WIDTH/2),
            y : (player.y),
            xDir : player.shootDirX,
            yDir : player.shootDirY,
            distanceFromPlayer: 0,
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
          if (bullets[i].distanceFromPlayer > MAX_FLAME_DISTANCE)
          {
            bullets[i].hit = true;
          }
        }
      }

      function paintBullets()
      {
        for (var i=0; i < bullets.length; i++)
        {
          var bulletDistX = bullets[i].x - player.x;
          var bulletDistY = bullets[i].y - player.y;
          bullets[i].distanceFromPlayer =
            Math.sqrt(bulletDistX*bulletDistX + bulletDistY*bulletDistY);
          var scaledBulletSize;
          if (bullets[i].distanceFromPlayer > FULL_FLAME_DISTANCE)
          {
            scaledBulletSize = BULLET_SIZE;
          }
          else
          {
            scaledBulletSize = (bullets[i].distanceFromPlayer / FULL_FLAME_DISTANCE)*
              BULLET_SIZE;
          }
          if (!bullets[i].hit)
          {
            ctx.fillStyle = "orange";
            ctx.fillRect(bullets[i].x, bullets[i].y, scaledBulletSize, scaledBulletSize);
          }
        }
      }

      function cleanUpBullets()
      {
        var old_bullets = bullets.slice(0);
        bullets = [];
        for (var i=0; i < old_bullets.length; i++)
        {
          if (!old_bullets[i].hit || !outOfBounds(old_bullets[i]))
          {
            bullets.push(old_bullets[i]);
          }
        }
      }

      function outOfBounds(objIn)
      {
        return (objIn.x > w - PLAYER_WIDTH || objIn.y > h - PLAYER_HEIGHT ||
          objIn.x < 0 + PLAYER_WIDTH || objIn.y < 0 + PLAYER_HEIGHT);
      }

      function initZombies()
      {
        zombies = [];
        for (var i=0; i < AMT_ZOMBIES; i++)
        {
          buildZombie();
        }
      }

      function buildZombie()
      {
        var randomX = Math.random() * w;
        var randomY = Math.random() * h;
        var randomOffset = Math.floor(Math.random()*100);
        var healthSizeSeed = Math.random();
        var randomSize = (healthSizeSeed * MAX_ZOMBIE_SIZE) + MIN_ZOMBIE_SIZE;
        var health = healthSizeSeed * MAX_ZOMBIE_HEALTH;

        if (randomX < centerX + SPAWN_RADIUS &&
          randomX > centerX - SPAWN_RADIUS)
        {
          if (randomOffset > 50)
          {
            randomX -= SPAWN_RADIUS;
          }
          else
          {
            randomX += SPAWN_RADIUS;
          }
        }

        if (randomY < centerY + SPAWN_RADIUS &&
          randomY > centerY - SPAWN_RADIUS)
        {
          if (randomOffset > 50)
          {
            randomY += SPAWN_RADIUS;
          }
          else
          {
            randomY -= SPAWN_RADIUS;
          }
        }


        zombies.push({x : randomX,
                      y : randomY,
                      size : randomSize,
                      totalHealth: health,
                      health: health,
                      dead : false})
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
        for (var i=0; i < zombies.length; i++)
        {
          var xCoord = zombies[i].x;
          var yCoord = zombies[i].y;
          var zHeight = zombies[i].size;
          var zWidth = (zombies[i].size) / 2;
          var zDead = zombies[i].dead;

          if (!zDead)
          {
            ctx.fillStyle = "white";
            ctx.fillRect(xCoord, yCoord, zWidth, zHeight);
            ctx.fillStyle = "#32cd32"
            ctx.fillRect(xCoord, yCoord - 5,
              zWidth*((zombies[i].health) / (zombies[i].totalHealth)), zHeight/10);
          }
        }
      }

      function cleanUpZombies()
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
