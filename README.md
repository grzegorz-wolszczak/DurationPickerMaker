# DurationPickerMaker
HTML DurationPicker element written in vanilla javascript.

Single html component/widget.   
You can customize how the hours/minutes/seconds unit description can look like e.g:  

![picker](assets/images/picker1.png "Short name units")  
![picker](assets/images/picker2.png "Long name units")  
![picker](assets/images/picker3.png "Units without names")  

# See [demo](./demo/demo.html) for details

### Motivation
I needed a duration picker html element for my private project. 
I've searched many projects on github but the most fitting to my needs was [this one](https://github.com/nadchif/html-duration-picker.js).
I modified/rewrote it for my purposes. 
  
  See demo/demo.htm to see how it works.
 
 
#### Note
Main class of this project is not in a javascript 'module' so the the user could test this with simple HTML page and without setting up local web server.
If main class was in a module then putting it in html page and trying to load such html page would result in error in browser developer console with error similar to this:
``` Access to script at
'file:///.../html-duration-picker.js' from origin 'null' has been blocked by CORS policy: Cross origin requests are only supported for protocol schemes: http, data, chrome, chrome-extension, https.
```