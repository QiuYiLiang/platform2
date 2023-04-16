import React from "react";
import registry from "./registry";
import { arr2obj } from "./util";
import ReactDOM from "react-dom/client";

const viewType = "PC";

const createMethod = (element: any) => (type: string, fn: any) => {
  element.methodMap[type] = (...args: any[]) => {
    fn && fn(...args);
  };
};

const createEvent = (element: any) => (type: string) => {
  element.eventNames.push(type);
  const eventConfig = element.eventConfigMap[type];

  if (!eventConfig) return;

  element.eventMap[type] = () => {
    element.parentElement.runProgram(eventConfig.programId);
  };
};

const createView = (element: any) => (type: string, asyncComp: any) => {
  element.viewMap[type] = React.lazy(asyncComp);
};

const createRender = (element: any) => () => {
  const Comp = element.viewMap[viewType];
  return <Comp element={element} />;
};

const createTrigger = (element: any) => async (eventName: string) => {
  const event = element.eventMap[eventName];
  if (!event) return;
  return await event();
};

function createCall(element: any) {
  return async (methodName: string, args: any[]) => {
    const method = element.methodMap[methodName];
    if (!method) return;
    return await method(...args);
  };
}

async function runCode(context: any, code: string) {
  const argNames = Object.keys(context);
  const argValues = Object.values(context);
  const fn = new Function(...argNames, code);
  return await fn(...argValues);
}

function createRunProgram(element: any) {
  return async (programId: string) => {
    const program = element.programMap[programId];
    if (!program) return;
    const value = program.value;
    for (const item of value) {
      switch (item.type) {
        case "method":
          const childElement = await element.getChildElement(item.id);
          if (!childElement) return;
          await childElement.call(item.methodName, item.args);
        case "code":
          await runCode(
            {
              element,
            },
            item.code
          );
      }
    }
  };
}

function createPlatformElementRender(element: any) {
  return () => {
    const [renders, setRenders] = React.useState<any>([]);
    React.useEffect(() => {
      Promise.all(
        element.elementOptionsList.map(async ({ id }: any) => {
          const childElement = await element.getChildElement(id);
          return childElement && <childElement.Render key={id} />;
        })
      ).then((renders: any) => {
        setRenders(renders);
      });
    }, []);

    return renders;
  };
}

function createMount(element: any) {
  return (el: HTMLElement) => {
    ReactDOM.createRoot(el).render(
      <React.StrictMode>{element && <element.Render />}</React.StrictMode>
    );
  };
}

async function createPlatformElement(options: any) {
  const define = await registry.getDefine(options);
  const element: any = {
    elementOptionsList: define.elements,
    elementOptionsMap: arr2obj(define.elements),
    programMap: arr2obj(define.programs),
    cacheChildElements: [],
    cacheChildElementMap: [],
  };
  element.getChildElement = async (id: string) => {
    let childElement = element.cacheChildElementMap[id];
    if (!childElement) {
      childElement = await createElement({
        ...element.elementOptionsMap[id],
        parentElement: element,
      });
      element.cacheChildElements.push(childElement);
      element.cacheChildElementMap[id] = childElement;
    }
    return childElement;
  };
  element.runProgram = createRunProgram(element);
  element.Render = createPlatformElementRender(element);
  element.mount = createMount(element);
  return element;
}

async function createReactElement(options: any) {
  const element: any = {
    type: options.type,
    id: options.id,
    config: options.config,
    eventConfigMap: arr2obj(options.event, "type"),
    parentElement: options.parentElement,
    methodMap: {},
    eventNames: [],
    eventMap: {},
    viewMap: {},
  };

  element.method = createMethod(element);
  element.event = createEvent(element);
  element.view = createView(element);
  const define = (await registry.getDefine(options)) as any;
  if (!define) return null;
  define(element);
  element.Render = createRender(element);
  element.trigger = createTrigger(element);
  element.call = createCall(element);
  return element;
}

export async function createElement(options: any) {
  await registry.sync([options]);
  switch (options.render) {
    case "platform":
      return await createPlatformElement(options);
    case "react":
      return await createReactElement(options);
  }
}
