# PTC-Toolbox #

Documentation for the toolbox found here (contains info for how to connect to the LEGO Spike Prime): https://docs.google.com/document/d/10Vy8I2yCTBYPJsHEbj0ly8ThYc4TEttJXFTCyTY63Dw

Check out our YouTube tutorial playlist: https://www.youtube.com/watch?v=3wkmBDgpb34&list=PLhL0fv9JyKMaWhaHmm21J6mgpp841zYYw

# Adding Multiple SPIKE's to One Server #
<details>
 <summary>Instructions</summary>
 
  ### Step 1: Creating a New Image Target ###
  * To add another SPIKE Prime, we need to be able to attach it to a new image target
  * Checkout our YouTube Tutorial video: https://youtu.be/TBEV5K3dprA
 
  ### Step 2: Duplicating Files ###
  * Next, we need to go into `vuforia-spatial-edge-server` --> `addons` --> `vuforia-spatial-robotic-addon` --> `interfaces`
  * Here, we can see the folder called `Spike-Prime`. If we go into the folder, our first SPIKE Prime should already be connected through editing the `serial.js` and `index.js` files
  * What we need to now do is to duplicate the entire `Spike-Prime` folder and call it `Spike-Prime2` (you can increment this number based on the number of SPIKE's you want to connect) 
  
  ### Step 3: Editing Files ###
  * After duplicating the folder, we can then go into the `serial.js` file in the duplicated folder
  * Edit line 25 so that the serial port is for the new SPIKE Prime (Open up a new terminal window and type `cd /dev/tty.` and hit tab a couple of times to find the new serial port)
  * When we finish typing the updated serial port, we can go into the `index.js` file within this same folder
  * Here we need to edit lines 6-8
    * Line 6 should be called `Spike2` (again increment the number based on the number of SPIKE's)
    * Line 7 should be the new name of the folder that you made within `spatialToolbox` (see <b>Step 1</b> above)
    * Line 8 should have the same name as Line 6

  ### Step 4: Starting the Server ###
  * Finally, we can save everything and start the server. If all the steps have been followed, it should start working! 
  * <b> Note: </b> Sometimes the SPIKE needs to be connected a few times to make and establish the connection. See our YouTube playlist above for more information. 

</details>

# **Flowchart of the Spatial Toolbox** #
Use this flowchart to help guide you through which files to either look at or alter if you want to make any changes such as adding new logic blocks or tools. 

![GitHub Logo](https://github.com/tuftsceeo/PTC-Toolbox/blob/master/flowchart.png)
