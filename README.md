# a4-RyanCarignan

Hosting link: http://a4-ryancarignan.onrender.com

## Goal
The application aims to create a 3rd-person web-based aim-trainer, as there currently aren't any available (as far as I can tell). This project specifically implements the standard mode where one shoots as many regenerating balloons as they can within a time limit.

## Challenges Faced
Three.js itself is quite easy to work with and well documented, so the largest hurdle of the application was abstracting the various lower-level code handling things like user-input or graphics rendering to higher-level game logic that could be easily used and reused without having to rewrite everything. I do hope to continue to expand this project in the future so I put in a lot of work-- especially early on-- in creating a robust system. For example, new maps could be easily added via a JSON format that is parsed by the Map class, or new weapons with different ranges and models via the Weapon class. The camera was also difficult to figure out, as none of the pre-made Three.js camera control add-ons were sufficient for this project, so the math involving translating X-Y user-input to actual X-Y-Z camera positions that followed the player spherically took a bit to figure out.

## Additional Instructions
I mentionned in the instructions, but want to reiterate here: if you are having issues with the controller input not working, make sure your browser is [accepting the controller inputs correctly](https://hardwaretester.com/gamepad) in the first place! Firefox did not work for me, and I think your best bet is a wired connection and Chrome.
