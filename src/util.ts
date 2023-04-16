export function set(obj: object, path: string | string[], value: any) {
  const paths = typeof path === "string" ? path.split(".") : path;
  let target: any = obj;
  let currentKey;

  while ((currentKey = paths.shift())) {
    if (paths.length === 0) {
      target[currentKey] = value;
      return;
    }
    if (typeof target[currentKey] !== "object") {
      target = target[currentKey] = {};
    } else {
      target = target[currentKey];
    }
  }
}

export function get(obj: object, path: string | string[]) {
  const paths = typeof path === "string" ? path.split(".") : path;
  let target: any = obj;
  let currentKey;

  while ((currentKey = paths.shift())) {
    target = target[currentKey];
    if (!target) {
      return null;
    }
  }
  return target;
}

export function arr2obj(arr: any, key: string = "id") {
  return arr.reduce((ret: any, item: any) => {
    ret[item[key]] = item;
    return ret;
  }, {});
}
