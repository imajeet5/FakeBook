import React, {useContext} from 'react';
import { Link } from 'react-router-dom';
import StateContext from '../contexts/StateContext';
import HeaderLoggedIn from './HeaderLoggedIn';
import HeaderLoggedOut from './HeaderLoggedOut';

export default function Header() {
  
  const appState = useContext(StateContext)
  
  return (
    <React.Fragment>
      <header className="header-bar bg-primary mb-3">
        <div className="container d-flex flex-column flex-md-row align-items-center p-3">
          <h4 className="my-0 mr-md-auto font-weight-normal">
            <Link to="/" className="text-white">
              ComplexApp
            </Link>
          </h4>
          {appState.loggedIn ? <HeaderLoggedIn /> : <HeaderLoggedOut />}
        </div>
      </header>
    </React.Fragment>
  );
}
