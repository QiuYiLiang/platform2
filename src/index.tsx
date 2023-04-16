import { createElement } from "./runtime";

createElement({
  render: "platform",
  group: "my",
  type: "自定义元素B",
  id: "自定义元素B1",
  config: {},
  event: [],
}).then((element) => {
  element.mount(document.getElementById("app") as HTMLElement);
});
