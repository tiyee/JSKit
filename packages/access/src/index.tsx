/** @format */
import React, {Fragment} from 'react'
export interface BasicState {
    hasLogin: boolean
}
export const useAccess = <T extends BasicState>(initialState: T) => {
    const {hasLogin} = initialState
    return {
        canReadFoo: hasLogin,

        canDeleteFoo: (s: string) => {
            return s === 'abc'
        },
    }
}
export interface IAccessProps {
    accessible: boolean
    fallback?: React.ReactNode
    children: React.ReactNode
}
export const Access = (props: IAccessProps) => {
    if (props.accessible) {
        return <Fragment>{props.children}</Fragment>
    } else if (props.fallback !== undefined) {
        return <Fragment>{props.fallback}</Fragment>
    }
    return <Fragment />
}
