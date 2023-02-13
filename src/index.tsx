import * as React from 'react';
import { PiletApi } from 'consolid-shell';
import Cookies from 'universal-cookie';
import App from './App'
import { Link } from 'react-router-dom';

export function setup(app: PiletApi) {
  const constants = app.getData("CONSTANTS")
  const connect = app.makeState(app, constants)
  const Module = connect(({state, actions}) => app.withState(App, {app, state, actions}))

  app.showNotification('Registered Project Pilet!', {
    autoClose: 2000,
  });
  app.registerMenu(() =>
    <Link to="/project" style={{marginLeft: 5, marginRight: 5}}>Project</Link>
  );
  app.registerPage("/project", Module)
  app.registerExtension(app.meta["link"], Module)
}
 