/*
 * EQCSS / Tommy Hodgins, Maxime Euzière / MIT licence
 * Global object
 */

EQCSS = {
  code: "",                       // All the EQCSS code (concatenated)
  styles: [],                     // All the <style> blocks (embedded style), <link rel=stylesheet> tags (external files), and <script type="text/eqcss"> blocks (embedded or external)
  queries: [],                    // All the @element queries
  selectors: [],                  // All the queries' selectors
  conditions: [],                 // All the queries' conditions
  styles: [],                     // All the queries' CSS code
  xhr: new XMLHttpRequest         // AJAX handler
}

/*
 * EQCSS.load()
 * Called automatically on page load.
 * Call it manually after adding EQCSS code in the page.
 * Loads and parses all the EQCSS code.
 */

EQCSS.load = function(){

  // Retrieve all style blocks
  var styles = document.querySelectorAll("style");

  for(var i = 0; i < styles.length; i++){

    // Test if the style is not read yet
    if(!styles[i].getAttribute("eqcss-read")){
      
      // add their content to the EQCSS code
      this.code += styles[i].innerHTML;
    
      // Mark the style block as read
      styles[i].setAttribute("eqcss-read", "true");
    }
  }
  
  // Retrieve all link tags
  styles = document.querySelectorAll("link");

  for(i = 0; i < styles.length; i++){
    
    // Test if the link is not read yet, and has rel=stylesheet
    if(!styles[i].getAttribute("eqcss-read") && styles[i].getAttribute("rel") == "stylesheet"){
        
      // retrieve the file content with synchronous AJAX and add it to the EQCSS code
      if(styles[i].href){
        this.xhr.open("GET", styles[i].href, false);                             
        this.xhr.send(null);
        this.code += this.xhr.responseText;                   
      }
      
      // Mark the link as read
      styles[i].setAttribute("eqcss-read", "true");
    }
  }
  
  // Retrieve all script blocks
  styles = document.querySelectorAll("script");

  for(var i = 0; i < styles.length; i++){

    // Test if the script is not read yet and has type="text/eqcss"
    if(!styles[i].getAttribute("eqcss-read") && styles[i].getAttribute("type") === "text/eqcss"){
      
      // Test if they contain external EQCSS code
      if(styles[i].src){

        // retrieve the file content with synchronous AJAX and add it to the EQCSS code
        this.xhr.open("GET", styles[i].src, false);                             
        this.xhr.send(null);
        this.code += this.xhr.responseText;  
      }
      
      // or embedded EQCSS code
      else {
        
        // add it content to the EQCSS code
        this.code += styles[i].innerHTML;
      }
    
      // Mark the script block as read
      styles[i].setAttribute("eqcss-read", "true");
    }
  }
  
  // Cleanup
  this.code = this.code.replace(/\s+/g," "); // reduce spaces
  this.code = this.code.replace(/^ | $/g,""); // trim
  this.code = this.code.replace(/\/\*[\w\W]*?\*\//g,""); // remove comments
  this.code = this.code.replace(/ *@element/g,"\n@element"); // One element query per line
  
  // Parse
  
  // Separate the queries
  this.code.replace(/(@element.*(?!@element))/g, function(string, match){
    EQCSS.queries.push(match);
  });
  
  // Extract the selectors
  for(i = 0; i < this.queries.length; i++){
    this.queries[i].replace(/@element ?["']([^"']*)["']/g, function(string, match){
      EQCSS.selectors[i] = match;
    })
  }
  
  // Extract the conditions
  for(i = 0; i < this.queries.length; i++){
    this.conditions[i] = [];
    this.queries[i].replace(/and ?\( ?([^:]*) ?: ?([^)]*) ?\)/g, function(string, match1, match2){
      EQCSS.conditions[i].push({measure: match1, value: match2});
    })
  }
  
  // Extract the styles
  for(i = 0; i < this.queries.length; i++){
    this.queries[i].replace(/{(.*)}/g, function(string, match){
      EQCSS.styles[i] = match;
    })
  }
}

/*
 * EQCSS.apply()
 * Called on load, on resize and manually on DOM update
 * Enable the Element Queries in which the conditions are true
 */

EQCSS.apply = function(){

  var i, j, k;                      // Iterators
  var elements;                     // Elements targeted by each query
  var element_guid;                 // GUID for current element
  var css_block;                    // CSS block corresponding to each targeted element
  var element_guid_parent;          // GUID for current element's parent
  var css_code;                     // CSS code to write in each CSS block (one per targeted element)
  var element_width, parent_width;  // Computed widths
  var element_height, parent_height;// Computed heights
  var element_line_height;          // Computed line-height
  var test;                         // Query's condition test result
  var computed_style;               // Each targeted element's computed style
  var parent_computed_style;        // Each targeted element parent's computed style
  
  // Loop on all element queries
  for(i = 0; i < EQCSS.queries.length; i++){
  
    // Find all the elements targeted by the query
    elements = document.querySelectorAll(EQCSS.selectors[i]);
    
    // Loop on all the elements
    for(j = 0; j < elements.length; j++){
    
      // Create a guid for this element
      // Pattern: "EQCSS_{element-query-index}_{nth-element-matching-this-query}"
      element_guid = "EQCSS_" + i + "_" + j;
      
      // Add this guid as an attribute to the element 
      elements[j].setAttribute(element_guid, element_guid);
      
      // Create a guid for the parent of this element
      // Pattern: "EQCSS_{element-query-index}_{nth-element-matching-this-query}_parent"
      element_guid_parent = "EQCSS_" + i + "_" + j + "_parent";
      
      // Add this guid as an attribute to the element's parent (except if element is the root element)
      if(elements[j] != document.documentElement){
        elements[j].parentNode.setAttribute(element_guid_parent, element_guid_parent);
      }
      
      // Get the CSS block to this element (or create one in the <HEAD> if it doesn't exist)
      css_block = document.querySelector("#" + element_guid);
      if(!css_block){
        css_block = document.createElement("STYLE");
        css_block.id = element_guid;
        document.querySelector("head").appendChild(css_block);
      }
      css_block = document.querySelector("#" + element_guid);
      
      // Reset the query test's result (first, we assume that the selector is matched)
      test = true;
      
      // Loop on the conditions
      test_conditions: for(k = 0; k < EQCSS.conditions[i].length; k++){
        
        // Reuse element and parent's computed style instead of computing it everywhere 
        computed_style = window.getComputedStyle(elements[j], null);
        
        if(elements[j] != document.documentElement){
          parent_computed_style = window.getComputedStyle(elements[j].parentNode, null);
        }
        
        else{
          parent_computed_style = null;
        }
        
        // Check each condition for this query and this element
        // If at least one condition is false, the element selector is not matched
        switch(EQCSS.conditions[i][k].measure){
        
          // Min-width 
          case "min-width":
          
            // Min-width in px
            if(EQCSS.conditions[i][k].value.indexOf("px") != -1){
              element_width = parseInt(computed_style.getPropertyValue("width"));
              if(!(element_width >= parseInt(EQCSS.conditions[i][k].value))){
                test = false;
                break test_conditions;
              }
            }
          
            // Min-width in %
            if(EQCSS.conditions[i][k].value.indexOf("%") != -1){
              element_width = parseInt(computed_style.getPropertyValue("width"));
              parent_width = parseInt(parent_computed_style.getPropertyValue("width"));
              if(!(parent_width / element_width <= 100 / parseInt(EQCSS.conditions[i][k].value))){
                test = false;
                break test_conditions;
              }
            }
            
          break;
          
          // Max-width
          case "max-width":
          
            // Max-width in px
            if(EQCSS.conditions[i][k].value.indexOf("px") != -1){
              element_width = parseInt(computed_style.getPropertyValue("width"));
              if(!(element_width <= parseInt(EQCSS.conditions[i][k].value))){
                test = false;
                break test_conditions;
              }
            }
          
            // Max-width in %
            if(EQCSS.conditions[i][k].value.indexOf("%") != -1){
              element_width = parseInt(computed_style.getPropertyValue("width"));
              parent_width = parseInt(parent_computed_style.getPropertyValue("width"));
              if(!(parent_width / element_width >= 100 / parseInt(EQCSS.conditions[i][k].value))){
                test = false;
                break test_conditions;
              }
            }
          
          break;
          
          // Min-height 
          case "min-height":
          
            // Min-height in px
            if(EQCSS.conditions[i][k].value.indexOf("px") != -1){
              element_width = parseInt(computed_style.getPropertyValue("height"));
              if(!(element_width >= parseInt(EQCSS.conditions[i][k].value))){
                test = false;
                break test_conditions;
              }
            }
          
            // Min-height in %
            if(EQCSS.conditions[i][k].value.indexOf("%") != -1){
              element_width = parseInt(computed_style.getPropertyValue("height"));
              parent_width = parseInt(parent_computed_style.getPropertyValue("height"));
              if(!(parent_width / element_width <= 100 / parseInt(EQCSS.conditions[i][k].value))){
                test = false;
                break test_conditions;
              }
            }
            
          break;
          
          // Max-height
          case "max-height":
          
            // Max-height in px
            if(EQCSS.conditions[i][k].value.indexOf("px") != -1){
              element_height = parseInt(computed_style.getPropertyValue("height"));
              if(!(element_height <= parseInt(EQCSS.conditions[i][k].value))){
                test = false;
                break test_conditions;
              }
            }
          
            // Max-height in %
            if(EQCSS.conditions[i][k].value.indexOf("%") != -1){
              element_height = parseInt(computed_style.getPropertyValue("height"));
              parent_height = parseInt(parent_computed_style.getPropertyValue("height"));
              if(!(parent_height / element_height >= 100 / parseInt(EQCSS.conditions[i][k].value))){
                test = false;
                break test_conditions;
              }
            }
          
          break;
          
          // Min-characters 
          case "min-characters":
          
            // form inputs
            if(elements[j].value){
              if(!(elements[j].value.length >= parseInt(EQCSS.conditions[i][k].value))){
                test = false;
                break test_conditions;
              }
            }
            
            // blocks
            else{
            
              if(!(elements[j].textContent.length >= parseInt(EQCSS.conditions[i][k].value))){
                test = false;
                break test_conditions;
              }
            
            }
            
          break;
          
          // Max-characters
          case "max-characters":
            
            // form inputs
            if(elements[j].value){
              if(!(elements[j].value.length <= parseInt(EQCSS.conditions[i][k].value))){
                test = false;
                break test_conditions;
              }
            }
            
            // blocks
            else{
            
              if(!(elements[j].textContent.length <= parseInt(EQCSS.conditions[i][k].value))){
                test = false;
                break test_conditions;
              }
            
            }
          
          break;
          
          
          // Min-children 
          case "min-children":
          
            if(!(elements[j].children.length >= parseInt(EQCSS.conditions[i][k].value))){
              test = false;
              break test_conditions;
            }
            
          break;
          
          // Max-children
          case "max-children":
          
            if(!(elements[j].children.length <= parseInt(EQCSS.conditions[i][k].value))){
              test = false;
              break test_conditions;
            }
          
          break;
          
          
          
          // Min-lines 
          case "min-lines":

            element_height = 
              parseInt(computed_style.getPropertyValue("height"))
              - parseInt(computed_style.getPropertyValue("border-top-width"))
              - parseInt(computed_style.getPropertyValue("border-bottom-width"))
              - parseInt(computed_style.getPropertyValue("padding-top"))
              - parseInt(computed_style.getPropertyValue("padding-bottom"))
            
            element_line_height = parseInt(computed_style.getPropertyValue("line-height"));
              
            if(!(element_height / element_line_height >= parseInt(EQCSS.conditions[i][k].value))){
              test = false;
              break test_conditions;
            }
            
          break;
          
          // Max-lines
          case "max-lines":
          
            element_height = 
              parseInt(computed_style.getPropertyValue("height"))
              - parseInt(computed_style.getPropertyValue("border-top-width"))
              - parseInt(computed_style.getPropertyValue("border-bottom-width"))
              - parseInt(computed_style.getPropertyValue("padding-top"))
              - parseInt(computed_style.getPropertyValue("padding-bottom"))

            element_line_height = parseInt(computed_style.getPropertyValue("line-height"));
              
            if(!(element_height / element_line_height + 1 <= parseInt(EQCSS.conditions[i][k].value))){
              test = false;
              break test_conditions;
            }
          
          break;

        }
      }
      

      // Update CSS block:
      // If all conditions are met: copy the CSS code from the query to the corresponding CSS block
      if(test === true){

        // Get the CSS code to apply to the element
        css_code = EQCSS.styles[i];
        
        // Replace "$this" with "[element_guid]"
        css_code = css_code.replace(/\$this/g, "[" + element_guid + "]");
        
        // Replace "$parent" with "[element_guid_parent]"
        css_code = css_code.replace(/\$parent/g, "[" + element_guid_parent + "]");
        
        // Replace "$root" with html
        css_code = css_code.replace(/\$root/g, "html");
        
        // good browsers
        try {
          css_block.innerHTML = css_code;
        }
        
        // IE8
        catch(e){
          css_block.styleSheet.cssText = css_code;
        }
      }
      
      // If condition is not met: empty the CSS block
      else {
        
        // Good browsers
        try{
          css_block.innerHTML = "";
        }
        
        // IE8
        catch(e){
          css_block.styleSheet.cssText = "";
        }
      }
    }
  }
}

/*
 * "DOM Ready" cross-browser polyfill / Diego Perini / MIT license
 * Forked from: https://github.com/dperini/ContentLoaded/blob/master/src/contentloaded.js
 */
function domready(fn) {

	var done = false, top = true,

	doc = window.document,
	root = doc.documentElement,
	modern = !~navigator.userAgent.indexOf("MSIE 8"),

	add = modern ? 'addEventListener' : 'attachEvent',
	rem = modern ? 'removeEventListener' : 'detachEvent',
	pre = modern ? '' : 'on',

	init = function(e) {
		if (e.type == 'readystatechange' && doc.readyState != 'complete') return;
		(e.type == 'load' ? window : doc)[rem](pre + e.type, init, false);
		if (!done && (done = true)) fn.call(window, e.type || e);
	},

	poll = function() {
		try { root.doScroll('left'); } catch(e) { setTimeout(poll, 50); return; }
		init('poll');
	};

	if (doc.readyState == 'complete') fn.call(window, 'lazy');
	else {
		if (!modern && root.doScroll) {
			try { top = !window.frameElement; } catch(e) { }
			if (top) poll();
		}
		doc[add](pre + 'DOMContentLoaded', init, false);
		doc[add](pre + 'readystatechange', init, false);
		window[add](pre + 'load', init, false);
	}
}

// Call load and apply on page load
domready(function(){
  EQCSS.load();
  EQCSS.apply();
});

// Call apply on resize
window.addEventListener("resize", function(){
  EQCSS.apply();
});

// Debug: here's a shortcut for console.log
// function l(a){console.log(a)}