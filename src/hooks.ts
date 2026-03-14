import { useContext, getOwner, runWithOwner, type Context } from "solid-js"

import { onActivatedOnce } from "./aliveActive"

import { createStore } from "solid-js/store"

/**
 * @description 子路由组件级获取父路由组件的 context
 * @example
 * ```
 * import UserContext from 'xxx'
 * const data = useAliveContext(UserContext)
 * ```
 */
export const useAliveContext = <T>(context: Context<T>): T => {
  const [data, setData] = createStore<any>()

  onActivatedOnce(() => {
    runWithOwner(getOwner(), () => {
      setData(useContext(context))
    })
  })
  return data
}
