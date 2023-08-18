const components = {};
const vdom = {};

document.addEventListener("DOMContentLoaded", function (event) {
  //the function which starts it all
  const template = document.createElement("template");
  template.id = "render";

  const getNodes = (t, path) => path.split(".").reduce((r, k) => r[k], t);

  /**
   * @param {HTMLElement} node
   * @param {string} name
   */
  function load(node, name) {
    if (node.nodeName == "#text") {
      template.content.appendChild(node.cloneNode(true));
    } else if (node.nodeName === "SCRIPT") {
      node.innerHTML = `(() => {const _ = "${name}";
       function state(original) {
         components[_].defaultState = original;
       }
       function events(events) {
         components[_].events = events;
       };
       function computed(computed) {
         components[_].computed = computed;
       };
       ${node.innerHTML}})()`;
      const body = document.querySelector("body");
      body.appendChild(node);
    } else {
      template.content.appendChild(node.cloneNode(true));
    }
  }

  //1. Load all the components into the components object and remove them from the DOM
  for (const c of $("template")) {
    const component = $(c);
    if (component.attr("id") != undefined) {
      const name = component.attr("id");

      if (components[name] == undefined) {
        components[name] = {
          defaultState: {},
          events: {},
        };
      } else {
        console.error("Component already exists, skipping...");
      }

      for (const node of component.contents().children().prevObject) {
        load(node, name);
      }
      component.remove();
      components[name].template = template.innerHTML;

      //Fix this later
      //components[name].props = component.attr("r-props").split(",");
    } else {
      console.error("Component does not have a name, skipping...");
    }
  }
  roots.map(({ rootId, rootElement }) => {
   
    if (components[rootId] != undefined) {
      /**
       * @param {Array<HTMLElement>} elements
       * @param {Array<any>} elementValue
       */
      function applyValues(elements, elementValuePassed) {
        for (const element of elements) {
          let elementValue = elementValuePassed;
          const nodes = element.getAttribute("r-nodes");
          if (nodes != undefined) {
            const valueNode = getNodes(elementValue, nodes);

            if (valueNode != undefined) {
              elementValue = valueNode;
            } else {
              console.error(
                `Could not find node ${nodes} in ${JSON.stringify(
                  elementValue
                )} for values`
              );
            }
          }

          if (element.getAttribute("type") == "checkbox") {
            //console.log("It's a checkbox");
            const currentValue = element.checked;
            if (currentValue != elementValue) element.checked = elementValue;
          } else {
            const currentValue = element.value;
            if (currentValue != elementValue) element.value = elementValue;
          }
        }
      }

      function applyVars(elements, elementValuePassed) {
        for (const element of elements) {
          let elementValue = elementValuePassed;
          const nodes = element.getAttribute("r-nodes");

          if (nodes != undefined) {
            const valueNode = getNodes(elementValue, nodes);

            if (valueNode != undefined) {
              elementValue = valueNode;
            } else {
              console.error(
                `Could not find node ${nodes} in ${JSON.stringify(
                  elementValue
                )} in vars`
              );
            }
          }
          //Check if the value is an object
          if (typeof elementValue === "object") {
            //The value to be updated
            elementValue = JSON.stringify(elementValue);
            //Check if the same value is already in the DOM
            if (element.innerHTML != elementValue) {
              //If not then update it
              element.innerHTML = elementValue;
            }
          } else {
            //Check if the same value is already in the DOM
            if (element.innerHTML != elementValue) {
              element.innerHTML = elementValue;
            }
          }
        }
      }

      function applyIf(elements, elementValuePassed, id, component) {
        for (const element of elements) {
          let elementValue = elementValuePassed;
          const nodes = element.getAttribute("r-nodes");

          if (nodes != undefined) {
            const valueNode = getNodes(elementValue, nodes);

            if (valueNode != null) {
              elementValue = valueNode;
            }
          }
          const template = element.querySelector("template");

          if (element.getAttribute("r-not")) {
            elementValue = !elementValue;
          }
          if (elementValue) {
            if (element.children.length == 1) {
              const clone = template.content.cloneNode(true);
              element.appendChild(clone);

              renderChildren(id, component, element);
            }
          } else {
            while (element.children.length > 1) {
              element.removeChild(element.lastChild);
            }
          }
        }
      }

      function updateState(id, component, newState) {
        vdom[id].state = newState;
        const values = Object.keys(newState);
        for (const value of values) {
          const elements = document.querySelectorAll(
            `[r-var='${id + "@" + value}']`
          );
          //List of elements to be updated
          applyVars(elements, newState[value]);

          //Values for data states
          //TODO: Support computed values
          const values = document.querySelectorAll(`[r-value='${id + value}']`);
          applyValues(values, newState[value]);

          //TODO: Fixed disabled
          const disabled = document.querySelectorAll(
            `[r-disabled='${id + value}']`
          );
          for (const element of disabled) {
            element.disabled = newState[value];
          }

          //Get all of the states for the for loops
          const forStates = document.querySelectorAll(
            `[r-loop='${id + "@" + value}']`
          );

          /**
           * @param {Array} items
           * @param {Array<HTMLElement>} elements
           */
          function looping(items, elements) {
            for (const parent of elements) {
              //Get the template of the parent
              const template = parent.querySelector("template");

              //check if item is an array
              if (Array.isArray(items)) {
                //if it is then loop through it

                items.forEach(
                  /**
                   * @param {HTMLElement} item
                   */
                  (item, index) => {
                    //Clone the template
                    const clone = template.content.cloneNode(true);

                    //Get the key of the parent
                    const parentValueKey = parent.getAttribute("r-value");

                    //Check if the item already exists
                    const existingItem = parent.querySelector(
                      `[r-key='${parentValueKey + index}']`
                    );

                    //If it does then update it
                    if (existingItem != null) {
                      //Get the variables and values
                      const existingVariables = existingItem.querySelectorAll(
                        `[r-var='$${parentValueKey}']`
                      );

                      const existingValues = existingItem.querySelectorAll(
                        `[r-value='$${parentValueKey}']`
                      );

                      const ifStates = existingItem.querySelectorAll(
                        `[r-cif='${id}$${parentValueKey}']`
                      );

                      //Update the variables and values
                      applyVars(existingVariables, item);
                      applyValues(existingValues, item);

                      //Support if statements
                      applyIf(ifStates, item, id, component);
                      forTemp(existingItem, parentValueKey, item);
                      return;
                    }

                    //Create the existing item
                    if (clone.children.length == 1) {
                      clone.children[0].setAttribute(
                        "r-key",
                        parentValueKey + index
                      );

                      //Set the index of the item
                      clone.children[0].setAttribute("r-index", index);

                      //Append the item to the parent
                      parent.appendChild(clone);

                      //Render the children
                      renderChildren(id, component, parent.children[index + 1]);
                    }
                  }
                );

                //Remove the extra items if there are any left over from the previous render cycle
                while (parent.children.length - 1 > items.length) {
                  parent.children[parent.children.length - 1].remove();
                }
              }
            }
          }

          /**
           * @param {HTMLElement} parentLoop
           * @param {string} parentValueKey
           * @param {Array} items
           */
          function forTemp(parentLoop, parentValueKey, items) {
            const loops = parentLoop.querySelectorAll(
              `[r-loop='${id + "$" + parentValueKey}']`
            );
            looping(items, loops);
          }
          const items = newState[value];
          looping(items, forStates);

          //Support if statements
          const ifStates = document.querySelectorAll(
            `[r-cif='${id + "@" + value}']`
          );

          applyIf(ifStates, newState[value], id, component);
        }

        //Support computed values
        const computed = components[component].computed;
        if (computed != undefined) {
          const computedValues = Object.keys(computed);
          for (const value of computedValues) {
            const ifComputed = document.querySelectorAll(
              `[r-cif='${id + "#" + value}']`
            );

            let state = components[component].computed[value]({
              state: newState,
              props: components[component].props,
            });

            applyIf(ifComputed, state, id, component);
          }
        }
      }

      function renderComponent(id, component, root) {
        //copy default state into vdom

        root.innerHTML = components[component].template;

        vdom[id] = {
          state: {},
          temp: {},
        };
        vdom[id].state = {
          ...components[component].defaultState({}),
        };
        renderChildren(id, component, root);
      }

      function renderChildren(id, component, root) {
        const children = root.childNodes;

        let total = 0;
        for (const child of children) {
          if (child.nodeName == "#text" || child.nodeName == "#comment") {
            continue;
          } else {
            //TODO: Make it reusable
            if (child.nodeName === "SPAN") {
              const node = $(child);
              let refValue = node.attr("r-ref");

              if (refValue != undefined) {
                refValue = refValue.split(".");
                const value = refValue[0];
                const nodes = refValue.slice(1);

                if (vdom[id].state[value] != undefined) {
                  node.attr("r-var", id + "@" + value);
                }
                if (value.startsWith("$")) {
                  node.attr("r-var", value);
                }
                if (nodes.length > 0) {
                  node.attr("r-nodes", nodes.join("."));
                }
              }
            }
            //TODO: Make it reusable
            if (
              child.nodeName === "INPUT" ||
              child.nodeName === "TEXTAREA" ||
              child.nodeName === "SELECT" ||
              child.nodeName === "CHECKBOX" ||
              child.nodeName === "RADIO"
            ) {
              const node = $(child);
              const rValue = node.attr("r-value").split(".");

              const value = rValue[0];
              const nodes = rValue.slice(1);

              if (vdom[id].state[value] != undefined) {
                node.attr("r-value", id + value);

                if (nodes.length > 0) {
                  node.attr("r-nodes", nodes.join("."));
                }
              } else {
                if (value.startsWith("$")) {
                  node.attr("r-value", value);

                  if (nodes.length > 0) {
                    node.attr("r-nodes", nodes.join("."));
                  }
                } else {
                  console.error(`Invalid state '${value}'`);
                }
              }
            }

            //Check if its a div with an r-if or r-if-not
            if (child.nodeName == "DIV") {
              const node = $(child);
              let ifValue = node.attr("r-if");
              const ifValueNot = node.attr("r-if-not");
              if (ifValue != undefined || ifValueNot != undefined) {
                //Not condition
                let isNotCondition = false;
                if (ifValue == undefined && ifValueNot != undefined) {
                  ifValue = ifValueNot;
                  isNotCondition = true;
                }

                ifValue = ifValue.split(".");
                const value = ifValue[0];
                const nodes = ifValue.slice(1);

                let hasIf = false;
                if (value != undefined && vdom[id].state[value] != undefined) {
                  node.attr("r-cif", id + "@" + value);

                  hasIf = true;
                } else {
                  //Check if its a computed value
                  if (value != undefined && value.startsWith("#")) {
                    const computedValue = value.replace("#", "");
                    if (
                      components[component].computed[computedValue] != undefined
                    ) {
                      node.attr("r-cif", id + value);
                      hasIf = true;
                    } else {
                      console.error(`Invalid 'r-if' value '${computedValue}'`);
                    }
                  } else if (value != undefined && value.startsWith("$")) {
                    node.attr("r-cif", id + value);
                    hasIf = true;
                  }
                }
                //Do we have the state?
                if (hasIf) {
                  //Inverse the value if its a not condition
                  if (isNotCondition) {
                    node.attr("r-not", "true");
                  }
                  const nodeHTML = node[0].innerHTML;
                  //create a template to store for the moment
                  const template = document.createElement("template");
                  template.innerHTML = nodeHTML;
                  node[0].innerHTML = "";
                  //append the template to div
                  node[0].appendChild(template);
                }

                //Remove the attributes/properties
                if (nodes.length > 0) {
                  node.attr("r-nodes", nodes.join("."));
                }
              }
            }
            //Set events
            const events = child.attributes;

            //Check if its a for loop
            if (events != undefined) {
              for (const event of events) {
                if (event.name.startsWith("r-for")) {
                  const stateName = event.value;

                  //Check if its a computed value
                  let hasState = false;
                  if (stateName.startsWith("#")) {
                    const computedValue = stateName.replace("#", "");
                    const computedFunction =
                      components[component].computed[computedValue];
                    if (computedFunction != undefined) {
                      child.setAttribute("r-loop", id + stateName);
                      hasState = true;
                    }
                  } else if (stateName.startsWith("$")) {
                    child.setAttribute("r-loop", id + stateName);
                    hasState = true;
                  } else {
                    if (vdom[id].state[stateName] != undefined) {
                      child.setAttribute("r-loop", id + "@" + stateName);
                      hasState = true;
                    }
                  }
                  //Do we have the state?
                  if (!hasState) {
                    console.error(`Invalid 'r-for' value '${stateName}'`);
                  } else {
                    const itemTemplate = document.createElement("template");
                    itemTemplate.innerHTML = child.innerHTML;
                    child.innerHTML = "";
                    child.appendChild(itemTemplate);
                  }
                }
                if (event.name.startsWith("r-event-")) {
                  const eventName = event.name.replace("r-event-", "");

                  const node = $(child);
                  const parameters = node.attr("r-params");

                  if (parameters != undefined) {
                    const params = parameters.split(",");
                    let list = [];
                    for (const param of params) {
                      const paramValue = param.trim();
                      if (paramValue.startsWith("$")) {
                        list.push(paramValue);
                      } else if (paramValue.startsWith("#")) {
                        list.push(id + paramValue);
                      } else {
                        if (vdom[id].state[paramValue] != undefined) {
                          list.push(id + "@" + paramValue);
                        } else {
                          console.error(
                            `Invalid parameter '${paramValue}' on event '${eventName}' for component '${component}'`
                          );
                        }
                      }
                    }
                    node.attr("r-args", list.join(","));
                  }

                  const eventValue = event.value;
                  const eventFunction =
                    components[component].events[eventValue];
                  if (eventFunction != undefined) {
                    child.addEventListener(eventName, (e) => {
                      let argumentValues = [];
                      const parameters = child.getAttribute("r-args");
                      if (parameters != undefined) {
                        const args = parameters.split(",");

                        for (const arg of args) {
                          if (arg.startsWith("$")) {
                            const temp = arg.replace("$", "");
                            let currentComponentScope = id;
                            let currentLoopScope = temp;

                            let currentParent = child.offsetParent;

                            while (currentParent != document.body) {
                              if (currentParent) {
                                const key = currentParent.getAttribute("r-key");
                                const index =
                                  currentParent.getAttribute("r-index");
                                if (key != undefined && index != undefined) {
                                  const combinedKey = temp + index;

                                  //Update the loop to the next parent as it should be the for loop
                                  currentParent = currentParent.parentNode;
                                  const forLoop =
                                    currentParent.getAttribute("r-loop");

                                  const forValue =
                                    currentParent.getAttribute("r-value");

                                  if (forValue == temp) {
                                    if (forLoop.includes("@")) {
                                      const loopId = forLoop.split("@")[0];
                                      const loopState = forLoop.split("@")[1];
                                      const loopStateValue =
                                        vdom[loopId].state[loopState];
                                      if (loopStateValue[index] != undefined) {
                                        argumentValues.push(
                                          loopStateValue[index]
                                        );
                                        argumentValues.push(parseInt(index));
                                      } else {
                                        console.error(
                                          `Invalid index '${index}' for loop '${forLoop}'`
                                        );
                                      }
                                    } else {
                                      console.error(
                                        `Invalid loop '${forLoop}'`
                                      );
                                    }
                                  }
                                }
                              }

                              currentParent = currentParent.offsetParent;
                            }
                          }
                        }
                      }

                      eventFunction(
                        ...[
                          {
                            event: e,
                            state: vdom[id].state,
                            events: components[component].events,
                            setState: (newState) => {
                              updateState(id, component, newState);
                            },
                          },
                          ...argumentValues,
                        ]
                      );
                    });
                  } else {
                    console.debug(
                      `[richard.js] Event '${eventValue}'' not not found in '${id}'`
                    );
                  }
                }
              }
            }

            //Render children deeply
            if (child.hasChildNodes()) {
              renderChildren(id, component, child);
            }
          }
          total += 1;
        }
        updateState(id, component, vdom[id].state);
      }
      console.log(`rootId: ${rootId}`);
      renderComponent(rootId + "0", rootId, rootElement);
    } else {
      console.error(`${rootId} component was not found!`);
    }
  });
});

var roots = [];
function render(rootId, rootElement) {
  //2. Load the root component
  roots.push({ rootId, rootElement });
}
