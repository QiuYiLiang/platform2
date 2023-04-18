import { get, set } from "./util";

const registryData = [
  {
    render: "react",
    group: "system",
    type: "按钮",
    url: "http://127.0.0.1:3001/react/comp2/index.js",
  },
  {
    render: "platform",
    group: "my",
    type: "自定义元素A",
    methods: [
      {
        type: "点击",
        programId: "按钮1-点击",
      },
    ],
    programs: [
      {
        id: "按钮1-点击",
        value: [
          {
            type: "method",
            id: "按钮1",
            methodName: "弹出",
            args: [],
          },
          { type: "code", code: "console.log(1)" },
        ],
      },
    ],
    elements: [
      {
        render: "react",
        group: "system",
        type: "按钮",
        id: "按钮1",
        config: {
          children: "按钮1",
        },
        event: [
          {
            type: "点击",
            programId: "按钮1-点击",
          },
        ],
      },
    ],
  },
  {
    render: "platform",
    group: "my",
    type: "自定义元素B",
    methods: [
      {
        type: "点击",
        programId: "按钮2-点击",
      },
    ],
    programs: [
      {
        id: "按钮2-点击",
        value: [
          {
            type: "method",
            id: "按钮2",
            methodName: "弹出",
            args: [],
          },
          { type: "code", code: `console.log("code按钮2点击")` },
        ],
      },
    ],
    elements: [
      {
        render: "react",
        group: "system",
        type: "按钮",
        id: "按钮2",
        config: {
          children: "按钮2",
        },
        event: [
          {
            type: "点击",
            programId: "按钮2-点击",
          },
        ],
      },
      {
        render: "platform",
        group: "my",
        type: "自定义元素A",
        id: "自定义元素A1",
        config: {
          children: "按钮3",
        },
        event: [
          {
            type: "点击",
            programId: "按钮1-点击",
          },
        ],
      },
    ],
  },
];

const request = async (path: string, { elements }: any) => {
  const cache = elements.reduce((ret: any, { render, group, type }: any) => {
    ret[JSON.stringify([render, group, type])] = true;
    return ret;
  }, {});
  return registryData.filter(({ render, group, type }: any) => {
    return cache[JSON.stringify([render, group, type])];
  });
};

const createRegistry = () => {
  const registry: any = {
    data: {},
  };
  registry.sync = async (elements: any[]) => {
    const neetElements = elements
      .filter(
        ({ render, group, type }) => !get(registry.data, [render, group, type])
      )
      .map(({ render, group, type }) => ({ render, group, type }));

    const data = await request("", {
      elements: neetElements,
    });

    data.forEach((element: any) => {
      set(
        registry.data,
        [element.render, element.group, element.type],
        element
      );
    });
  };
  registry.getDefine = async ({ render, group, type }: any) => {
    const defineData = get(registry.data, [render, group, type]);
    switch (defineData.render) {
      case "platform":
        return defineData;
      case "react":
        return await new Promise((reslove, reject) => {
          require([defineData.url], reslove, reject);
        });
    }
  };

  return registry;
};

const registry = createRegistry();

export default registry;
