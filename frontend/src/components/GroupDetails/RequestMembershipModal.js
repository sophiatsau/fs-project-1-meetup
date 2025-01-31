import React from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useModal } from '../../context/Modal'

import { consumeOneGroup } from '../../store/groups'
import { thunkRequestMembership } from '../../store/members'

export default function RequestMembershipModal() {
    const {closeModal} = useModal()
    const dispatch = useDispatch()

    // const user = useSelector(state => state.session.user)
    const group = useSelector(consumeOneGroup())


    // const status = user.memberships[group.id]

    const requestMembership = async () => {
        const res = await dispatch(thunkRequestMembership(group.id))
        if (process.env.NODE_ENV !== "production") {
            console.log("🚀 ~ requestMembership ~ res:", res)
        }
        // TODO: confirmation success?
        closeModal()
    }

    return (
        <div>
            <h2>Request membership to {group.name}?</h2>
            <div className='yes-no-buttons'>
                <button onClick={requestMembership}>Yes</button>
                <button onClick={closeModal}>No</button>
            </div>
        </div>
    )
}
