import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';
import { MuiThemeProvider, CssBaseline } from '@material-ui/core';

import Examples from './Examples';
import { darkTheme } from './themes';

ReactDOM.render((
  <HashRouter>
    <MuiThemeProvider theme={darkTheme}>
      <CssBaseline/>
      <Examples/>
    </MuiThemeProvider>
  </HashRouter>
), document.getElementById('app'));
