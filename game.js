  var database = new Firebase('YOUR FIREBASE URL'),
  players = database.child('players'),
  amOnline = database.child('.info/connected'),
  chatRef = database.child('chat'),
  uid = Math.random().toString(36).substring(2),
  userRef = database.child('presence/' + uid);

  var presence = database.child('presence');
  presence.on('value', function(snapshot) {
    // displays number of users currently online
    var online = snapshot.numChildren();
    $('#online').html(online + ' online.');
    // removes users who have logged off when someone visits the page
    snapshot.forEach(function(dataSnap) {
      if (dataSnap.val() == false) {
        var parent = dataSnap.key();
        removePlayer(parent); 
      }
    });
  });

  amOnline.on('value', function(snapshot) {
    if (snapshot.val()) {
      userRef.onDisconnect().set(false);
      userRef.set(true);
    }
  }); 

  function removePlayer(player) {
    $('#' + player).remove();
    var presenceOff = database.child('presence/' + player);
    var positionsRef = database.child('players/' + player);
    presenceOff.remove();
    positionsRef.remove();
  }

  var player;
  var other;
  var keys;
  var projectiles;
  var cooldown;
  var server;
  var id;

  server = "http://localhost/evora/z3aserver.php"
  cooldown = 0;

  function keyDown(e)
  {
    var unicode;

    unicode = e.keyCode? e.keyCode : e.charCode;
    //alert("KeyDown: " + unicode);
    keys[unicode] = true;
  }

  function keyUp(e)
  {
    var unicode;

    unicode = e.keyCode? e.keyCode : e.charCode;
    //alert("KeyUp: " + unicode);
    keys[unicode] = false;
  }

  function lockScreen()
  {
    Screen.x = player.getX() - (Screen.getWidth() / 2);
    Screen.y = player.getY() - (Screen.getHeight() / 2);

    if(Screen.x < 0)
    {
      Screen.x = 0;
    }

    if(Screen.y < 0)
    {
      Screen.y = 0;
    }
  }

  function initialize()
  {
    id = 0;
    Screen.initialize();
    World.initialize();

    keys = new Array();
    projectiles = new Array();
    player = new Player(uid, 300, 300);

    update();
    updateServer();
    draw();
  }

  // array to store all other players 
  var others = [];

  players.on('child_added', function(snapshot) {
    var obj = snapshot.val();

    if(snapshot.key() != uid) {
      other = new Other(snapshot.key(), 300, 300);
      other.draw(obj.x, obj.y, obj.dir, obj.motion, obj.sitting, obj.username, obj.chat, obj.tag);
      others.push(other);
    }
  });

  players.on('child_changed', function(snapshot) {
      var obj = snapshot.val();
      if(snapshot.key() != uid) {

        for(var i in others) {
          // filters to only change position for other player in motion
          if(others[i].character == snapshot.key()) {
            // redraw on position change 
            others[i].draw(obj.x, obj.y, obj.dir, obj.motion, obj.sitting, obj.username, obj.chat, obj.tag);
          }
        }

      /*  switch(obj.dir) {
          case 0: other.moveLeft(); break;
          case 1: other.moveUp(); break;
          case 2: other.moveRight(); break;
          case 3: other.moveDown(); break;
        } */
      }
  });

  var myPlayer = database.child('players').child(uid);
  
  function updateServer()
  {
    setTimeout('updateServer()', 100); 

   /* myPlayer.update({
      x: player.getX(),
      y: player.getY(),
      dir: player.getDirection()
      // add variable for stop? 
    }); */

    myPlayer.transaction(function(currentPosition) {
      if (currentPosition) {
        currentPosition.x = player.getX();
        currentPosition.y = player.getY();
        currentPosition.dir = player.getDirection();
      }
      return currentPosition;
    });
  }

  function update()
  {
    setTimeout('update()', 16.6666);
    cooldown--;

    if(keys[37] == true || keys[38] == true || keys[39] == true || keys[40] == true)
    {
      myPlayer.update({
        motion: true
      });
    }
    else
    {
      myPlayer.update({
        motion: false
      });

      player.stop();
    }

  // sword instead of projectile
  /*  if(keys[32] == true)
    {
      if(cooldown <= 0)
      {
        projectiles[projectiles.length] = new Projectile("rocket", player.getX(), player.getY() - 16, player.getDirection());
        cooldown = 10;
      }
    } */

    if(keys[38] == true)
    {
      player.moveUp();
    }

    if(keys[40] == true)
    {
      player.moveDown();
    }

    if(keys[39] == true)
    {
      player.moveRight();
    }

    if(keys[37] == true)
    {
      player.moveLeft();
    }

    player.update();

    for(projectileIndex = 0; projectileIndex < projectiles.length; projectileIndex++)
    {
      if(projectiles[projectileIndex].update() == false)
      {
        projectiles[projectileIndex].kill();
        projectiles.splice(projectileIndex, 1);
      }
    }

    // lockScreen();
  }

  function draw()
  {
    setTimeout('draw()', 16.6666);
    player.draw();

    for(projectileIndex = 0; projectileIndex < projectiles.length; projectileIndex++)
    {
      projectiles[projectileIndex].draw();
    }     
  }

  function Projectile(type, x, y, direction)
  {
    var image;
    var type;
    var rectangle;
    var direction;
    var life;
    var speed;

    this.type = type;
    this.rectangle = new Rectangle(x, y, 32, 32);
    this.direction = direction;
    this.image = document.createElement("img");
    this.image.style.position = "absolute";
    Screen.add(this.image);
    this.life = 100;
    this.speed = 15;

    this.draw = function()
    {
      this.image.style.left = this.rectangle.getX() - Screen.x;
      this.image.style.top = this.rectangle.getY() - Screen.y;
      this.image.src = "images/projectiles/" + this.type + ".png";
    }

    this.update = function()
    {
      this.life = this.life - 1;

      if(this.direction == 0)
      {
        this.rectangle.setX(this.rectangle.getX() - this.speed);
      }

      if(this.direction == 1)
      {
        this.rectangle.setY(this.rectangle.getY() - this.speed);
      }

      if(this.direction == 2)
      {
        this.rectangle.setX(this.rectangle.getX() + this.speed);
      }

      if(this.direction == 3)
      {
        this.rectangle.setY(this.rectangle.getY() + this.speed);
      }

      if(checkCollision(this.rectangle) == true)
      {
        this.life = 0;
      }

      if(this.life <= 0)
      {
        return false;
      }
      else
      {
        return true;
      }
    }

    this.kill = function()
    {
      Screen.remove(this.image);
    }
  }

  function checkCollision(rectangle)
  {
    if(rectangle.y <= 0)
    {
      return true;
    }

    for(blockIndex = 0; blockIndex < World.walls.length; blockIndex++)
    {
      if(rectangle.intersects(World.walls[blockIndex]) == true && World.walls[blockIndex].type == 0)
      {
        return true;
      }
    }

    return false;
  }

  function checkChair(rectangle) {
    for(blockIndex = 0; blockIndex < World.walls.length; blockIndex++)
    {
      if(rectangle.intersects(World.walls[blockIndex]) == true && World.walls[blockIndex].type == 1)
      {
        return true; 
      }
    }

    return false;
  }

  function Player(character, x, y)
  {
    var headImage;
    var bodyImage;
    var character;
    var direction;
    var animation;
    var position;
    var frame;
    var frameLimiter;
    var rectangle;
    var speed;
    var chat = document.createElement('span');
    var player = document.createElement('div');
    var bodyImg = document.createElement('div');
    var headImg = document.createElement('div');

    this.player = document.getElementById('level').appendChild(player);
    this.player.id = character;

    this.chat = headImg.appendChild(chat);
    this.chat.style.position = 'absolute';
    this.chat.style.left = '50%';
    this.chat.style.transform = 'translateX(-50%)';
    this.chat.style.top = '-10px';
    this.chat.style.color = '#FFFFFF'; // #ffca0b
    this.chat.style.fontSize = '14px';
    this.chat.style.zIndex = '99';
    this.chat.style.whiteSpace = 'nowrap';
    this.chat.style.fontFamily = 'Verdana';

    this.character = character;
    this.x = x;
    this.y = y;
    this.animation = 0;
    this.bodyImage = document.getElementById(character).appendChild(bodyImg);
    this.bodyImage.style.height = '32px';
    this.bodyImage.style.width = '32px';
    this.bodyImage.style.position = 'absolute';
    this.bodyImage.style.zIndex = '2'; 
    this.posY = 0;
    this.headImage = document.getElementById(character).appendChild(headImg);
    this.headImage.style.height = '32px';
    this.headImage.style.width = '32px';
    this.headImage.style.position = 'absolute';
    this.headImage.style.zIndex = '2';
    this.position = 32;
    this.direction = 3;
    this.frame = 0;
    this.frameLimiter = 0;
    this.speed = 3.5;
    this.rectangle = new Rectangle(x, y, 32, 16);
    Screen.add(this.player);

    this.getCharacter = function()
    {
      return this.character;
    }

    this.getX = function()
    {
      return this.rectangle.getX();
    };

    this.getY = function()
    {
      return this.rectangle.getY();
    };

    this.getDirection = function()
    {
      return this.direction;
    };

    this.setLocation = function(x, y)
    {
      this.rectangle.setX(x);
      this.rectangle.setY(y);
    };

    this.moveLeft = function()
    {
      this.direction = 0;
      this.animation = 1;
      this.rectangle.setX(this.rectangle.getX() - this.speed);
    };

    this.moveUp = function()
    {
      this.position = 96;
      this.direction = 1;
      this.animation = 1;
      this.rectangle.setY(this.rectangle.getY() - this.speed);
    };

    this.moveRight = function()
    {
      this.direction = 2;
      this.animation = 1;
      this.rectangle.setX(this.rectangle.getX() + this.speed);
    };

    this.moveDown = function()
    {
      this.direction = 3;
      this.animation = 1;
      this.rectangle.setY(this.rectangle.getY() + this.speed);
    };

    this.stop = function()
    {
      if(this.animation == 1)
      {
        this.animation = 0;
      }
    };

    this.update = function()
    {
      if(this.animation == 0)
      {
        this.frameLimiter = 5;
        this.frame = 0;
        this.posY = 0;
      }

      if(this.animation == 1)
      {
        if(this.frameLimiter == 5)
        {
          this.frame++;
          this.posY += 32;
          this.frameLimiter = 0;
        }
        else
        {
          this.frameLimiter++;
        }

        if(this.frame > 4)
        {
          this.frame = 1;
          this.posY = 32;
        }
      }

      if(checkChair(this.rectangle) == true)
      {
        this.posY = 160;

        myPlayer.update({
          sitting : true
        });
      }
      else {
        myPlayer.update({
          sitting : false
        });
      }

      if(checkCollision(this.rectangle) == true)
      {
        this.uncollide(1);
      }
    };

    this.uncollide = function(offset)
    {
      this.rectangle.setY(this.rectangle.getY() + offset);

      if(checkCollision(this.rectangle) == true)
      {
        this.rectangle.setY(this.rectangle.getY() - offset);
        this.rectangle.setY(this.rectangle.getY() - offset);
      }

      if(checkCollision(this.rectangle) == true)
      {
        this.rectangle.setY(this.rectangle.getY() + offset);
        this.rectangle.setX(this.rectangle.getX() + offset);
      }

      if(checkCollision(this.rectangle) == true)
      {
        this.rectangle.setX(this.rectangle.getX() - offset);
        this.rectangle.setX(this.rectangle.getX() - offset);
      }

      if(checkCollision(this.rectangle) == true)
      {
        this.rectangle.setX(this.rectangle.getX() + offset);
        this.rectangle.setX(this.rectangle.getX() + offset);
        this.rectangle.setY(this.rectangle.getY() + offset);
      }

      if(checkCollision(this.rectangle) == true)
      {
        this.rectangle.setX(this.rectangle.getX() - offset);
        this.rectangle.setY(this.rectangle.getY() - offset);
        this.rectangle.setX(this.rectangle.getX() - offset);
        this.rectangle.setY(this.rectangle.getY() + offset);
      }

      if(checkCollision(this.rectangle) == true)
      {
        this.rectangle.setX(this.rectangle.getX() + offset);
        this.rectangle.setY(this.rectangle.getY() - offset);
        this.rectangle.setX(this.rectangle.getX() - offset);
        this.rectangle.setY(this.rectangle.getY() - offset);
      }

      if(checkCollision(this.rectangle) == true)
      {
        this.rectangle.setX(this.rectangle.getX() + offset);
        this.rectangle.setY(this.rectangle.getY() + offset);
        this.rectangle.setX(this.rectangle.getX() + offset);
        this.rectangle.setY(this.rectangle.getY() - offset);
      }

      if(checkCollision(this.rectangle) == true)
      {
        this.rectangle.setX(this.rectangle.getX() - offset);
        this.rectangle.setY(this.rectangle.getY() + offset);
        this.uncollide(offset + 1);
      }
    };

    this.draw = function(chat)
    {

      switch(this.direction) {
        case 0: this.position = 0; this.posX = 0; break;
        case 1: this.position = 96; this.posX = 96; break;
        case 2: this.position = 64; this.posX = 64; break;
        case 3: this.position = 32; this.posX = 32;
      }

      this.bodyImage.style.left = this.rectangle.getX() - Screen.x;
      this.bodyImage.style.top = this.rectangle.getY() - Screen.y + 4 - 16;
      this.bodyImage.style.background = 'url(images/bodies/body2.png) ' + this.posX + 'px -' + this.posY + 'px';

      this.headImage.style.left = this.rectangle.getX() - Screen.x;
      this.headImage.style.top = this.rectangle.getY() - Screen.y - 10 - 16;
      this.headImage.style.background = 'url(images/heads/head1.png) ' + '0px ' + this.position + 'px';

      if(chat) {
        this.chat.textContent = chat;
      }
    };
  }

  function Other(character, x, y)
  {
    var headImage;
    var bodyImage;
    var direction; // include in Firebase .update()
    var animation;
    var position; 
    var frame;
    var frameLimiter;
    var rectangle;
    var speed;
    var chat = document.createElement('div');
    var username = document.createElement('div');
    var player = document.createElement('div');
    var bodyImg = document.createElement('div');
    var headImg = document.createElement('div');

    this.player = document.getElementById('level').appendChild(player);
    this.player.id = character;

    this.chat = headImg.appendChild(chat);
    this.chat.style.position = 'absolute';
    this.chat.style.left = '50%';
    this.chat.style.transform = 'translateX(-50%)';
    this.chat.style.top = '-10px';
    this.chat.style.color = '#FFFFFF';
    this.chat.style.fontSize = '14px';
    this.chat.style.whiteSpace = 'nowrap';
    this.chat.style.fontFamily = 'Verdana';

    this.username = bodyImg.appendChild(username);
    this.username.style.position = 'absolute';
    this.username.style.left = '50%';
    this.username.style.transform = 'translateX(-50%)';
    this.username.style.top = '26px';
    this.username.style.color = '#FFFFFF';
    this.username.style.fontSize = '12px';
    this.username.style.zIndex = '2';
    this.username.style.fontWeight = 'bold';
    this.username.style.fontFamily = 'Verdana';
 
    // initial specs 
    this.character = character;
    this.speed = 3.5;
    this.animation = 0;
    this.bodyImage = document.getElementById(character).appendChild(bodyImg);
    this.bodyImage.style.height = '32px';
    this.bodyImage.style.width = '32px';
    this.bodyImage.style.position = 'absolute';
    this.bodyImage.style.zIndex = '2'; // drawasplayer
    this.posY = 0;
    this.headImage = document.getElementById(character).appendChild(headImg);
    this.headImage.style.height = '32px';
    this.headImage.style.width = '32px';
    this.headImage.style.position = 'absolute';
    this.headImage.style.zIndex = '2';
    this.position = 32;
    this.direction = 3;
    this.frameLimiter = 0;
    this.frame = 0;
    this.rectangle = new Rectangle(x, y, 32, 16);
    Screen.add(this.player);

    this.update = function(animation, motion, sitting, rectangle)
    {
      if(motion) 
      {
        if(animation == 0)
        {
          this.frameLimiter = 5;
          this.frame = 0;
          this.posY = 0;
        }

        if(animation == 1)
        {
            animation = 0;
            this.frame++;
            this.posY += 32;
            this.frameLimiter = 0;

          if(this.frame > 4)
          {
            this.frame = 1;
            this.posY = 32;
          }
        }
      }
      else {
        this.posY = 0;
        animation = 0;
      }

      if(sitting)
      {
        this.posY = 160;
      }
    };

    this.draw = function(x, y, dir, motion, sitting, username, chat, color)
    {
      this.rectangle.setX(x - this.speed);
      this.rectangle.setX(y + this.speed);

      this.update(1, motion, sitting, this.rectangle);

      switch(dir) {
        case 0: this.position = 0; this.posX = 0; break;
        case 1: this.position = 96; this.posX = 96; break;
        case 2: this.position = 64; this.posX = 64; break;
        case 3: this.position = 32; this.posX = 32;
      }

      this.player.style.left = x - Screen.x;
      this.player.style.top = y - Screen.y;

      this.bodyImage.style.left = x - Screen.x;
      this.bodyImage.style.top = y - Screen.y + 4 - 16;
      this.bodyImage.style.background = 'url(images/bodies/body2.png) ' + this.posX + 'px -' 
      + this.posY + 'px';

      this.headImage.style.left = x - Screen.x;
      this.headImage.style.top = y - Screen.y - 10 - 16;
      this.headImage.style.background = 'url(images/heads/head1.png) ' + '0px ' + this.position + 'px';

      this.username.style.color = '#' + color;

      if(username) {
        this.username.textContent = username;
      }
      if(chat) {
        this.chat.textContent = chat;
      }
    };
  }

  // clear chat after 1 sec
  myPlayer.on('child_added', function(snapshot) {
    if (snapshot.key() == 'chat') {
      player.draw(snapshot.val());
      setTimeout(function() { 
        myPlayer.update({
          chat : ' '
        });
        player.draw(' '); // remove chat
      }, 4500);
    }
  });

  function Rectangle(x, y, width, height, type)
  {
    var x;
    var y;
    var width;
    var height;
    var type; 

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;

    this.setX = function(x)
    {
      this.x = x;
    };

    this.setY = function(y)
    {
      this.y = y;
    };

    this.setWidth = function(width)
    {
      this.width = width;
    };

    this.setHeight = function(height)
    {
      this.height = height;
    };

    this.getX = function()
    {
      return this.x;
    };

    this.getY = function()
    {
      return this.y;
    };

    this.getWidth = function()
    {
      return this.width;
    };

    this.getHeight = function()
    {
      return this.height;
    };

    this.intersects = function(rectangle)
    {
      var collidingX;
      var collidingY;

      collidingX = false;
      collidingY = false;

      if(this.getX() <= rectangle.getX())
      {
        // removed '=' in '>=' to prevent image blur on collide 
        if(this.getX() + this.getWidth() > rectangle.getX())
        {
          collidingX = true;
        }
      }

      if(this.getY() <= rectangle.getY())
      {
        if(this.getY() + this.getHeight() > rectangle.getY())
        {
          collidingY = true;
        }
      }

      if(rectangle.getX() <= this.getX())
      {
        if(rectangle.getX() + rectangle.getWidth() >= this.getX())
        {
          collidingX = true;
        }
      }

      if(rectangle.getY() <= this.getY())
      {
        if(rectangle.getY() + rectangle.getHeight() >= this.getY())
        {
          collidingY = true;
        }
      }

      if(collidingX == true && collidingY == true)
      {
        return true;
      }

      return false;
    };
  }

  function NPC(x, y, w, h, image, message) {
    var rectangle; 
    var div;

    this.div = document.createElement('div');
    // add check to retrieve local images too
    this.div.style.position = 'absolute';
    this.div.style.background = 'url(' + image + ')';
    this.div.style.left = x + 'px';
    this.div.style.top = y + 'px';
    this.div.style.width = w + 'px';
    this.div.style.height = h + 'px';
    this.div.style.zIndex = '2';

    // NPC message 
    this.message = document.createElement('div');
    this.message.style.color = '#FFFFFF';
    this.message.style.whiteSpace = 'nowrap';
    this.message.textContent = message;
    this.message.style.position = 'absolute';
    this.message.style.marginTop = '-5px';
    this.message.style.left = '50%';
    this.message.style.transform = 'translateX(-50%)';
    this.message.style.textAlign = 'center';
    this.message = this.div.appendChild(this.message);
    Screen.add(this.div);

    // 0 : blocking 
    this.rectangle = new Rectangle(x, y, w, h, 0);
    return this.rectangle;
  }

  function Chair(x, y, w, h, image) {
    // set sitting animation 
    var rectangle; 
    var div;

    this.div = document.createElement('div');
    // add check to retrieve local images too
    this.div.style.position = 'absolute';
    this.div.style.background = 'url(' + image + ')';
    this.div.style.left = x + 'px';
    this.div.style.top = y + 'px';
    this.div.style.width = w + 'px';
    this.div.style.height = h + 'px';
    this.div.style.zIndex = '2';
    Screen.add(this.div);

    // 1 : chair 
    this.rectangle = new Rectangle(x, y, w, h, 1);
    return this.rectangle;
  }

  var World =
  {
    map: 0,
    image: 0,
    walls: 0,

    initialize: function()
    {      
      this.image = document.createElement("img");
      this.image.style.zIndex = 2;
      this.image.src = 'images/tilesets/map.png';
      this.image.style.width = '1048px';
      this.image.style.height = '677px'; 
      Screen.add(this.image);

      World.walls = new Array();

      // left > up > right > down
      World.walls[World.walls.length] = new Chair(208, 244, 32, 32, 'images/npcs/chair.png');
      World.walls[World.walls.length] = new NPC(208, 133, 32, 40, 'images/npcs/barrel2.png');
      World.walls[World.walls.length] = new NPC(240, 228, 96, 64, 'images/npcs/table.png');
      World.walls[World.walls.length] = new Chair(336, 244, 32, 32, 'images/npcs/chair.png');
      World.walls[World.walls.length] = new Chair(400, 175, 32, 32, 'images/npcs/chair.png');

      // walls 
      World.walls[World.walls.length] = new Rectangle(177, 5, 29, 336, 0);
      World.walls[World.walls.length] = new Rectangle(215, 324, 150, 32, 0);
      World.walls[World.walls.length] = new Rectangle(431, 324, 49, 32, 0);
      World.walls[World.walls.length] = new Rectangle(208, 99, 274, 40, 0);
      World.walls[World.walls.length] = new Rectangle(479, 117, 32, 95, 0);
      World.walls[World.walls.length] = new Rectangle(448, 293, 32, 30, 0);
      World.walls[World.walls.length] = new Rectangle(487, 210, 73, 18, 0);
      World.walls[World.walls.length] = new Rectangle(480, 260, 67, 31, 0);
      World.walls[World.walls.length] = new Rectangle(544, 228, 32, 31, 0);

      // tile map for chairs 0 not chair, 1 chair. 

    /*  // 864 x 640 map (32px tiles)
      var mapArray = [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      ];

      // draws map
      for (var i = 0; i < mapArray.length; i++) {
        for (var j = 0; j < mapArray[i].length; j++) {
          if (parseInt(mapArray[i][j]) == 0) {
            // sticking things inside the container
            this.tile0 = document.createElement('div');
            this.tile0.style.position = 'relative';
            this.tile0.style.float = 'left';
            this.posX = 512;
            this.posY = 256;
            this.tile0.style.background = 
            'url(images/tilesets/evora.png) -' + this.posX + 'px -' 
            + this.posY + 'px';
            this.tile0.style.width = '32px';
            this.tile0.style.height = '32px';
            // append to level 
            document.getElementById("level").appendChild(this.tile0);
          }
          if (parseInt(mapArray[i][j]) == 1) {
            // sticking things inside the container
            this.tile1 = document.createElement('div');
            this.tile1.style.position = 'relative';
            this.tile1.style.float = 'left';
            this.posX = 592;
            this.posY = 352;
            this.tile1.style.background = 
            'url(images/tilesets/evora.png) -' + this.posX + 'px -' 
            + this.posY + 'px';
            this.tile1.style.width = '32px';
            this.tile1.style.height = '32px';
            // append to level 
            document.getElementById("level").appendChild(this.tile1);

            World.walls[World.walls.length] = new Rectangle(this.tile1.offsetLeft, this.tile1.offsetTop, 32, 32);
          }
        }
      } */
    }
  }

  var Screen =
  {
    x: 0,
    y: 0,
    div: 0,

    initialize: function()
    {        
      div = document.createElement('div');
      document.getElementById('game').appendChild(div);
      div.id = "screenDiv";
      div.style.top = 0;
      div.style.left = 0;
      div.style.width = "100%";
      div.style.height = "100%";
    //  div.style.backgroundColor = "white";
      div.style.overflow = "hidden";
    },

    getWidth: function()
    {
      return div.offsetWidth;
    },

    getHeight: function()
    {
      return div.offsetHeight;
    },

    add: function(element)
    {
      document.getElementById("screenDiv").appendChild(element);
    },

    remove: function(element)
    {
      document.getElementById("screenDiv").removeChild(element);
    }
  }

$('#play').click(function() { 

  var username = $('#username').val().toLowerCase(); 

  myPlayer.update({
    username : username,
    tag : 'FFFFFF'
  });

  $('.wrapper').hide();
  $('#game').show();

  // chat  
  $('#message').keypress(function (e) {
    var text = $('#message').val();
    if (e.keyCode == 13 && text !== '') {
      chatRef.push({ 
        name: username, 
        text: text
      });
      myPlayer.update({ 
        chat : text
      });
      $('#message').val('');
    }
  });

  chatRef.endAt().limit(13).on('child_added', function(snapshot) {
    var message = snapshot.val();
    displayChatMessage(message.name, message.text);
  });

  function displayChatMessage(name, text) {
    // prevent html output
    var div = document.createElement("div");
    div.innerHTML = text;
    var t = div.textContent || div.innerText || "";

    $('#chatbox').prepend('<div style="left:5px">' 
    + '<b>' + name + '</b>: ' + t);
    $('#chatbox')[0].scrollTop = $('#chatbox')[0].scrollHeight;
  }

});
