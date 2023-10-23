import {useEffect, useState} from 'react';
import { useDispatch} from "react-redux";
import * as sessionActions from "../../store/session";

import { useModal } from '../../context/Modal';
import './SignupForm.css';

export default function SignupFormModal() {
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [disabled, setDisabled] = useState(true);
    const dispatch = useDispatch();
    const { closeModal } = useModal();

    useEffect(() => {
        if (username.length>=4 && firstName && lastName && email && password.length>=6 && confirmPassword) setDisabled(false);
        else setDisabled(true)
    }, [username, firstName, lastName, email, password, confirmPassword])

    const handleSubmit = (e) => {
        e.preventDefault();

        if (password===confirmPassword) {
            setErrors({});

            return dispatch(sessionActions.signup({
                email,
                username,
                firstName,
                lastName,
                password,
            }))
            .then(closeModal)
            .catch(async (res) => {
                const data = await res.json();
                if (data && data.errors) {
                    //make sure there are errors before setting
                    setErrors(data.errors);
                }
            })
        }

        return setErrors({
            confirmPassword: "Confirm Password field must be the same as the Password field"
          });
    }

    return (
        <>
        <h1>Sign Up</h1>
        <form onSubmit={handleSubmit}>
            <label>
            Email
            <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            </label>
            {errors.email && <p>{errors.email}</p>}
            <label>
            Username
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />
            </label>
            {errors.username && <p>{errors.username}</p>}
            <label>
            First Name
            <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
            />
            </label>
            {errors.firstName && <p>{errors.firstName}</p>}
            <label>
            Last Name
            <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
            />
            </label>
            {errors.lastName && <p>{errors.lastName}</p>}
            <label>
            Password
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            </label>
            {errors.password && <p>{errors.password}</p>}
            <label>
            Confirm Password
            <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
            />
            </label>
            {errors.confirmPassword && <p>{errors.confirmPassword}</p>}
            <button type="submit" disabled={disabled}>Sign Up</button>
        </form>
        </>
    )
}
