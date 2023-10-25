import React, { useEffect, useState } from 'react';
import {useParams, useHistory} from 'react-router-dom'
import {useDispatch, useSelector} from 'react-redux'

import {fetchGroupById, consumeOneGroup, fetchEventsByGroup } from '../../store/groups';
import { sortEvents } from '../../store/events';

import GroupEvents from './GroupEvents';
import BreadcrumbLink from '../BreadcrumbLink';
import GroupDetailsInfo from './GroupDetailsInfo';

import './GroupDetails.css';

export default function GroupDetails() {
  const {groupId} = useParams();
  const dispatch = useDispatch();
  const history = useHistory()

  const group = useSelector(consumeOneGroup(groupId))

  let events = useSelector((state) => Object.values(state.groups.events));

  const [upcomingEvents, pastEvents] = events ? sortEvents(events) : [[],[]];

  useEffect(() => {
    async function getGroup() {
        return await dispatch(fetchGroupById(groupId))
            .catch(async (res) => {
                const data = await res.json();
                console.log(data.title, '-', data.message)
                history.push('/not-found')
            })
    }
    getGroup()

  }, [groupId, dispatch])

  useEffect(() => {
    (async () => {
      await dispatch(fetchEventsByGroup(groupId));
    })()
  }, [dispatch])

  return (
    <>
    <BreadcrumbLink to="/groups" text="Groups"/>
    <GroupDetailsInfo group={group}/>
    <GroupEvents type="Upcoming" events={upcomingEvents} />
    <GroupEvents type="Past" events={pastEvents} />
    {(!upcomingEvents.length&&!pastEvents.length) && <h2>No Upcoming Events</h2>}
    </>
  )
}
