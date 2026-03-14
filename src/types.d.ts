import type { JSXElement, Accessor, Owner } from "solid-js"
import type { SetStoreFunction } from "solid-js/store"
import type { RouteSectionProps } from "@solidjs/router"

export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

export type AliveProviderProps = {
  /** 子组件 */
  children: JSXElement
  /** 缓存的路由, 如 include:['home','about'] */
  include?: Array<string>
}

/** 缓存的数据 */
export type Cache = Expand<{
  /** 唯一值 */
  id: string
  /** 没有在 include 中的路由 */
  noCache?: boolean
  /** 表明dom加载过了 */
  hasEl?: boolean
  /** 是否有加载过,  */
  init?: boolean
  /** 其子数据 */
  childIds?: Set<string>
  /** 父级 */
  parentId?: string | null
  /** JSX */
  component?: JSXElement
  /** 上下文 */
  owner: Owner | null
  /** 销毁函数 */
  dispose?: () => void
  /** 只执行一次的 active, 会在页面加载时执行, */
  aOnceSet?: Set<() => void>
  /** 激活 */
  aSet?: Set<() => void>
  /** 离开 */
  dSet?: Set<() => void>
}>

/** 所有缓存数据 */
export type Caches = Record<string, Cache>

/** 共享数据 */
export type ContextProps = Expand<{
  /** 当前正在展示的 所有id */
  currentIds: Set<string>
  /** 需要缓存的组件 id */
  include: Accessor<Set<string>>
  /** 数据 */
  caches: Record<string, Cache>
  /** 加 缓存 */
  setCaches: SetStoreFunction<Caches>
  /** 缓存回调函数 */
  setActive: (id: string, t: Activate, cb: () => void, t1: SetType) => void
  /** 开关 */
}>

export type Activate = "aSet" | "dSet" | "aOnceSet"
export type MapType = "set" | "delete"
export type SetType = "add" | "delete"
