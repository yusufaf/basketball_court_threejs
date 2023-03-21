# basketball_court_threejs

Project for modeling the Portland Trail Blazers court using Three.js

# Motivation
I'm a huge basketball fan and I love/hate the Trail Blazers, so I decided to attempt to "replicate" the court/arena they play in using a graphics tool I've learned about from class.

# Process
I initially started the project using OpenGL (C++). Getting my environment setup the way I wanted it to on Windows was very frustrating. Eventually, having things setup in a satisfactory way, I realized that OpenGL would take me way too long to get things on the screen, so I looked for an alternative.

I've known about Three.js for a while, but I'd never used it. Listened to a lecture in class about it and decided to make the switch, which was a great decision.

The various shapes in the model/scene are made using the out-of-the-box geometries that Three.js provides (Cylinders, Boxes, Planes, etc). 

Simple images from an actual NBA court are used as textures on the faces of some of the geometries. These images can be seen on the court itself, for rendering the "crowd" that surrounds the court, 

Interactive/dynamic elements
- Shot clock(s) that operates pretty closely to the actual clock in an NBA basketball game
- Basketball that can be dragged around the scene (the basketball rotates on one axis while dragging) and also when clicked it does a simple rotation
- Crowd audio that can be muted/turned on using the audio symbol in the top left

# Viewing
I realize that I've had to always run a local server using a VS Code extension to actually view my Three.js + HTML, as I run into a CORS issue trying to load a local JavaScript file.

This isn't very convenient, so the project can be viewed at the URL below

https://beautiful-sunshine-e1b72e.netlify.app/

# Resources
- Chair Model: "Foldable chair" (https://skfb.ly/o97OI) by 1.raphael.wanders.2.mi.ma is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
