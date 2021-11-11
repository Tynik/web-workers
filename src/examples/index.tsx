import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { MuiThemeProvider, CssBaseline } from '@material-ui/core';

import Examples from './Examples';
import { darkTheme } from './themes';

ReactDOM.render((
  <BrowserRouter>
    <MuiThemeProvider theme={darkTheme}>
      <CssBaseline/>
      <Examples/>
    </MuiThemeProvider>
  </BrowserRouter>
), document.getElementById('app'));
