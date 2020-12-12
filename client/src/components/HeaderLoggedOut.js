import React, { useState, useContext } from 'react';
import Axios from 'axios';
import ExampleContext from '../contexts/ExampleContext';

export default function HeaderLoggedOut() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { setLoggedIn } = useContext(ExampleContext);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await Axios.post('/login', {
        username,
        password,
      });
      if (response.data) {
        localStorage.setItem('userToken', response.data.token);
        localStorage.setItem('userName', response.data.username);
        localStorage.setItem('userAvatar', response.data.avatar);
        console.log(response.data);
        setLoggedIn(true);
      } else {
        console.log('Incorrect username or password');
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-0 pt-2 pt-md-0">
      <div className="row align-items-center">
        <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
          <input
            name="username"
            className="form-control form-control-sm input-dark"
            type="text"
            placeholder="Username"
            autoComplete="off"
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
          <input
            name="password"
            className="form-control form-control-sm input-dark"
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="col-md-auto">
          <button className="btn btn-success btn-sm">Sign In</button>
        </div>
      </div>
    </form>
  );
}
