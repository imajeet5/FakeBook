import React, { useContext, useEffect } from 'react';
import Page from './Page';
import { useParams, NavLink, Switch, Route } from 'react-router-dom';
import Axios from 'axios';
import StateContext from '../contexts/StateContext';
import ProfilePost from './ProfilePost';
import { useImmer } from 'use-immer';
import ProfileFollowers from './ProfileFollowers';
import ProfileFollowing from './ProfileFollowing';

export default function Profile() {
  const { username } = useParams();
  const appState = useContext(StateContext);
  const [state, setState] = useImmer({
    followActionLoading: false,
    startFollowingRequestCount: 0, //just to trigger use effect
    stopFollowingRequestCount: 0, // to trigger use effect
    profileData: {
      profileUsername: '...',
      profileAvatar: 'https://gravatar.com/avatar/placeholder?s=128',
      isFollowing: false,
      counts: { postCount: '', followerCount: '', followingCount: '' },
    },
  });

  // to fetch profile data whenever the username in Params changes
  useEffect(() => {
    const currentRequest = Axios.CancelToken.source();
    async function fetchData() {
      try {
        const response = await Axios.post(
          `/profile/${username}`,
          {
            token: appState.user.token,
          },
          { cancelToken: currentRequest.token }
        );
        setState((draft) => {
          // either we need to return a new value or modify the draft
          // we cannot do both
          draft.profileData = response.data;
        });
      } catch (error) {
        console.error(error);
      }
    }
    fetchData();
    return () => {
      currentRequest.cancel();
    };
  }, [username]);

  // to update the follower in db when ever follower is added
  useEffect(() => {
    if (state.startFollowingRequestCount) {
      setState((draft) => {
        draft.followActionLoading = true;
      });
      const currentRequest = Axios.CancelToken.source();

      async function fetchData() {
        try {
          const response = await Axios.post(
            `/addFollow/${state.profileData.profileUsername}`,
            {
              token: appState.user.token,
            },
            { cancelToken: currentRequest.token }
          );
          setState((draft) => {
            draft.profileData.isFollowing = true;
            draft.profileData.counts.followerCount++;
            draft.followActionLoading = false;
          });
        } catch (error) {
          console.error(error);
        }
      }
      fetchData();
      return () => {
        currentRequest.cancel();
      };
    }
  }, [state.startFollowingRequestCount, username]);

  // to update the follower in db whenever the follower count decreases
  useEffect(() => {
    if (state.stopFollowingRequestCount) {
      setState((draft) => {
        draft.followActionLoading = true;
      });

      const ourRequest = Axios.CancelToken.source();

      async function fetchData() {
        try {
          const response = await Axios.post(
            `/removeFollow/${state.profileData.profileUsername}`,
            { token: appState.user.token },
            { cancelToken: ourRequest.token }
          );
          setState((draft) => {
            draft.profileData.isFollowing = false;
            draft.profileData.counts.followerCount--;
            draft.followActionLoading = false;
          });
        } catch (e) {
          console.log('There was a problem.');
        }
      }
      fetchData();
      return () => {
        ourRequest.cancel();
      };
    }
  }, [state.stopFollowingRequestCount]);

  function startFollowing() {
    setState((draft) => {
      draft.startFollowingRequestCount++;
    });
  }

  function stopFollowing() {
    setState((draft) => {
      draft.stopFollowingRequestCount++;
    });
  }

  return (
    /* eslint-disable */
    <Page title="Profile">
      <h2>
        <img
          className="avatar-small"
          src={state.profileData.profileAvatar}
          alt="Profile"
        />{' '}
        {state.profileData.profileUsername}
        {appState.loggedIn &&
          !state.profileData.isFollowing &&
          appState.user.username != state.profileData.profileUsername &&
          state.profileData.profileUsername != '...' && (
            <button
              onClick={startFollowing}
              disabled={state.followActionLoading}
              className="btn btn-primary btn-sm ml-2"
            >
              Follow <i className="fas fa-user-plus"></i>
            </button>
          )}
        {appState.loggedIn &&
          state.profileData.isFollowing &&
          appState.user.username != state.profileData.profileUsername &&
          state.profileData.profileUsername != '...' && (
            <button
              onClick={stopFollowing}
              disabled={state.followActionLoading}
              className="btn btn-danger btn-sm ml-2"
            >
              Stop Following <i className="fas fa-user-times"></i>
            </button>
          )}
      </h2>

      <div className="profile-nav nav nav-tabs pt-2 mb-4">
        <NavLink
          exact
          to={`/profile/${state.profileData.profileUsername}`}
          className="nav-item nav-link"
        >
          Posts: {state.profileData.counts.postCount}
        </NavLink>
        <NavLink
          to={`/profile/${state.profileData.profileUsername}/followers`}
          className="nav-item nav-link"
        >
          Followers: {state.profileData.counts.followerCount}
        </NavLink>
        <NavLink
          to={`/profile/${state.profileData.profileUsername}/following`}
          className="nav-item nav-link"
        >
          Following: {state.profileData.counts.followingCount}
        </NavLink>
      </div>

      <Switch>
        <Route exact path="/profile/:username">
          <ProfilePost />
        </Route>
        <Route path="/profile/:username/followers">
          <ProfileFollowers
            followerCount={state.profileData.counts.followerCount}
          />
        </Route>
        <Route path="/profile/:username/following">
          <ProfileFollowing
            followerCount={state.profileData.counts.followerCount}
          />
        </Route>
      </Switch>
    </Page>
  );
}
