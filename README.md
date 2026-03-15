# solid-keep-alive

#### 安装(install)

- pnpm add @iuxs/solid-keep-alive / npm i @iuxs/solid-keep-alive / yarn add @iuxs/solid-keep-alive

#### 参数(describe)

- **AliveProvider**
  - children :JSXElement 必须
  - include : [] 缓存的id 数组, 默认都不缓存, 如 ["home",'abc'], 当你 删除一个缓存时, 父id与子id要一起删除

- **aliveTransfer**
  - component : JSXElement, 必须
  - id : string 保存的唯一值, 如 home, 在AliveProvider 的 include 要包括这些id 才会缓存, 必须
  - params : Object
    - isolated : 单独组件, 当不是Route组件 时使用, 默认false, !!!不要在已缓存的组件中使用,不要在已缓存的组件中使用,不要在已缓存的组件中使用

- **onActivated** : 激活缓存页面时会触发的函数
- **onDeactivated** : 离开缓存页面时会触发的函数
- **useAliveContext** : 父子缓存路由会有 Context 时, 可能会用到的hooks
<!-- - aliveFrozen: 在你重新生成 Route 时 , 要执行这个函数 1iuxs -->

#### 使用(use)

1. AliveProvider

```tsx
// src/index.tsx
import { render } from "solid-js/web"

import { AliveProvider, aliveTransfer } from "@iuxs/solid-keep-alive"
// import { userInfo } from "./store/userInfo.ts"

import "@/assets/css/index.css"
// import Container from "./layout/Container/index.tsx"

import { lazy, type Component, For } from "solid-js"
import { Route, Router } from "@solidjs/router"

// 使用 import.meta.glob 动态导入所有组件
// const modules = import.meta.glob<{ default: Component<any> }>([
//   "./view/**/**.tsx",
//   "./view/**.tsx",
// ])
// const transferRouter = (data: MenuData[]) => (
//   <For each={data}>
//     {(item) => {
//       let module = modules[`./view${item.realPath}`]
//       if (!module) return null
//       return (
//         <Route
//           component={aliveTransfer(lazy(module), item.id)}
//           path={item.path}
//         >
//           {item.children ? transferRouter(item.children) : null}
//         </Route>
//       )
//     }}
//   </For>
// )

// 导入 Home 组件
// import Home from "@/view/Home/index.tsx"
// const Home1 = aliveTransfer(Home, "home")

render(
  () => (
    <AliveProvider include={["home", "about"]}>
      {/* 1 */}
      {/* <App /> */}
      {/* 2 */}
      {/* <Router root={Container} children={routes} /> */}
      {/* 3 */}
      <Router children={routes} />
      {/* 4 */}
      {/* <Router root={Container}>
        {transferRouter([])}
      </Router> */}
      {/* 5 */}
      {/* <Router root={Container}>
        <Route path={"/cart"} component={Hom1}>
          <Route path={""} component={G1}></Route>
          <Route path={"h"} component={H1}></Route>
        </Route>
      </Router> */}
    </AliveProvider>
  ),
  document.getElementById("root")!,
)
```

```tsx
// src/router/index.ts
import { lazy } from "solid-js"
import { aliveTransfer } from "@iuxs/solid-keep-alive"
const routes = [
  {
    path: "/",
    component: aliveTransfer(
      lazy(() => import("@/view/Home/index")),
      "home",
    ),
    children: [
      {
        path: "",
        component: aliveTransfer(
          lazy(() => import("@/view/Home/C")),
          "c",
          // {
          //   "isolated":true,
          // }
        ),
      },
    ],
  },
  {
    path: "/about",
    component: aliveTransfer(
      lazy(() => import("@/view/About/index")),
      "about",
    ),
  },
]

export default routes
```

2. Home 组件

```tsx
// src/view/Home/index.tsx

import { createContext, useContext } from "solid-js"
import { onActivated, onDeactivated, type Setter } from "@iuxs/solid-keep-alive"
import type { RouteSectionProps } from "@solidjs/router"
export const DataContext = createContext<{
  data: () => string
  setData: Setter<string>
}>()

export default function Home(props: RouteSectionProps) {
  const [data, setData] = createSignal("123")
  onActivated(() => {
    console.log("home - onActivated")
  })

  onDeactivated(() => {
    console.log("home - onDeactivated")
  })

  return (
    <ThemeContext.Provider value={{ data, setData }}>
      <div>
        home <button> 清除路由 </button>
        {props.children}
        <div>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut
          praesentium debitis dolorum sed dolorem doloremque aliquam beatae,
          architecto corrupti in qui, harum expedita voluptatum fugit
          necessitatibus suscipit! Animi, nemo quas! Lorem ipsum dolor sit amet
          consectetur adipisicing elit. Reiciendis, quaerat asperiores libero,
          quasi vitae hic officiis repellendus sint tempore totam saepe dolores
          dolorem magni ab suscipit magnam distinctio exercitationem omnis.
        </div>
      </div>
    </ThemeContext.Provider>
  )
}
```

3. Home 下的 子路由 c.tsx

```tsx
import { getOwner, useContext } from "solid-js"
import { onActivated, useAliveContext } from "@iuxs/solid-keep-alive"
import { DataContext } from "."

export default function C() {
  // no value
  const data = useContext(DataContext)
  // have value
  const data1 = useAliveContext(DataContext)
  console.log(data, "data")
  console.log(data1, "data1")
  onActivated(() => {
    console.log(getOwner())
    console.log("C - onActivated")
    // console.log(getOwner())
  })

  return (
    <div>
      ccccccccc <input type="text" /> {data?.value?.()}cccccc {data1?.value?.()}
    </div>
  )
}
```

4. isolated

```tsx
// @/layout/Container/index.tsx
import { aliveTransfer } from "@iuxs/solid-keep-alive"
import Aside from "xxxx"

import type { RouteSectionProps } from "@solidjs/router"

const Aside1 = aliveTransfer(Aside, "aside", { isolated: true })

/** 最外的容器 */
export function Container(props: RouteSectionProps) {
  return (
    <div class="container">
      {props.children}
      <Aside1 />
    </div>
  )
}
```

#### 已知问题(issue)

- 父子路由的 context 问题
- 多个已缓存的路由有子路由时, 未缓存的子路由 会共享子组件
- 如果父路由缓存, 子路由不缓存时会有 路由组件共享问题
