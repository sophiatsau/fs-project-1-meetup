import { csrfFetch } from "./csrf";
import attendeesReducer from "./attendees";
import { GET_ALL_ATTENDEES, DELETE_ATTENDANCE, UPDATE_ATTENDANCE, REQUEST_ATTENDANCE } from "./actions";
import { REMOVE_USER } from "./session";

const GET_ALL_EVENTS = 'events/getAllEvents';
export const GET_ONE_EVENT = 'events/getOneEvent';
const GET_GROUP_EVENTS = 'groups/getGroupEvents';
export const CREATE_EVENT = 'events/createEvent';
export const DELETE_EVENT = 'events/deleteEvent'

const getAllEvents = (events) => {
    return {
        type: GET_ALL_EVENTS,
        events
    }
}

const getOneEvent = (event) => {
    return {
        type: GET_ONE_EVENT,
        event,
    }
}

const getGroupEvents = (events) => {
    return {
        type: GET_GROUP_EVENTS,
        events,
    }
}

const createEvent = (event) => {
    return {
        type: CREATE_EVENT,
        event,
    }
}

const deleteEvent = (eventId) => {
    return {
        type: DELETE_EVENT,
        eventId,
    }
}

export const fetchAllEvents = () => async dispatch => {
    const res = await csrfFetch(`/api/events`);
    const data = await res.json();

    dispatch(getAllEvents(data.Events));
    return data;
}

export const fetchEventById = (eventId) => async (dispatch) => {
    const res = await csrfFetch(`/api/events/${eventId}`);
    const data = await res.json();

    if (res.ok) {
        dispatch(getOneEvent(data));
    }
    return data;
}

export const fetchEventsByGroup = (groupId) => async dispatch => {
    try {
        const res = await csrfFetch(`/api/groups/${groupId}/events`);
        const data = await res.json();
        if (res.ok) dispatch(getGroupEvents(data.Events));
        return data.Events;
    } catch (e) {
        console.log(e, 'caught')
        const data = await e.json();
        return data;
    }
}

export const createNewEvent = (payload) => async dispatch => {
    const {url, groupId, ...newEvent} = payload;

    const eventRes = await csrfFetch(`/api/groups/${groupId}/events`, {
        method: 'POST',
        body: JSON.stringify(newEvent)
    })

    const eventData = await eventRes.json();

    const resImage = await csrfFetch(`/api/events/${eventData.id}/images`, {
        method: 'POST',
        body: JSON.stringify({url, preview: true})
    })

    const dataImage = await resImage.json();

    if (eventRes.status < 400 && resImage.ok) {
        eventData.previewImage = dataImage
        dispatch(createEvent(eventData))
    }

    return [eventData, dataImage]
}

export const deleteOneEvent = (eventId) => async dispatch => {
    const res = await csrfFetch(`/api/events/${eventId}`, {
        method: 'DELETE'
    })

    if (res.ok) {
        dispatch(deleteEvent(eventId));
    }

    return res;
}

export const consumeAllEvents = () => (state) => Object.values(state.events.allEvents);

export const consumeGroupEvents = () => (state) => {
    return Object.values(state.events.allEvents)
        .filter(event => event.groupId === state.groups.singleGroup.id)
}

export const consumeOneEvent = () => (state) => state.events.singleEvent;


export function sortEvents(events) {
    events.forEach(event => event.startDate = new Date(event.startDate).getTime());

    //test past events
    // events.push({name: "old event", previewImage: null, startDate: new Date('10/20/23'), Group: {id: 1, name: 'Evening Tennis on the Water', city: 'New York', state: 'NY'}})
    // events.push({name: "old event", previewImage: null, startDate: new Date('10/21/23'), Group: {id: 1, name: 'Evening Tennis on the Water', city: 'New York', state: 'NY'}})
    // events.push({name: "old event", previewImage: null, startDate: new Date('10/19/23'), Group: {id: 1, name: 'Evening Tennis on the Water', city: 'New York', state: 'NY'}})

    events = events.sort((a,b) => {
      return a.startDate > b.startDate ? 1 : -1;
    });

    const index = events.findIndex(event => event.startDate > new Date().getTime());

    const pastEvents = (events.slice(0,index)).reverse();
    const upcomingEvents = events.slice(index)

    return [upcomingEvents, pastEvents];
}


const initialState={allEvents: {}, singleEvent: {}};

const eventsReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_ALL_EVENTS: {
            const allEvents = {};
            action.events.forEach(event => {
                allEvents[event.id] = event;
            })
            return {...state, allEvents};
        }
        case GET_ONE_EVENT: {
            // return {...state, [action.event.id]: action.event};
            return {...state,
                singleEvent: {
                    ...action.event,
                    // Attendees: attendeesReducer(state.singleEvent, action)
                }
            }
        }
        case GET_GROUP_EVENTS: {
            const allEvents = {...state.allEvents};

            action.events.forEach(event => {
                allEvents[event.id] = event;
            })
            return {...state, allEvents};
        }
        case CREATE_EVENT: {
            return {
                allEvents: {
                    ...state.allEvents,
                    [action.event.id]: action.event
                },
                singleEvent: {...action.event, Attendees: []}
            };
        }
        case DELETE_EVENT: {
            const newState = {...state, singleEvent: {}};
            delete newState.allEvents[action.eventId];
            return newState;
        }
        case GET_ALL_ATTENDEES: {
            return {...state,
                singleEvent: {
                    ...state.singleEvent,
                    Attendees: attendeesReducer(state.singleEvent.Attendees, action)
                }
            }
        }
        case DELETE_ATTENDANCE:
        case UPDATE_ATTENDANCE:
        case REMOVE_USER:
        case REQUEST_ATTENDANCE: {
            const newState = {...state,
                singleEvent: {
                    ...state.singleEvent,
                    Attendees: attendeesReducer(state.singleEvent.Attendees, action)
                }
            }
            newState.singleEvent.numAttending = newState.singleEvent.Attendees.filter(attendee => attendee.Attendance.status==="attending").length

            return newState
        }
        default:
            return state;
    }
};

export default eventsReducer;
