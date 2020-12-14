/* eslint-disable react-hooks/exhaustive-deps */
import Axios from 'axios';
import React, { useEffect, useContext } from 'react';
import { useImmer } from 'use-immer';
import DispatchContext from '../contexts/DispatchContext';
import Post from './Post';

function Search() {
  const appDispatch = useContext(DispatchContext);

  // useImmer is very similar to use state
  // immer will make it easy to update one of the properties again in the future when we call set state
  // using this we can have multiple properties in one state, instead of having five different states
  // then immer makes it very easy to update one of those in an immutable fashion
  const [state, setState] = useImmer({
    searchTerm: '',
    results: [],
    show: 'neither',
    requestCount: 0,
  });

  // for adding event listener when the component mounts
  useEffect(() => {
    document.addEventListener('keyup', searchKeyPressHandler);
    return () => document.removeEventListener('keyup', searchKeyPressHandler);
  }, []);

  // for listening to the search term and updating the state when the search term changes
  // this will update the request count variable and set the loader to loading
  useEffect(() => {
    if (state.searchTerm.trim()) {
      setState((draft) => {
        draft.show = 'loading';
      });
      const delay = setTimeout(() => {
        setState((draft) => {
          draft.requestCount++;
        });
      }, 750);

      return () => clearTimeout(delay);
    } else {
      setState((draft) => {
        draft.show = 'neither';
      });
    }
  }, [state.searchTerm]);

  // this will run when request count changes
  // after fetching the results this will set the result to state and set loader state to show
  useEffect(() => {
    if (state.requestCount) {
      const ourRequest = Axios.CancelToken.source();
      async function fetchResults() {
        try {
          const response = await Axios.post(
            '/search',
            { searchTerm: state.searchTerm },
            { cancelToken: ourRequest.token }
          );

          setState((draft) => {
            draft.results = response.data;
            draft.show = 'results';
          });
        } catch (e) {
          console.log('There was a problem or the request was cancelled.');
        }
      }
      fetchResults();
      return () => ourRequest.cancel();
    }
  }, [state.requestCount]);

  function searchKeyPressHandler(e) {
    if (e.keyCode === 27) {
      appDispatch({ type: 'closeSearch' });
    }
  }

  function handleInput(e) {
    const value = e.target.value;
    setState((draft) => {
      draft.searchTerm = value;
    });
  }

  return (
    <div className="search-overlay">
      <div className="search-overlay-top shadow-sm">
        <div className="container container--narrow">
          <label htmlFor="live-search-field" className="search-overlay-icon">
            <i className="fas fa-search"></i>
          </label>
          <input
            autoFocus
            type="text"
            autoComplete="off"
            id="live-search-field"
            className="live-search-field"
            placeholder="What are you interested in?"
            onChange={handleInput}
          />
          <span
            onClick={() => appDispatch({ type: 'closeSearch' })}
            className="close-live-search"
          >
            <i className="fas fa-times-circle"></i>
          </span>
        </div>
      </div>

      <div className="search-overlay-bottom">
        <div className="container container--narrow py-3">
          <div
            className={
              'circle-loader ' +
              (state.show === 'loading' ? 'circle-loader--visible' : '')
            }
          ></div>
          <div
            className={
              'live-search-results ' +
              (state.show === 'results' ? 'live-search-results--visible' : '')
            }
          >
            {Boolean(state.results.length) ? (
              <div className="list-group shadow-sm">
                <div className="list-group-item active">
                  <strong>Search Results</strong> ({state.results.length}{' '}
                  {state.results.length > 1 ? 'items' : 'item'} found)
                </div>
                {state.results.map((post) => (
                  <Post
                    post={post}
                    key={post._id}
                    onClick={() => appDispatch({ type: 'closeSearch' })}
                  />
                ))}
              </div>
            ) : (
              <p className="alert alert-danger text-center shadow-sm">
                Sorry, we could not find any results for the search
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Search;
