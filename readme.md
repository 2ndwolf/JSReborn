<h2> Welcome to the open-sourced JSReborn Project!</h2>
<p>
This is a 2D multiplayer game written in JavaScript with a Firebase backend. <br>
This project is currently in development. <a href="http://evora.forumotion.com/t5-game-progress-updates">Here</a> is the progress thread.<br>

<p>Please note that this project and all its code is currently for <b>non-commercial</b> use. <br>Contact <a href="#">ramseyhat@gmail.com</a> with any licensing questions.

<h3>Basic Setup</h3>
Before getting started, please make an account with <a href="http://www.firebase.com">Firebase.com</a>. It's free!<br> 
In the <b>game.js</b> file, replace the placeholder line with your firebase URL:
<br><br>
<code>
var database = new Firebase('YOUR FIREBASE URL'); 
</code>
<br><br>
Your firebase URL creates a unique 'server' for your game. Once you have replaced it, simply upload all the code and files to a public webserver, share the public URL with your friends, and you should be on your way to fame!

<h3>Adding Objects</h3>
<li>NPCs</li>
<br>
Add the following line to the World class and replace the parameters:
<br><br>
<code>World.walls[World.walls.length] = new NPC(x, y, width, height, image);</code>
<br><br>
<b>Example:</b> <code>World.walls[World.walls.length] = new NPC(240, 228, 96, 64, 'images/npcs/table.png');</code><br>
You can use a local path (as shown above) or an image URL for the image parameter. 
</br><br>
<li>Chairs</li>
</br>
Replace <code>NPC</code> with <code>Chair</code> in the code above for the NPC, it takes in the same parameters. 

<h3>Bug Report</h3>
http://evora.forumotion.com/t8-demo-1-0-bugs-fixes

<br>
<h3>Preview Picture</h3>

<img src="http://i37.servimg.com/u/f37/19/58/72/57/chatnu11.png" />

More pictures and videos available <a href="http://evora.forumotion.com/t5-game-progress-updates">here</a>.

</p>
