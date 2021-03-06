# EQCSS - Element Queries for CSS

## What are Element Queries?

Element queries are a new way of thinking about responsive web design in CSS where the responsive conditions apply to individual elements on the page instead of the width or height of the browser.

Unlike CSS `@media` queries, element Queries can be based on more than just the width or height of the browser as well, you can change styles in a number of different situations, like how many lines of text or child elements an element contains.

Another concept that element queries brings to CSS is the idea of 'scoping' your styles to one element in the same way that JavaScript functions define a new scope for the variables they contain.

## How to use EQCSS

EQCSS is a JavaScript plugin that lets you write element queries inside CSS today. With performance in mind, this plugin is written in pure JavaScript, so it doesn't require jQuery or any other libraries on your page in order to function - add EQCSS.js to you HTML and you're ready to get started!

#### [Download EQCSS Zip](archive/gh-pages.zip)

    git clone https://github.com/eqcss/eqcss/archive/gh-pages.zip

Once you have downloaded a copy of EQCSS you will need to add it to every HTML page where you will be using element queries. It's best to add a `<script>` after your content, before the end of your `<body>` tag.

    <script src=EQCSS.js></script>


If you need to support IE8 there is an optional polyfill available that adds `@media` queries and `@element` queries to IE8. Add this file to your HTML before where you added EQCSS:

    <!--[if lt IE 9]><script src="EQCSS-polyfills.js"></script><![endif]-->

## Writing Element Queries

Now that you have EQCSS added to your HTML you're ready to write element queries. There are two ways you can add EQCSS to your site: the easiest way is by writing them inside your CSS either in a `<style>` or `<link>` in your HTML, or by isolating your EQCSS styles in a custom script type.

You can also link to EQCSS hosted in external files with either `.css` or `.eqcss` extensions.

## Using the EQCSS script type

While not necessary, if you choose to isolate your EQCSS from your CSS you can store it in external `.eqcss` files and link them using a `<script>` tag like this:

    <script type=text/eqcss src=styles.eqcss></script>

And you can include EQCSS scripts inline in your page like this as well:

    <script type=text/eqcss>
    
      /* EQCSS goes here */
    
    </script>

## Running EQCSS

By default the plugin execute once when the content loads, and also whenever it detects browser resize (similar to `@media` queries). The `EQCSS.apply()` function can be called manually on other events too, like keyup or clicks, or even when specific elements are interacted with.

## Designing with Element Queries

Element Queries have the following format:

    @element {selector} and {condition} [ and {condition} ]* { {css} }

- `{selector}` is a CSS selector targeting one or many elements. Ex: `"#id"` or `".class"`
- `{condition}` is composed of a measure and a value.
- `{css}` can contain: Any valid CSS rule. (Ex: `#id div { color: red }`)

## Special Conditions

### Weight Queries

- min-width in `px`
- min-width in `%`
- max-width in `px`
- max-width in `%`

### Height Queries

- min-height in `px`
- min-height in `%`
- max-height in `px`
- max-height in `%`

### Count Queries

- min-characters
- max-characters
- min-lines
- max-lines
- min-children
- max-children

## Special Selectors

- `$this`
- `$parent`
- `$root`

### Demos @ the EQCSS Website: [http://elementqueries.com](http://elementqueries.com)