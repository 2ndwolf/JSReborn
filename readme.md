<h2> Welcome to the open-sourced JSReborn Project!</h2>
<p>
This is a 2D multiplayer game written in JavaScript with a Firebase backend. <br>
This project is currently in development. <a href="http://evora.forumotion.com/t5-game-progress-updates">Here</a> is the progress thread.<br><br>

<h3>Basic Setup</h3>
Before getting started, please make an account with <a href="http://www.firebase.com">Firebase.com</a>. It's free!<br> 
In the <b>game.js</b> file, replace the placeholder line with your firebase URL:
<br><br>
<code>
var database = new Firebase('YOUR FIREBASE URL'); 
</code>
<br><br>
Your firebase URL creates a unique 'server' for your game. Once you have replaced it, simply upload all the code and files to a public webserver, share the public URL with your friends, and you should be on your way to fame!

<h3>Adding Objects to your game</h3>
<li>NPCs</li>
<br>
<code>World.walls[World.walls.length] = new NPC(x, y, width, height, 'image_url');</code>
</br>
<li>Chairs</li>



<h3>Bug Report</h3>
http://evora.forumotion.com/t8-demo-1-0-bugs-fixes

<br><br>
<h3>Preview Picture</h3>

<img src="http://i37.servimg.com/u/f37/19/58/72/57/chatnu11.png" />

More pictures and videos available <a href="http://evora.forumotion.com/t5-game-progress-updates">here</a>.

</p>
