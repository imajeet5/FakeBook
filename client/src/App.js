import React, { useEffect } from 'react';
import Axios from 'axios';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { useImmerReducer } from 'use-immer';
import './App.css';
import About from './components/About';
import CreatePost from './components/CreatePost';
import Footer from './components/Footer';
import Header from './components/Header';
import Home from './components/Home';
import HomeGuest from './components/HomeGuest';
import Terms from './components/Terms';
import ViewSinglePost from './components/ViewSinglePost';
import FlashMessages from './components/FlashMessages';

import StateContext from './contexts/StateContext';
import DispatchContext from './contexts/DispatchContext';
import Profile from './components/Profile';
import EditPost from './components/EditPost';
import NotFound from './components/NotFound';

Axios.defaults.baseURL = 'http://localhost:8080';

function App() {
  // we can move this code by creating a wrapper component for the provider
  const initialState = {
    loggedIn: Boolean(localStorage.getItem('userToken')),
    flashMessages: [],
    user: {
      token: localStorage.getItem('userToken'),
      username: localStorage.getItem('userName'),
      avatar: localStorage.getItem('userAvatar'),
    },
  };

  function ourReducer(draft, action) {
    switch (action.type) {
      case 'login':
        draft.loggedIn = true;
        draft.user = action.data;
        break;
      case 'logout':
        draft.loggedIn = false;
        break;
      case 'flashMessage':
        draft.flashMessages.push(action.value);
        break;
      default:
        return state;
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState);

  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem('userToken', state.user.token);
      localStorage.setItem('userName', state.user.username);
      localStorage.setItem('userAvatar', state.user.avatar);
    } else {
      localStorage.removeItem('userToken', state.user.token);
      localStorage.removeItem('userName', state.user.username);
      localStorage.removeItem('userAvatar', state.user.avatar);
    }
  }, [state.loggedIn]);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages messages={state.flashMessages} />
          <Header />
          <Switch>
            <Route path="/profile/:username">
              <Profile />
            </Route>

            <Route path="/" exact>
              {state.loggedIn ? <Home /> : <HomeGuest />}
            </Route>
            <Route path="/post/:id" exact>
              <ViewSinglePost />
            </Route>
            <Route path="/post/:id/edit" exact>
              <EditPost />
            </Route>

            <Route path="/create-post">
              <CreatePost />
            </Route>
            <Route path="/about-us" exact>
              <About />
            </Route>
            <Route path="/terms" exact>
              <Terms />
            </Route>
            <Route>
              <NotFound/>
            </Route>
          </Switch>
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

export default App;

/**
 *  <About/>
    <Terms/>
    <HomeGuest />
 */
