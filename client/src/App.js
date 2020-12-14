import React, { useEffect } from 'react';
import Axios from 'axios';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { useImmerReducer } from 'use-immer';
import { CSSTransition } from 'react-transition-group';
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
import Search from './components/Search';
import Chat from './components/Chat';

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
    isSearchOpen: false,
    isChatOpen: false,
    unreadChatCount: 0,
  };

  function ourReducer(draft, action) {
    switch (action.type) {
      case 'login':
        draft.loggedIn = true;
        draft.user = action.data;
        break;
      case 'logout':
        draft.loggedIn = false;
        draft.user.token = null;
        draft.user.username = null;
        draft.user.avatar = null;
        break;
      case 'flashMessage':
        draft.flashMessages.push(action.value);
        break;
      case 'openSearch':
        draft.isSearchOpen = true;
        return;
      case 'closeSearch':
        draft.isSearchOpen = false;
        return;
      case 'toggleChat':
        draft.isChatOpen = !draft.isChatOpen;
        return;
      case 'closeChat':
        draft.isChatOpen = false;
        return;
      case 'incrementUnreadChatCount':
        draft.unreadChatCount++;
        return;
      case 'clearUnreadChatCount':
        draft.unreadChatCount = 0;
        return;
      default:
        return;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              <NotFound />
            </Route>
          </Switch>
          <CSSTransition
            timeout={300}
            in={state.isSearchOpen}
            classNames="search-overlay"
            unmountOnExit
          >
            <Search />
          </CSSTransition>
          <Chat />
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
