import { onCleanup, useContext } from "solid-js"
import { ChildContext, Context } from "./context"

import type { Activate } from "./types"

const _ = (t: Activate, cb: () => void) => {
  if (typeof cb !== "function") return
  const { id, noCache } = useContext(ChildContext) || {}
  if (noCache && t !== "aOnceSet") return
  const ctx = useContext(Context)
  if (!id || !ctx) return
  ctx.setActive(id, t, cb, "add")
  t !== "aOnceSet" &&
    onCleanup(() => {
      ctx.setActive(id, t, cb, "delete")
    })
}
/**
 *  @description 进入缓存
 * ```tsx
 * import { onActivated } from 'solid-keepalive'
 * //use
 * onActivated(()=> console.log(234))
 * ```
 */
export const onActivated = (cb: () => void) => {
  _("aSet", cb)
}

/**
 * @description  离开缓存
 * ```tsx
 * import { onDeactivated } from 'solid-keepalive'
 * onDeactivated(()=> console.log(234))
 * ```
 */
export const onDeactivated = (cb: () => void) => {
  _("dSet", cb)
}

/**
 * @description  进入缓存,只会执行一次
 * ```tsx
 * import { onActivatedOnce } from 'solid-keepalive'
 * onDeactivated(()=> console.log(234))
 * ```
 */
export const onActivatedOnce = (cb: () => void) => {
  _("aOnceSet", cb)
}
