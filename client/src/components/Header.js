import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import StateContext from '../contexts/StateContext';
import HeaderLoggedIn from './HeaderLoggedIn';
import HeaderLoggedOut from './HeaderLoggedOut';

export default function Header({ staticEmpty }) {
  const appState = useContext(StateContext);
  const headerContent = appState.loggedIn ? (
    <HeaderLoggedIn />
  ) : (
    <HeaderLoggedOut />
  );

  return (
    <React.Fragment>
      <header className="header-bar bg-primary mb-3">
        <div className="container d-flex flex-column flex-md-row align-items-center p-3">
          <h4 className="my-0 mr-md-auto font-weight-normal">
            <Link to="/" className="text-white">
              FakeBook
            </Link>
          </h4>
          {!staticEmpty ? headerContent : ''}
        </div>
      </header>
    </React.Fragment>
  );
}
