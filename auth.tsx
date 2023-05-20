/** @format */

import React, {useReducer, createContext, Context, useContext, useCallback} from 'react'

const enum ACTION {
    LOGIN = 0,
    LOGOUT = 1,
    SETUSER = 2,
    ISLOADING = 3,
    NOTLOADING = 4,
    SetError = 5,
}
// state的类型,action的类型
type IAction = {type: ACTION; user?: IUser; error?: Error}
export type IState<T> = {isLogin: boolean; loading: boolean; error?: Error; user: T}
// reducer 的类型
type Reducer<T> = React.Reducer<IState<T>, IAction>

export type IUser = {
    uid: number
    nickname: string
}

const initState: IState<IUser> = {isLogin: false, loading: false, user: {uid: 0, nickname: ''}}
export const reducer: Reducer<IUser> = (state: IState<IUser>, action: IAction): IState<IUser> => {
    switch (action.type) {
        case ACTION.LOGIN:
            return {...state, isLogin: true}
        case ACTION.LOGOUT:
            return {...state, isLogin: false}
        case ACTION.SETUSER:
            return {...state, isLogin: false, user: action.user ?? state.user}
        case ACTION.ISLOADING:
            return {...state, loading: true}
        case ACTION.NOTLOADING:
            return {...state, loading: false}
        case ACTION.SetError:
            return {...state, error: action.error ?? Error('')}

        default:
            return state
    }
}
// 创建上下文实例
export const ProviderContext: Context<{
    state: IState<IUser>
    dispatch: React.Dispatch<IAction>
}> = createContext({
    state: initState,
    dispatch: (d: IAction) => {},
})
export const AuthProvider = (props: React.PropsWithChildren) => {
    const [state, dispatch] = useReducer<Reducer<IUser>>(reducer, initState)
    const child = React.useMemo(() => {
        return props.children
    }, [state])
    return <ProviderContext.Provider value={{state, dispatch}}>{child}</ProviderContext.Provider>
}
export const useAuth = () => {
    const {state, dispatch} = useContext(ProviderContext)
    // const nRef = React.useRef<number>(0)
    const setLoginStatus = (status: boolean) => {
        dispatch({type: status ? ACTION.LOGIN : ACTION.LOGOUT, user: state.user})
        // nRef.current += 1
    }
    const setLogin = () => {
        setLoginStatus(true)
    }
    const setLogout = () => {
        setLoginStatus(false)
    }
    const setUser = (u: IUser, render?: boolean) => {
        dispatch({type: ACTION.SETUSER, user: u})
        if (render === true) {
            //  nRef.current += 1
        }
    }
    const setLoading = (status: boolean) => {
        dispatch({type: status ? ACTION.ISLOADING : ACTION.NOTLOADING, user: state.user})
        // nRef.current += 1
    }
    const setError = (err: Error) => {
        dispatch({type: ACTION.SetError, error: err})
    }
    return {
        loadding: state.loading,
        isLogin: state.isLogin,
        setLogin,
        setLogout,
        setUser,
        setLoading,
        setError,
        error: state.error,
        user: state.user,
    }
}

export const useLogin = (login: Promise<IUser>, auto: boolean = true) => {
    const {isLogin, setUser, setLogin, loadding, setLoading, setError, error, user} = useAuth()
    const run = React.useCallback(async () => {
        setLoading(true)
        login
            .then(user => {
                setUser(user)
                setLogin()
            })
            .catch(e => {
                setError(e)
            })
            .finally(() => {
                setLoading(false)
            })
    }, [login, auto])
    React.useEffect(() => {
        auto && run()
    }, [])
    return {isLogin, loadding, error, user, login}
}
export const useLogout = (logout: Promise<IUser>, auto = true) => {
    const {isLogin, setUser, setLogout, loadding, setLoading, setError, error, user} = useAuth()
    const run = useCallback(async () => {
        setLoading(true)
        logout
            .then(user => {
                setUser(user)
                setLogout()
            })
            .catch(e => {
                setError(e)
            })
            .finally(() => {
                setLoading(false)
            })
    }, [logout, auto])
    React.useEffect(() => {
        auto && run()
    }, [])
    return {isLogin, loadding, error, user}
}
