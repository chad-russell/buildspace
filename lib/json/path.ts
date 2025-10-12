// JSON path helpers for immutable operations using dot-paths

export type JsonPath = Array<string | number>;

export function pathToString(path: JsonPath): string {
  return path
    .map((seg) => (typeof seg === "number" ? `[${seg}]` : `${seg}`))
    .join(".");
}

export function stringToPath(dotPath: string): JsonPath {
  if (!dotPath) return [];
  // Supports simple dot paths and [index] for arrays
  const parts: JsonPath = [];
  const tokens = dotPath.split(".");
  for (const token of tokens) {
    const re = /(\w+)?(\[[0-9]+\])*/g;
    const matches = token.matchAll(re);
    for (const m of matches) {
      if (!m[0]) continue;
      if (m[1]) parts.push(m[1]);
      const bracket = m[0].slice(m[1]?.length || 0);
      if (bracket) {
        const idxMatches = bracket.matchAll(/\[([0-9]+)\]/g);
        for (const im of idxMatches) parts.push(parseInt(im[1], 10));
      }
    }
  }
  return parts;
}

export function getAtPath<T = any>(root: any, path: JsonPath): T | undefined {
  let cur = root;
  for (const seg of path) {
    if (cur == null) return undefined;
    cur = cur[seg as any];
  }
  return cur as T;
}

export function setAtPath(root: any, path: JsonPath, value: any) {
  if (path.length === 0) return value;
  const clone = Array.isArray(root) ? [...root] : { ...root };
  let cur: any = clone;
  for (let i = 0; i < path.length - 1; i++) {
    const seg = path[i];
    const next = cur[seg as any];
    const newChild = Array.isArray(next) ? [...next] : { ...(next ?? {}) };
    cur[seg as any] = newChild;
    cur = newChild;
  }
  cur[path[path.length - 1] as any] = value;
  return clone;
}

export function removeAtPath(root: any, path: JsonPath) {
  if (path.length === 0) return undefined;
  const clone = Array.isArray(root) ? [...root] : { ...root };
  let cur: any = clone;
  for (let i = 0; i < path.length - 1; i++) {
    const seg = path[i];
    const next = cur[seg as any];
    const newChild = Array.isArray(next) ? [...next] : { ...(next ?? {}) };
    cur[seg as any] = newChild;
    cur = newChild;
  }
  const last = path[path.length - 1];
  if (Array.isArray(cur) && typeof last === "number") {
    cur.splice(last, 1);
  } else {
    delete cur[last as any];
  }
  return clone;
}

export function renameKeyAtPath(root: any, parentPath: JsonPath, oldKey: string, newKey: string) {
  const parent = getAtPath<any>(root, parentPath) ?? {};
  if (Array.isArray(parent)) return root; // not supported
  if (oldKey === newKey) return root;
  const nextParent: any = { ...parent };
  if (oldKey in nextParent) {
    const val = nextParent[oldKey];
    delete nextParent[oldKey];
    nextParent[newKey] = val;
  }
  return setAtPath(root, parentPath, nextParent);
}

export function insertIntoArrayAtPath(root: any, path: JsonPath, index: number, value: any) {
  const arr = getAtPath<any[]>(root, path) ?? [];
  const next = [...arr];
  next.splice(index, 0, value);
  return setAtPath(root, path, next);
}

export function isObjectLike(value: any): value is Record<string, any> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

export function isPrimitive(value: any): boolean {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

// Reference helpers used by Data node expressions
import type { JsonPathRef } from "@/lib/types/dataflow"

export function isRef(v: any): v is { $ref: JsonPathRef } {
  return v && typeof v === "object" && Array.isArray((v as any).$ref)
}

export function resolveRef(context: Map<string, any>, ref: JsonPathRef): any {
  const [first, ...rest] = ref
  const root = context.get(first.id)
  return getAtPath(root, rest as any)
}
