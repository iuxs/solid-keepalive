import {
  createComponent,
  createRoot,
  onCleanup,
  runWithOwner,
  useContext,
  type JSXElement,
  createEffect,
  getOwner,
} from "solid-js"
import { ChildContext, Context } from "./context"
import { produce } from "solid-js/store"

/** 路由刷新 */
let routeRefresh = false

/**
 * @description 转换
 * @example
 * ```tsx
 *  import Home from 'xxx'
 *  const Home1 = aliveTransfer(Home, 'home')
 * ```
 * */
const aliveTransfer = <T extends Record<string, any>>(
  Component: (props: T) => JSXElement,
  id: string,
  params?: {
    /** 成一个独立缓存组件 */
    isolated?: boolean
  },
) => {
  params?.isolated || (routeRefresh = true)
  return function (props: T) {
    const ctx = useContext(Context)
    // 如果父路由缓存,而子路由没有缓存, 将会有问题
    if (!ctx || (!id && console.error(`[solid-keepalive]:id='${id}' error`)))
      return createComponent(Component, props)
    /** 父级的, 只在这里有,如果没有表示非 alive */
    const parentCtxId = useContext(ChildContext)?.id

    /**如果 当前组件是属于当前路由的 */
    const myRoute = () =>
      !parentCtxId || ctx.caches[id]?.parentId === parentCtxId

    /** 独立组件 */
    const isolated = params?.isolated
    if (ctx.caches[id]) {
      isolated || ctx.currentIds.add(id)
    } else {
      /** 当没有缓存时 */
      const parentId = isolated ? null : [...ctx.currentIds].at(-1)

      parentId &&
        ctx.caches[parentId] &&
        ctx.setCaches(
          produce((data) => {
            const _ = data[parentId]
            _.childIds ? _.childIds.add(id) : (_.childIds = new Set([id]))
          }),
        )

      isolated || ctx.currentIds.add(id)
      // 不是缓存数据
      const noCache = !ctx.include().has(id)
      ctx.setCaches({
        [id]: { id, parentId, ...(noCache && { noCache }) } as any,
      })
      createRoot((dispose) =>
        ctx.setCaches(
          produce((data) => {
            data[id].dispose = dispose
            data[id].owner = getOwner()
            data[id].component = (
              <ChildContext.Provider
                value={{ id, ...(noCache && { noCache }) }}
                children={createComponent(Component, props)}
              />
            )
          }),
        ),
      )
    }

    const setEl = () => {
      if ((ctx.caches[id]?.component as any)?.()) {
        ctx.setCaches(
          produce((data) => {
            data[id].hasEl = true
            data[id].owner = getOwner()
            for (const cb of data[id].aOnceSet || []) {
              cb()
            }
            delete data[id].aOnceSet
          }),
        )
        return true
      }
    }

    createEffect(() => {
      const cache = ctx.caches[id]
      if (!cache || !myRoute()) return

      if (routeRefresh && !isolated && !cache.childIds?.size) {
        routeRefresh = false
      }
      if (!cache.init && (cache.hasEl || setEl())) {
        ctx.setCaches(id, "init", true)
        for (const cb of cache.aSet || []) {
          cb()
        }
      }
    })

    onCleanup(() => {
      const cache = ctx.caches[id]
      if (!isolated && (routeRefresh || !cache)) return

      // 循环删除 currentIds 中的子id
      // 在销毁一个组件时, 如果其 没有 父级, 就表明它本身是一个根级别的组件, 就去清空 currentIds
      if (!cache.parentId) ctx.currentIds.clear()
      else if (ctx.currentIds.has(id)) {
        const delCurrIds = (ids: Array<string> | Set<string>) => {
          for (const _id of ids) {
            ctx.currentIds.delete(_id)
            const childIds = ctx.caches[_id]?.childIds
            childIds?.size && delCurrIds(childIds)
          }
        }
        delCurrIds([id])
      }

      if (!myRoute()) return

      const needCache = !cache.noCache && cache.hasEl

      needCache && ctx.setCaches(id, "init", false)

      for (const cb of cache.dSet || []) {
        cb()
      }
      /** 已删除页面 与 未缓存的页面 的数据清空*/
      needCache ||
        ctx.setCaches(
          produce((data) => {
            data[id].parentId && data[data[id].parentId]?.childIds?.delete(id)
            data[id].dispose?.()
            delete data[id]
          }),
        )
    })

    /** !!!组件是否要展示 , 为什么要写这个 : 因为在多个路由都缓存的情况下, 子路由会加入 所有未被销毁的父路由中, 暂时没有办法解决 */
    return (
      myRoute() &&
      runWithOwner(ctx.caches[id].owner, () => ctx.caches[id].component)
    )
  }
}
export default aliveTransfer
