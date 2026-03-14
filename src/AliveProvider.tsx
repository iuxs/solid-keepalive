import { createStore, produce } from "solid-js/store"
import { createMemo, runWithOwner } from "solid-js"
import { Context } from "./context"

import type { AliveProviderProps, Activate, Caches, SetType } from "./types"

/** 
 * @description 容器
 * @param {JSXElement} children 
 * @param {Array<string>} [include] ['home','about']
 * @example
 * ```jsx
 *  <AliveProvider  include={['home','about']} >
      <Router root={Contain} children={routes} />
    </AliveProvider>
 * ```
 * */
export default function (props: AliveProviderProps) {
  const [caches, setCaches] = createStore<Caches>({})
  const setActive = (id: string, t: Activate, cb: () => void, t1: SetType) => {
    if (
      t === "aOnceSet" &&
      t1 === "add" &&
      caches[id].init &&
      caches[id].hasEl
    ) {
      runWithOwner(caches[id].owner, cb)
      return
    }
    setCaches(
      produce((data: Caches) => {
        data[id][t]
          ? data[id][t][t1](cb)
          : t1 === "add" && (data[id][t] = new Set([cb]))
      }),
    )
  }

  const removeCaches = (ids: Set<string> | Array<string>) =>
    setCaches(
      produce((data: Caches) => {
        const remove = (ss: Set<string> | Array<string>) => {
          for (const s of ss) {
            if (!data[s]) continue
            data[s].parentId && data[data[s].parentId]?.childIds?.delete(s)
            data[s].hasEl = false
            if (!data[s].init || data[s].noCache) {
              data[s].dispose?.()
              delete data[s]
            }
          }
        }
        remove(ids)
      }),
    )

  const include = createMemo<Set<string>>((prev) => {
    if (!Array.isArray(props.include)) return new Set([])
    if (prev && prev.size) {
      for (const id of props.include) {
        prev.delete(id)
      }
      prev.size && removeCaches(prev)
    }
    return new Set(props.include)
  })

  return (
    <Context.Provider
      value={{
        caches,
        include,
        currentIds: new Set(),
        setCaches,
        setActive,
      }}
    >
      {props.children}
    </Context.Provider>
  )
}
