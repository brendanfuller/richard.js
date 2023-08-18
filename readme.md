# Richard.js

~~Richard.js is blob of JavaScript that bloats your website.~~ The richest component framework™️.

## Features

- Double the size of [Preact](https://preactjs.com/) minified, at 7kb!
- Inspired by VueJS 4 Spatial API
- No styling
- Works offline!
- Has components!
- Has properties (not implemented currently)
- No compiler/tooling required, like how real developers do it.
- Actually means something:
  - **R**ich
  - **I**mportarnt
  - **C**omponent
  - **H**ousing
  - **A**ccelerating
  - **R**apid
  - **D**evelopment
- No richards were harmed in the making of this framework 🤞

# Example

A simple example of input state teleportation in the spatial dimension with richard. [Demo](https://richard.js.org/demo/input)

```html
<body>
  <template id="root">
    <div class="container">
      <br />
      <h1>Input Example via richard.js</h1>
      <br />
      <input
        placeholder="Name"
        class="form-control"
        name="name"
        r-event-input="setName"
        type="text"
        r-value="name"
      />
      <br />
      <!-- Name would be set here -->
      Your name is: <span r-ref="name" style="font-weight: bold"></span>
    </div>
    <script>
      state((props) => {
        return {
          name: "Richard",
        };
      });
      events({
        setName: ({ event, state, setState, props }) => {
          setState({
            ...state,
            name: event.target.value,
          });
        },
      });
      computed({
        name: ({ state, props }) => {
          return state.name;
        },
      });
    </script>
  </template>
  <!-- Load the root template into this -->
  <div id="app"></div>
</body>
```

## Using

- Make a HTML page
- Requires Jquery

```html
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
```

- Add a component to the page (like the demo example)
- Grab richard.js and add it to the bottom of the body.

```html
<script src="richard.js"></script>
<script>
  //This name should match the id in the template
  render("root", document.querySelector("#app"));
</script>
```

## Videos

- [richard.js in 100 seconds](https://www.youtube.com/watch?v=dQw4w9WgXcQ)

## Credits

[Brendan Fuller](https://twitter.com/ImportProgram)

## License

MIT
